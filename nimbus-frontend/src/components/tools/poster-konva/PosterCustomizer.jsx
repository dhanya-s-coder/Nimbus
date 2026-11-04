import React, { useEffect, useRef, useState } from 'react';
import PosterStage from './PosterStage';
import { PALETTES } from './data/palettes';
import { getDesignRecipes } from './data/autoDesigner';
import { SIZES } from './engine/constants';
import TypeControls from './editor/TypeControls';
import DesignPanel, { AddSection, LayersSection, SelectedSection } from './editor/DesignPanel';
import { isElementId } from './editor/elements';
import { CONTENT_FIELD, INFO_IDS, EXTRA_IDS, isEdited, valueToText, textToValue } from './editor/content';
import { roleKeys } from './engine/typography';
import { labelFor } from './engine/edit';
import { piecesFor } from './engine/decorLabels';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { MORE_LAYOUTS, LAYOUT_NAMES } from './layouts';
import './poster-customizer.css';

// built-in elements that are text (can be restyled in the Edit tab)
const TEXT_IDS = ['title', 'sub', 'desc', 'org', 'spk', 'des', 'extra', 'footer', 'kicker', 'tag', 'info', 'grid', 'cards', 'infostack'];
const ELEMENT_STYLE_KEYS = ['font', 'weight', 'italic', 'case', 'tracking', 'lineHeight', 'align', 'color', 'opacity', 'shadow'];
const CLEAR_STYLE = Object.fromEntries(ELEMENT_STYLE_KEYS.map((k) => [k, undefined]));
// user-added text: map the stored field names onto the shared style shape and back
const extraToStyle = (e) => ({ font: e.font, weight: e.weight, italic: e.italic, case: e.case, tracking: e.letterSpacing, lineHeight: e.lineHeight, align: e.align || 'center', color: e.color, opacity: e.opacity, shadow: e.shadow });
const styleToExtra = (p) => { const { tracking, ...rest } = p; return 'tracking' in p ? { ...rest, letterSpacing: tracking } : rest; };

const TABS = [
    { id: 'edit', label: '✏️ Edit' },
    { id: 'layout', label: 'Layouts' },
    { id: 'design', label: 'Design' },
    { id: 'color', label: 'Colors' },
    { id: 'photo', label: 'Photo' },
    { id: 'size', label: 'Size' },
];

const THUMB_W = 112;

