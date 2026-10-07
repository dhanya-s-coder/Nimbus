-- Nimbus RAG schema. Run once in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Idempotent: safe to run again.

create extension if not exists vector;

-- One row per ingested document (brand kit, past event, policy, contact list, upload...)
create table if not exists public.knowledge_sources (
    id            uuid primary key default gen_random_uuid(),
    owner_id      text,                                   -- Mongo user id; null for global knowledge
    scope         text not null default 'user' check (scope in ('user', 'global')),
    type          text not null default 'note',           -- brand_kit | past_event | policy | contact | template_copy | note | upload
    title         text not null,
    content_hash  text not null,
    metadata      jsonb not null default '{}'::jsonb,
    created_at    timestamptz not null default now()
);
create unique index if not exists knowledge_sources_dedupe
    on public.knowledge_sources (coalesce(owner_id, ''), scope, content_hash);
create index if not exists knowledge_sources_owner on public.knowledge_sources (owner_id, scope);

-- Searchable chunks (768-dim Gemini embeddings + full-text vector)
create table if not exists public.knowledge_chunks (
    id          uuid primary key default gen_random_uuid(),
    source_id   uuid not null references public.knowledge_sources(id) on delete cascade,
    owner_id    text,
    scope       text not null default 'user',
    type        text not null default 'note',
    chunk_index int  not null default 0,
    content     text not null,
    embedding   vector(768),
    metadata    jsonb not null default '{}'::jsonb,
    tsv         tsvector generated always as (to_tsvector('english', content)) stored,
    created_at  timestamptz not null default now()
);
create index if not exists knowledge_chunks_embedding on public.knowledge_chunks using hnsw (embedding vector_cosine_ops);
create index if not exists knowledge_chunks_tsv       on public.knowledge_chunks using gin (tsv);
create index if not exists knowledge_chunks_owner     on public.knowledge_chunks (owner_id, scope, type);

-- Audit trail for every generation (inputs, which chunks were used, output, latency)
create table if not exists public.generation_runs (
    id                  uuid primary key default gen_random_uuid(),
    user_id             text,
    kind                text not null,                    -- poster-content | report | email
    input               jsonb,
    retrieved_chunk_ids uuid[] not null default '{}',
    output              jsonb,
    provider            text,
    latency_ms          int,
    status              text not null default 'ok',
    error               text,
    created_at          timestamptz not null default now()
);
create index if not exists generation_runs_user on public.generation_runs (user_id, created_at desc);

-- Hybrid retrieval: reciprocal-rank fusion of vector similarity and full-text rank.
-- Visible rows = global knowledge + the caller's own.
create or replace function public.match_chunks(
    query_embedding vector(768),
    query_text      text,
    match_count     int default 6,
    p_owner         text default null,
    p_types         text[] default null
)
returns table (id uuid, source_id uuid, content text, type text, metadata jsonb, score float)
language sql stable
as $$
    with visible as (
        select c.* from public.knowledge_chunks c
        where (c.scope = 'global' or c.owner_id = p_owner)
          and (p_types is null or c.type = any(p_types))
    ),
    vec as (
        select v.id, row_number() over (order by v.embedding <=> query_embedding) as r
        from visible v where v.embedding is not null
        order by v.embedding <=> query_embedding
        limit match_count * 4
    ),
    fts as (
        select v.id, row_number() over (order by ts_rank_cd(v.tsv, websearch_to_tsquery('english', query_text)) desc) as r
        from visible v
        where query_text <> '' and v.tsv @@ websearch_to_tsquery('english', query_text)
        order by ts_rank_cd(v.tsv, websearch_to_tsquery('english', query_text)) desc
        limit match_count * 4
    ),
    fused as (
        select coalesce(vec.id, fts.id) as id,
               coalesce(1.0 / (60 + vec.r), 0) + coalesce(1.0 / (60 + fts.r), 0) as score
        from vec full outer join fts on vec.id = fts.id
    )
    select c.id, c.source_id, c.content, c.type, c.metadata, f.score::float
    from fused f join public.knowledge_chunks c on c.id = f.id
    order by f.score desc
    limit match_count;
$$;

-- Lock everything down: only the backend (secret/service-role key) can touch these tables.
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_chunks  enable row level security;
alter table public.generation_runs   enable row level security;
revoke all on function public.match_chunks(vector, text, int, text, text[]) from anon, authenticated;
