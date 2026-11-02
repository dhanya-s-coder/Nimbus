import React, { useRef, useState } from 'react';
import { FiType, FiSquare, FiCircle, FiTriangle, FiMinus, FiImage, FiGrid, FiUser, FiEye, FiEyeOff, FiLock, FiUnlock, FiCopy, FiTrash2, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import TypeControls from './TypeControls';
import { SIZES } from '../engine/constants';
import {
    FIELD_OPTIONS, elementLabel, isElementId, makeText, makeField, makeShape, makeBlock,
} from './elements';
import './designPanel.css';

const ICONS = { text: FiType, field: FiType, image: FiImage, block: FiGrid };
const SHAPE_ICONS = { rect: FiSquare, ellipse: FiCircle, triangle: FiTriangle, line: FiMinus };
const BASE_SWATCHES = ['#ffffff', '#111827', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#a78bfa', '#f43f5e'];
const GRADIENTS = [['#0f172a', '#1e3a8a'], ['#312e81', '#be185d'], ['#052e16', '#15803d'], ['#7c2d12', '#f59e0b'], ['#111827', '#6b7280'], ['#fdf2f8', '#fbcfe8']];

const ColorRow = ({ label, value, onChange, swatches = [], allowClear }) => (
    <div className="dp-row"><span>{label}</span>
        <div className="pc-colors">
            {[...new Set([...swatches, ...BASE_SWATCHES])].slice(0, 10).map((c) => (
                <button key={c} type="button" aria-label={c} className={`pc-dot ${value === c ? 'on' : ''}`} style={{ background: c }} onClick={() => onChange(c)} />
            ))}
            <input type="color" aria-label={`${label} custom`} value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#ffffff'} onChange={(e) => onChange(e.target.value)} />
            {allowClear && value && <button type="button" className="pc-link" onClick={() => onChange(undefined)}>None</button>}
        </div>
    </div>
);

const Slider = ({ label, value, min, max, step = 1, unit = '', onChange }) => (
    <label className="dp-row"><span>{label} <b>{Math.round(value * 100) / 100}{unit}</b></span>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
);

const Seg = ({ label, value, options, onChange }) => (
    <div className="dp-row"><span>{label}</span>
        <div className="pc-seg">
            {options.map(([k, text]) => <button key={String(k)} type="button" className={`pc-btn ${value === k ? 'on' : ''}`} onClick={() => onChange(k)}>{text}</button>)}
        </div>
    </div>
);

/** Upload / replace the picture of a QR code or speaker photo element. */
const ReplaceImage = ({ el, design }) => {
    const ref = useRef(null);
    const what = el.block === 'avatar' ? 'photo' : 'QR image';
    return (
        <div className="dp-row"><span>{el.src ? `Your ${what}` : `Using the form's ${what} (if any)`}</span>
            <div className="pc-seg">
                <button type="button" className="pc-btn" onClick={() => ref.current?.click()}>{el.src ? 'Replace' : 'Upload'}</button>
                {el.src && <button type="button" className="pc-btn" onClick={() => design.update(el.id, { src: undefined })}>Use the form&apos;s</button>}
            </div>
            <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) design.replaceBlockImage(el.id, f); e.target.value = ''; }} />
        </div>
    );
};