/** Edit the words of the selected poster element (title, subtitle, details ...). Layout re-fits automatically. */
const WordingEditor = ({ id, data, content, onContent, onReset }) => {
    const field = CONTENT_FIELD[id];
    const edited = isEdited(id, content);
    const reset = edited ? <button className="pc-link" onClick={() => onReset(id)}>Reset text</button> : null;
    if (field) {
        return (
            <label className="pc-row"><span>Text {reset}</span>
                <textarea className="pc-textarea" rows={id === 'desc' ? 4 : 2} value={data[field] || ''} onChange={(e) => onContent({ [field]: e.target.value })} aria-label="Text" />
            </label>
        );
    }
    if (INFO_IDS.includes(id) && data.infoItems?.length) {
        const set = (i, patch) => onContent({ infoItems: data.infoItems.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
        return (
            <div className="pc-row"><span>Details {reset}</span>
                {data.infoItems.map((it, i) => (
                    <div className="pc-pair" key={i}>
                        <input value={it.label} onChange={(e) => set(i, { label: e.target.value })} aria-label={`Label ${i + 1}`} />
                        <input value={it.value} onChange={(e) => set(i, { value: e.target.value })} aria-label={`Value ${i + 1}`} />
                    </div>
                ))}
            </div>
        );
    }
    if (EXTRA_IDS.includes(id) && data.extraItems?.length) {
        const set = (i, patch) => onContent({ extraItems: data.extraItems.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
        return (
            <div className="pc-row"><span>Extra details {reset}</span>
                {data.extraItems.map((it, i) => (
                    <div className="pc-pair stacked" key={i}>
                        <input value={it.label} onChange={(e) => set(i, { label: e.target.value })} aria-label={`Heading ${i + 1}`} />
                        <textarea className="pc-textarea" rows={2} value={valueToText(it.value)} onChange={(e) => set(i, { value: textToValue(e.target.value) })} aria-label={`Text ${i + 1}`} />
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

/**
 * Canva-style tweaking for a generated poster. Everything is stored in `recipe` (+ `custom`),
 * which is saved with the poster, so edits survive Save Draft / reload.
 */
const PosterCustomizer = ({
    template, recipe, custom, onRecipe, onCustom, data, photo, onShuffle, onNewBackground, onUploadPhoto, busy,
    onEditing, selectedId, onSelect, onUndo, onRedo, canUndo, canRedo, onResetAll, onUpdateExtra,
    onResetElement, onDeleteElement, onRestore, onTypography, onResetTypography, onStyleElement, design, onContent, onResetContent,
}) => {
    const [tab, setTab] = useState(() => (process.env.NODE_ENV !== 'production' && new URLSearchParams(window.location.search).get('tab')) || 'layout');
    const fileRef = useRef(null);
    const isBlank = recipe.skeleton === 'blank';
    // the Design tab only exists on a blank "design your own" canvas; Edit does everything for the other layouts
    const tabs = TABS.filter((t) => t.id !== 'design' || isBlank);
    const designs = getDesignRecipes(template);
    // one tile per layout: a layout that appears several times in the curated list (different backgrounds/frames) is shown
    // once, with its first (primary) variant; Generate and Shuffle still rotate through all the variants
    const seenLayouts = new Set();
    const uniqueDesigns = designs.filter((d) => !seenLayouts.has(d.skeleton) && seenLayouts.add(d.skeleton));
    const allLayouts = [
        ...uniqueDesigns.map((d) => ({ key: `d${d.index}`, name: LAYOUT_NAMES[d.skeleton] || d.skeleton, skin: { skeleton: d.skeleton, background: d.background, frame: d.frame, decoration: d.decoration }, paletteId: d.paletteId, active: recipe.skeleton === d.skeleton })),
        ...MORE_LAYOUTS.filter((m) => !seenLayouts.has(m.skeleton)).map((m) => ({ key: m.skeleton, name: m.name, skin: { skeleton: m.skeleton, background: m.background, frame: m.frame, decoration: m.decoration }, paletteId: m.palettes[0], active: recipe.skeleton === m.skeleton })),
    ];
    const overrides = custom.overrides || {};
    const extras = custom.extras || [];
    const selectedExtra = extras.find((e) => e.id === selectedId);
    const hidden = Object.entries(overrides).filter(([, v]) => v.hidden).map(([id]) => id);
    const typography = custom.typography || {};
    const pal = PALETTES[recipe.paletteId];
    const swatches = pal ? [pal.text, pal.primary, pal.secondary, pal.accent] : [];
    const pieces = piecesFor(recipe, data);
    const moved = Object.keys(overrides).filter((id) => !overrides[id].hidden).length;

    // direct editing is only active while the Edit tab is open (so the poster is clean otherwise)
    useEffect(() => { onEditing?.(tab === 'edit' || tab === 'design'); return () => onEditing?.(false); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps
    // picking one of your own elements on the poster opens its properties
    useEffect(() => { if (isBlank && isElementId(selectedId) && tab !== 'design') setTab('design'); }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { if (!isBlank && tab === 'design') setTab('edit'); }, [isBlank, tab]);

    return (
        <div className="pc-root">
            <div className="pc-tabs" role="tablist">
                {tabs.map((t) => (
                    <button key={t.id} role="tab" aria-selected={tab === t.id} className={`pc-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                        {t.label}
                    </button>
                ))}
                <button className="pc-shuffle" onClick={onShuffle} title="Try another layout and colours" aria-label="Shuffle layout and colours"><span aria-hidden="true">🔀</span><span className="pc-shuffle-label"> Shuffle</span></button>
            </div>

            {tab === 'edit' && (
                <div className="pc-panel">
                    <div className="pc-buttons">
                        <button className="pc-btn" onClick={onUndo} disabled={!canUndo} title="Ctrl+Z">↶ Undo</button>
                        <button className="pc-btn" onClick={onRedo} disabled={!canRedo} title="Ctrl+Y">↷ Redo</button>
                        <button className="pc-btn" onClick={onResetAll} disabled={!moved && !hidden.length}>Reset layout</button>
                    </div>

                    {!isBlank && <AddSection design={design || {}} custom={custom} />}

                    {isElementId(selectedId) ? (
                        <SelectedSection design={design || {}} custom={custom} selectedId={selectedId} swatches={swatches} fallbackFont={custom.typography?.title?.font || custom.titleFont || 'Montserrat'} />
                    ) : selectedId ? (
                        <div className="pc-selected">
                            <div className="pc-selected-head">
                                <b>{labelFor(selectedId)}</b>
                                <span>
                                    <button className="pc-link" onClick={() => onResetElement(selectedId)}>Reset position</button>
                                    <button className="pc-link danger" onClick={() => onDeleteElement(selectedId)}>{selectedExtra ? 'Delete' : 'Hide'}</button>
                                </span>
                            </div>
                            {selectedExtra && (
                                <>
                                    <textarea className="pc-textarea" rows={2} value={selectedExtra.text} onChange={(e) => onUpdateExtra(selectedExtra.id, { text: e.target.value })} />
                                    <label className="pc-row">
                                        <span>Size <b>{selectedExtra.size || 28}px</b></span>
                                        <input type="range" min="12" max="120" value={selectedExtra.size || 28} onChange={(e) => onUpdateExtra(selectedExtra.id, { size: Number(e.target.value) })} />
                                    </label>
                                    <TypeControls dense value={extraToStyle(selectedExtra)} swatches={swatches}
                                        fallbackFont={custom.typography?.title?.font || custom.titleFont || 'Montserrat'}
                                        onChange={(p) => onUpdateExtra(selectedExtra.id, styleToExtra(p))} />
                                </>
                            )}
                            {!selectedExtra && TEXT_IDS.includes(selectedId) && (
                                <WordingEditor id={selectedId} data={data} content={custom.content} onContent={onContent} onReset={onResetContent} />
                            )}
                            {!selectedExtra && TEXT_IDS.includes(selectedId) && (
                                <TypeControls dense value={overrides[selectedId]?.style || {}} swatches={swatches} show={ELEMENT_STYLE_KEYS}
                                    onChange={(p) => onStyleElement(selectedId, p)}
                                    onReset={overrides[selectedId]?.style ? () => onStyleElement(selectedId, CLEAR_STYLE) : undefined} />
                            )}
                        </div>
                    ) : (
                        <>
                            <p className="pc-hint">Click anything on the poster to select it, then change its words, font, colour or position. <b>Drag</b> to move, drag a <b>corner</b> to resize, <b>arrow keys</b> nudge (Shift = 10), <b>Delete</b> hides it, <b>Ctrl+Z</b> undoes. Guides snap to the centre and margins.</p>
                            <h4 className="dp-head">Text styles for the whole poster</h4>
                            <details className="pc-sect">
                                <summary>Title</summary>
                                <TypeControls dense value={{ ...typography.title, font: typography.title?.font ?? custom.titleFont }} swatches={swatches}
                                    show={roleKeys('title')} onChange={(p) => onTypography('title', p)} />
                                <label className="pc-row">
                                    <span>Title size <b>{Math.round((custom.textScale || 1) * 100)}%</b></span>
                                    <input type="range" min="70" max="130" step="5" value={Math.round((custom.textScale || 1) * 100)}
                                        onChange={(e) => onCustom({ textScale: Number(e.target.value) / 100 })} />
                                </label>
                            </details>
                            <details className="pc-sect">
                                <summary>Body text <small>subtitle, description, details</small></summary>
                                <TypeControls dense value={typography.body || {}} swatches={swatches} show={roleKeys('body')} fallbackFont="Inter" onChange={(p) => onTypography('body', p)} />
                            </details>
                            <details className="pc-sect">
                                <summary>Accent <small>organiser, labels</small></summary>
                                <TypeControls dense value={typography.accent || {}} swatches={swatches} show={roleKeys('accent')} fallbackFont="Inter" onChange={(p) => onTypography('accent', p)} />
                            </details>
                            {(custom.typography || custom.titleFont || custom.textScale) && <button className="pc-link" onClick={() => { onResetTypography(); onCustom({ textScale: undefined }); }}>Reset all text styles</button>}
                        </>
                    )}

                    {pieces.length > 0 && (
                        <section className="dp">
                            <h4 className="dp-head">Decorations
                                <span className="dp-head-actions">
                                    <button className="pc-link" onClick={() => design?.setManyOverride?.(pieces, { hidden: true })}>Hide all</button>
                                    <button className="pc-link" onClick={() => design?.setManyOverride?.(pieces, { hidden: false })}>Show all</button>
                                </span>
                            </h4>
                            <ul className="dp-layers">
                                {pieces.map((id) => {
                                    const ov = overrides[id] || {};
                                    return (
                                        <li key={id} className={`dp-layer ${selectedId === id ? 'on' : ''} ${ov.hidden ? 'off' : ''}`}>
                                            <button type="button" className="dp-layer-name" onClick={() => !ov.hidden && onSelect(id)} title={ov.hidden ? 'Hidden: show it to select it' : 'Select to move or resize'}><span>{labelFor(id)}</span></button>
                                            <button type="button" aria-label={ov.hidden ? 'Show' : 'Hide'} title={ov.hidden ? 'Show' : 'Hide'} onClick={() => (ov.hidden ? onRestore(id) : onDeleteElement(id))}>{ov.hidden ? <FiEyeOff /> : <FiEye />}</button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )}

                    {!isBlank && (custom.elements || []).length > 0 && (
                        <LayersSection design={design || {}} custom={custom} overrides={overrides} selectedId={selectedId} onSelect={onSelect} />
                    )}

                    {hidden.length > 0 && (
                        <div className="pc-hidden">
                            <span>Hidden:</span>
                            {hidden.map((id) => <button key={id} className="pc-chip" onClick={() => onRestore(id)}>{labelFor(id)} ＋</button>)}
                        </div>
                    )}
                </div>
            )}

            {tab === 'layout' && (
                <div className="pc-layout-tab">
                    <div className="pc-matchbar">
                        <span>Background painted for <b>{LAYOUT_NAMES[recipe.skeleton] || 'this layout'}</b></span>
                        <button className="pc-btn" onClick={onNewBackground} disabled={busy} title="Generate a new AI background composed for the layout you picked">
                            {busy ? 'Generating…' : '✨ Remake for this layout'}
                        </button>
                    </div>

                    <div className="pc-grid pc-layouts pc-layouts-named">
                        <button className={`pc-thumb-named pc-plus ${recipe.skeleton === 'blank' ? 'active' : ''}`} aria-label="Blank canvas: design your own" onClick={() => { design?.startBlank?.(); setTab('design'); }}>
                            <span className="pc-thumb pc-plus-box"><span aria-hidden="true">＋</span></span>
                            <span className="pc-thumb-name">Design your own</span>
                        </button>
                        {allLayouts.map((l) => (
                            <button key={l.key} className={`pc-thumb-named ${l.active ? 'active' : ''}`} aria-label={l.name} title={l.name} onClick={() => onRecipe({ ...l.skin, paletteId: recipe.paletteId || l.paletteId })}>
                                <span className="pc-thumb"><PosterStage recipe={{ ...l.skin, paletteId: recipe.paletteId || l.paletteId, custom: { size: custom.size, titleFont: custom.titleFont } }} data={data} aiBackgroundImage={photo} width={THUMB_W} /></span>
                                <span className="pc-thumb-name">{l.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'design' && (
                <DesignPanel design={design || {}} custom={custom} overrides={overrides} selectedId={selectedId} onSelect={onSelect} swatches={swatches}
                    busy={busy} onUploadPhoto={onUploadPhoto} fallbackFont={custom.typography?.title?.font || custom.titleFont || 'Montserrat'} />
            )}

            {tab === 'color' && (
                <div className="pc-grid pc-swatches">
                    <button className={`pc-swatch auto ${recipe.paletteId === 'auto' ? 'active' : ''}`} onClick={() => onRecipe({ ...recipe, paletteId: 'auto' })}>
                        <span className="pc-swatch-chip" style={{ background: 'conic-gradient(#ef4444,#f59e0b,#22c55e,#06b6d4,#8b5cf6,#ef4444)' }} />
                        <span>Match photo</span>
                    </button>
                    {Object.values(PALETTES).map((p) => (
                        <button key={p.id} className={`pc-swatch ${recipe.paletteId === p.id ? 'active' : ''}`} onClick={() => onRecipe({ ...recipe, paletteId: p.id })} title={p.name}>
                            <span className="pc-swatch-chip" style={{ background: `linear-gradient(135deg, ${p.bg} 0%, ${p.bg} 45%, ${p.primary} 45%, ${p.primary} 70%, ${p.secondary} 70%)` }} />
                            <span>{p.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {tab === 'photo' && (
                <div className="pc-panel">
                    <label className="pc-row">
                        <span>Photo darkness <b>{Math.round((custom.photoStrength ?? 1) * 100)}%</b></span>
                        <input type="range" min="0" max="150" step="5" value={Math.round((custom.photoStrength ?? 1) * 100)}
                            onChange={(e) => onCustom({ photoStrength: Number(e.target.value) / 100 })} />
                    </label>
                    <div className="pc-buttons">
                        <button className="pc-btn" onClick={onNewBackground} disabled={busy}>{busy ? 'Generating…' : '✨ New AI background'}</button>
                        <button className="pc-btn" onClick={() => fileRef.current?.click()} disabled={busy}>📁 Use my own photo</button>
                        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadPhoto(f); e.target.value = ''; }} />
                    </div>
                    <p className="pc-hint">Tip: raise the darkness if the text is hard to read on a busy photo.</p>
                </div>
            )}

            {tab === 'size' && (
                <div className="pc-grid pc-sizes">
                    {Object.entries(SIZES).map(([key, s]) => (
                        <button key={key} className={`pc-size ${(custom.size || 'post') === key ? 'active' : ''}`} onClick={() => onCustom({ size: key })}>
                            <span className="pc-size-shape" style={{ aspectRatio: `600 / ${s.h}` }} />
                            <b>{s.label}</b>
                            <small>{s.hint}</small>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PosterCustomizer;
