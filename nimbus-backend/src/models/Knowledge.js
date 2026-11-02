import mongoose from "mongoose";

/**
 * Knowledge base (RAG) stored in the same MongoDB as everything else: one database to run, back up and secure.
 *   KnowledgeSource  one document / note / reference poster, deduped by content hash per owner + scope
 *   KnowledgeChunk   its searchable pieces with 768-d embeddings
 *   GenerationRun    audit trail of grounded generations
 * Visible knowledge for a user = scope "global" (shared by an admin) + their own (scope "user").
 */

const KnowledgeSourceSchema = new mongoose.Schema({
    ownerId: { type: String, default: null },                       // Mongo user id; null for global knowledge
    scope: { type: String, enum: ["user", "global"], default: "user" },
    type: { type: String, default: "note" },                         // brand_kit | past_event | policy | contact | template_copy | note | upload | poster_style
    title: { type: String, required: true },
    contentHash: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: "createdAt", updatedAt: false } });
KnowledgeSourceSchema.index({ ownerId: 1, scope: 1, contentHash: 1 }, { unique: true });   // no duplicates per owner
KnowledgeSourceSchema.index({ scope: 1, ownerId: 1, createdAt: -1 });

const KnowledgeChunkSchema = new mongoose.Schema({
    sourceId: { type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeSource", required: true, index: true },
    ownerId: { type: String, default: null },
    scope: { type: String, default: "user" },
    type: { type: String, default: "note" },
    chunkIndex: { type: Number, default: 0 },
    content: { type: String, required: true },
    embedding: { type: [Number], default: undefined },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: "createdAt", updatedAt: false } });
KnowledgeChunkSchema.index({ scope: 1, ownerId: 1, type: 1 });

const GenerationRunSchema = new mongoose.Schema({
    userId: String,
    kind: { type: String, required: true },                          // poster-content | art-direction | report | email
    input: mongoose.Schema.Types.Mixed,
    retrievedChunkIds: [String],
    output: mongoose.Schema.Types.Mixed,
    provider: String,
    latencyMs: Number,
    status: { type: String, default: "ok" },
    error: String,
}, { timestamps: { createdAt: "createdAt", updatedAt: false } });
GenerationRunSchema.index({ userId: 1, createdAt: -1 });
GenerationRunSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 }); // audit rows expire after ~6 months

export const KnowledgeSource = mongoose.models.KnowledgeSource || mongoose.model("KnowledgeSource", KnowledgeSourceSchema);
export const KnowledgeChunk = mongoose.models.KnowledgeChunk || mongoose.model("KnowledgeChunk", KnowledgeChunkSchema);
export const GenerationRun = mongoose.models.GenerationRun || mongoose.model("GenerationRun", GenerationRunSchema);

export const dbReady = () => mongoose.connection.readyState === 1;