/** Properties of the selected free-form element. */
const Properties = ({ el, design, swatches, fallbackFont }) => {
    const set = (patch) => design.update(el.id, patch);
    return (
        <div className="dp-props">
            {el.type === 'text' && (
                <textarea className="pc-textarea" rows={2} value={el.text} onChange={(e) => set({ text: e.target.value })} aria-label="Text" />
            )}
            {el.type === 'field' && (
                <label className="dp-row"><span>Shows</span>
                    <select value={el.bind} onChange={(e) => set({ bind: e.target.value })}>
                        {FIELD_OPTIONS.map((f) => <option key={f.bind} value={f.bind}>{f.label}</option>)}
                    </select>
                </label>
            )}
            {(el.type === 'text' || el.type === 'field') && (
                <>
                    <Slider label="Size" value={el.size} min={8} max={180} unit="px" onChange={(size) => set({ size })} />
                    <TypeControls dense value={{ align: el.align, ...el.style }} swatches={swatches} fallbackFont={fallbackFont}
                        onChange={(p) => design.style(el.id, p)} onReset={Object.keys(el.style || {}).length ? () => design.style(el.id, Object.fromEntries(Object.keys(el.style).map((k) => [k, undefined]))) : undefined} />
                </>
            )}

            {el.type === 'shape' && (
                <>
                    {el.kind !== 'line' && <ColorRow label="Fill" value={el.fill} swatches={swatches} onChange={(fill) => set({ fill })} allowClear />}
                    {el.kind !== 'line' && el.fill && <ColorRow label="Gradient to" value={el.fill2} swatches={swatches} onChange={(fill2) => set({ fill2 })} allowClear />}
                    <ColorRow label={el.kind === 'line' ? 'Colour' : 'Outline'} value={el.stroke} swatches={swatches} onChange={(stroke) => set({ stroke, strokeWidth: el.strokeWidth || 3 })} allowClear={el.kind !== 'line'} />
                    {el.stroke && <Slider label="Thickness" value={el.strokeWidth || 0} min={1} max={30} unit="px" onChange={(strokeWidth) => set({ strokeWidth })} />}
                    {el.kind === 'rect' && <Slider label="Corners" value={el.radius || 0} min={0} max={120} unit="px" onChange={(radius) => set({ radius })} />}
                    {el.kind === 'line' && <Seg label="Style" value={!!el.dash} options={[[false, 'Solid'], [true, 'Dashed']]} onChange={(dash) => set({ dash })} />}
                    <Slider label="Opacity" value={el.opacity ?? 1} min={0.05} max={1} step={0.05} onChange={(opacity) => set({ opacity })} />
                    <Seg label="Shadow" value={!!el.shadow} options={[[false, 'Off'], [true, 'On']]} onChange={(shadow) => set({ shadow })} />
                </>
            )}

            {el.type === 'image' && (
                <>
                    <Seg label="Fit" value={el.fit} options={[['cover', 'Fill'], ['contain', 'Fit inside']]} onChange={(fit) => set({ fit })} />
                    <Seg label="Shape" value={el.mask} options={[['none', 'Rectangle'], ['circle', 'Circle']]} onChange={(mask) => set({ mask })} />
                    {el.mask !== 'circle' && el.fit !== 'contain' && <Slider label="Corners" value={el.radius || 0} min={0} max={120} unit="px" onChange={(radius) => set({ radius })} />}
                    <Slider label="Opacity" value={el.opacity ?? 1} min={0.05} max={1} step={0.05} onChange={(opacity) => set({ opacity })} />
                </>
            )}

            {el.type === 'block' && el.block === 'avatar' && (
                <Seg label="Shape" value={el.shape} options={[['Circle', 'Circle'], ['Square', 'Square'], ['Hexagon', 'Hexagon'], ['Diamond', 'Diamond']]} onChange={(shape) => set({ shape })} />
            )}
            {el.type === 'block' && (el.block === 'qr1' || el.block === 'qr2' || el.block === 'avatar') && <ReplaceImage el={el} design={design} />}
            {el.type === 'block' && <p className="pc-hint">Drag a corner on the poster to resize.{el.block === 'logos' ? ' Shows the logos from the form.' : ''}</p>}
        </div>
    );
};

const ALIGNS = [['left', 'Left'], ['center', 'Centre'], ['right', 'Right'], ['top', 'Top'], ['middle', 'Middle'], ['bottom', 'Bottom']];

