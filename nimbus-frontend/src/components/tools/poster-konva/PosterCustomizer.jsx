import React, { useEffect, useRef, useState } from 'react';
import PosterStage from './PosterStage';
import { PALETTES } from './data/palettes';
import { getDesignRecipes } from './data/autoDesigner';
import { SIZES } from './engine/constants';
import { TITLE_FONT_CHOICES } from './engine/fonts';
import { labelFor } from './engine/edit';
import './poster-customizer.css';

const TABS = [
    { id: 'edit', label: '✏️ Edit' },
    { id: 'layout', label: 'Layouts' },
    { id: 'color', label: 'Colors' },
    { id: 'photo', label: 'Photo' },
    { id: 'text', label: 'Text' },
    { id: 'size', label: 'Size' },
];

const sameDesign = (a, b) =>
    a.skeleton === b.skeleton && a.background === b.background && a.frame === b.frame && a.decoration === b.decoration;

/**
 * Canva-style tweaking for a generated poster. Everything is stored in `recipe` (+ `custom`),
 * which is saved with the poster, so edits survive Save Draft / reload.
 */
const PosterCustomizer = ({
    template, recipe, custom, onRecipe, onCustom, data, photo, onShuffle, onNewBackground, onUploadPhoto, busy,
    onEditing, selectedId, onSelect, onUndo, onRedo, canUndo, canRedo, onResetAll, onAddText, onUpdateExtra,
    onResetElement, onDeleteElement, onRestore,
}) => {
    const [tab, setTab] = useState('layout');
    const fileRef = useRef(null);
    const designs = getDesignRecipes(template);
    const overrides = custom.overrides || {};
    const extras = custom.extras || [];
    const selectedExtra = extras.find((e) => e.id === selectedId);
    const hidden = Object.entries(overrides).filter(([, v]) => v.hidden).map(([id]) => id);
    const moved = Object.keys(overrides).filter((id) => !overrides[id].hidden).length;

    // direct editing is only active while the Edit tab is open (so the poster is clean otherwise)
    useEffect(() => { onEditing?.(tab === 'edit'); return () => onEditing?.(false); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="pc-root">
            <div className="pc-tabs" role="tablist">
                {TABS.map((t) => (
                    <button key={t.id} role="tab" aria-selected={tab === t.id} className={`pc-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                        {t.label}
                    </button>
                ))}
                <button className="pc-shuffle" onClick={onShuffle} title="Try another layout and colours">🔀 Shuffle</button>
            </div>

            {tab === 'edit' && (
                <div className="pc-panel">
                    <div className="pc-buttons">
                        <button className="pc-btn" onClick={onAddText}>➕ Add text</button>
                        <button className="pc-btn" onClick={onUndo} disabled={!canUndo} title="Ctrl+Z">↶ Undo</button>
                        <button className="pc-btn" onClick={onRedo} disabled={!canRedo} title="Ctrl+Y">↷ Redo</button>
                        <button className="pc-btn" onClick={onResetAll} disabled={!moved && !hidden.length}>Reset layout</button>
                    </div>

                    {selectedId ? (
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
                                    <div className="pc-buttons">
                                        <input type="color" aria-label="Text colour" value={selectedExtra.color || '#ffffff'} onChange={(e) => onUpdateExtra(selectedExtra.id, { color: e.target.value })} />
                                        <select value={selectedExtra.font || ''} onChange={(e) => onUpdateExtra(selectedExtra.id, { font: e.target.value || undefined })}>
                                            <option value="">Title font</option>
                                            {TITLE_FONT_CHOICES.map((f) => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                        {['left', 'center', 'right'].map((a) => (
                                            <button key={a} className={`pc-btn ${(selectedExtra.align || 'center') === a ? 'on' : ''}`} onClick={() => onUpdateExtra(selectedExtra.id, { align: a })}>{a[0].toUpperCase() + a.slice(1)}</button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <p className="pc-hint">Click anything on the poster to select it. <b>Drag</b> to move, drag a <b>corner</b> to resize, <b>arrow keys</b> nudge (Shift = 10), <b>Delete</b> hides it, <b>Ctrl+Z</b> undoes. Guides snap to the centre and margins.</p>
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
                <div className="pc-grid pc-layouts">
                    {designs.map((d) => {
                        const active = sameDesign(d, recipe);
                        return (
                            <button key={d.index} className={`pc-thumb ${active ? 'active' : ''}`} aria-label={`Layout ${d.index + 1}`}
                                onClick={() => onRecipe({ ...d, paletteId: recipe.paletteId || d.paletteId })}>
                                <PosterStage recipe={{ ...d, paletteId: recipe.paletteId || d.paletteId, custom: { size: custom.size, titleFont: custom.titleFont } }} data={data} aiBackgroundImage={photo} width={92} />
                            </button>
                        );
                    })}
                </div>
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

            {tab === 'text' && (
                <div className="pc-panel">
                    <label className="pc-row">
                        <span>Title font</span>
                        <select value={custom.titleFont || ''} onChange={(e) => onCustom({ titleFont: e.target.value || undefined })}>
                            <option value="">Design default</option>
                            {TITLE_FONT_CHOICES.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                        </select>
                    </label>
                    <label className="pc-row">
                        <span>Title size <b>{Math.round((custom.textScale || 1) * 100)}%</b></span>
                        <input type="range" min="70" max="130" step="5" value={Math.round((custom.textScale || 1) * 100)}
                            onChange={(e) => onCustom({ textScale: Number(e.target.value) / 100 })} />
                    </label>
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