/** Add text / title / image / shapes / logos / QR / speaker photo / event details. */
export const AddSection = ({ design, custom }) => {
    const fileRef = useRef(null);
    const qrRef = useRef(null);
    const avRef = useRef(null);
    const [shapeOpen, setShapeOpen] = useState(false);
    const H = (SIZES[custom.size] || SIZES.post).h;
    const mid = { x: 60, y: Math.round(H / 2 - 30) };
    return (
        <section>
            <h4 className="dp-head">Add to poster</h4>
            <div className="dp-add">
                <button type="button" className="dp-chip" onClick={() => design.add(makeText(mid))}><FiType /> Text</button>
                <button type="button" className="dp-chip" onClick={() => design.add(makeField('title', { x: 40, y: mid.y }))}><FiType /> Title</button>
                <button type="button" className="dp-chip" onClick={() => fileRef.current?.click()}><FiImage /> Image</button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) design.addImage(f); e.target.value = ''; }} />
                <button type="button" className={`dp-chip ${shapeOpen ? 'on' : ''}`} onClick={() => setShapeOpen((o) => !o)}><FiSquare /> Shape</button>
                <button type="button" className="dp-chip" onClick={() => design.add(makeBlock('logos', { x: 40, y: 36 }))}><FiGrid /> Logos</button>
                <button type="button" className="dp-chip" onClick={() => qrRef.current?.click()}><FiGrid /> QR code</button>
                <input ref={qrRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) design.addBlockImage('qr1', f); e.target.value = ''; }} />
                <button type="button" className="dp-chip" onClick={() => avRef.current?.click()}><FiUser /> Speaker photo</button>
                <input ref={avRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) design.addBlockImage('avatar', f); e.target.value = ''; }} />
            </div>
            {shapeOpen && (
                <div className="dp-add dp-shapes">
                    {['rect', 'ellipse', 'triangle', 'line'].map((k) => {
                        const Ico = SHAPE_ICONS[k];
                        return <button key={k} type="button" className="dp-chip" onClick={() => { design.add(makeShape(k, { x: 100, y: mid.y })); setShapeOpen(false); }}><Ico /> {{ rect: 'Rectangle', ellipse: 'Circle', triangle: 'Triangle', line: 'Line' }[k]}</button>;
                    })}
                </div>
            )}
            <label className="dp-row dp-field"><span>Event detail</span>
                <select value="" onChange={(e) => { if (e.target.value) design.add(makeField(e.target.value, { y: mid.y + 40 })); e.target.value = ''; }}>
                    <option value="">Insert from the form…</option>
                    {FIELD_OPTIONS.map((f) => <option key={f.bind} value={f.bind}>{f.label}</option>)}
                </select>
            </label>
        </section>
    );
};

/** Stacking order of everything you added (top first) with hide / lock / duplicate / delete. */
export const LayersSection = ({ design, custom, overrides = {}, selectedId, onSelect }) => {
    const elements = custom.elements || [];
    return (
        <section>
            <h4 className="dp-head">Layers <small>{elements.length ? 'top first' : ''}</small></h4>
            {elements.length === 0 && <p className="pc-hint">Nothing added yet.</p>}
            <ul className="dp-layers">
                {[...elements].reverse().map((el) => {
                    const ov = overrides[el.id] || {};
                    const Ico = el.type === 'shape' ? SHAPE_ICONS[el.kind] || FiSquare : el.block === 'avatar' ? FiUser : ICONS[el.type] || FiSquare;
                    return (
                        <li key={el.id} className={`dp-layer ${selectedId === el.id ? 'on' : ''} ${ov.hidden ? 'off' : ''}`}>
                            <button type="button" className="dp-layer-name" onClick={() => onSelect(el.id)}><Ico /> <span>{elementLabel(el)}</span></button>
                            <button type="button" title="Bring forward" aria-label="Bring forward" onClick={() => design.reorder(el.id, 'up')}><FiChevronUp /></button>
                            <button type="button" title="Send backward" aria-label="Send backward" onClick={() => design.reorder(el.id, 'down')}><FiChevronDown /></button>
                            <button type="button" title={ov.hidden ? 'Show' : 'Hide'} aria-label={ov.hidden ? 'Show' : 'Hide'} onClick={() => design.setElementOverride(el.id, { hidden: !ov.hidden })}>{ov.hidden ? <FiEyeOff /> : <FiEye />}</button>
                            <button type="button" title={ov.locked ? 'Unlock' : 'Lock'} aria-label={ov.locked ? 'Unlock' : 'Lock'} onClick={() => design.setElementOverride(el.id, { locked: !ov.locked })}>{ov.locked ? <FiLock /> : <FiUnlock />}</button>
                            <button type="button" title="Duplicate" aria-label="Duplicate" onClick={() => design.duplicate(el.id)}><FiCopy /></button>
                            <button type="button" title="Delete" aria-label="Delete" className="danger" onClick={() => design.remove(el.id)}><FiTrash2 /></button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

/** Properties of the selected element you added (nothing when another kind of element is selected). */
export const SelectedSection = ({ design, custom, selectedId, swatches = [], fallbackFont }) => {
    const sel = (custom.elements || []).find((e) => e.id === selectedId);
    if (!sel || !isElementId(sel.id)) return null;
    return (
        <section className="dp-selected">
            <h4 className="dp-head">{elementLabel(sel)}</h4>
            <Properties el={sel} design={design} swatches={swatches} fallbackFont={fallbackFont} />
            <div className="dp-row"><span>Align to poster</span>
                <div className="pc-seg">
                    {ALIGNS.map(([k, t]) => <button key={k} type="button" className="pc-btn" onClick={() => design.align(sel.id, k)}>{t}</button>)}
                </div>
            </div>
            <div className="pc-seg">
                <button type="button" className="pc-btn" onClick={() => design.reorder(sel.id, 'front')}>To front</button>
                <button type="button" className="pc-btn" onClick={() => design.reorder(sel.id, 'back')}>To back</button>
            </div>
        </section>
    );
};

/** Upload a photo, describe one for Nimbus to paint, or use a plain colour / gradient. */
export const BackgroundSection = ({ design, custom, swatches = [], busy, onUploadPhoto }) => {
    const bgFileRef = useRef(null);
    const [prompt, setPrompt] = useState('');
    const bg = custom.bg || {};
    return (
        <section>
            <h4 className="dp-head">Background</h4>
            <div className="dp-add">
                <button type="button" className="dp-chip" onClick={() => bgFileRef.current?.click()} disabled={busy}><FiImage /> Upload photo</button>
                <input ref={bgFileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadPhoto(f); e.target.value = ''; }} />
                {design.hasPhoto && <button type="button" className="dp-chip" onClick={design.removePhoto}><FiTrash2 /> Remove photo</button>}
            </div>
            <label className="dp-row"><span>Describe it and Nimbus paints it</span>
                <textarea className="pc-textarea" rows={2} maxLength={400} value={prompt} onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. soft pastel watercolour clouds at sunrise, lots of calm space" />
            </label>
            <button type="button" className="pc-btn dp-wide" disabled={busy || !prompt.trim()} onClick={() => design.generateBg(prompt)}>
                {busy ? 'Generating…' : '✨ Generate background'}
            </button>

            <div className="dp-row"><span>…or a plain colour</span>
                <div className="dp-grads">
                    {GRADIENTS.map(([a, b]) => (
                        <button key={a + b} type="button" aria-label={`Gradient ${a} to ${b}`} className={`dp-grad ${bg.c1 === a && bg.c2 === b ? 'on' : ''}`} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} onClick={() => design.setBg({ c1: a, c2: b })} />
                    ))}
                </div>
            </div>
            <ColorRow label="Colour" value={bg.c1} swatches={swatches} onChange={(c1) => design.setBg(c1 ? { ...bg, c1 } : undefined)} allowClear />
            {bg.c1 && <ColorRow label="Blend to" value={bg.c2} swatches={swatches} onChange={(c2) => design.setBg({ ...bg, c2 })} allowClear />}
            {design.hasPhoto && bg.c1 && <p className="pc-hint">The photo is covering the colour: remove the photo to see it.</p>}
        </section>
    );
};

/** The Design tab (blank canvas only): everything for building a poster from scratch. */
const DesignPanel = ({ design, custom, overrides = {}, selectedId, onSelect, swatches = [], busy, onUploadPhoto, fallbackFont }) => (
    <div className="pc-panel dp">
        <AddSection design={design} custom={custom} />
        <LayersSection design={design} custom={custom} overrides={overrides} selectedId={selectedId} onSelect={onSelect} />
        <SelectedSection design={design} custom={custom} selectedId={selectedId} swatches={swatches} fallbackFont={fallbackFont} />
        <BackgroundSection design={design} custom={custom} swatches={swatches} busy={busy} onUploadPhoto={onUploadPhoto} />
    </div>
);

export default DesignPanel;
