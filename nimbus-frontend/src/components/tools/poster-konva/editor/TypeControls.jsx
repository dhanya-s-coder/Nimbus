import React from 'react';
import FontPicker from './FontPicker';
import './typeControls.css';
import { getFontInfo } from '../engine/fontLibrary';

const DEFAULT_WEIGHTS = ['400', '600', '700', '800', '900'];
const WEIGHT_LABEL = { 400: 'Regular', 600: 'Semi', 700: 'Bold', 800: 'Extra', 900: 'Black' };
const CASES = [['', 'Aa as is'], ['upper', 'AA'], ['title', 'Aa'], ['lower', 'aa']];
const ALIGNS = [['left', 'Left'], ['center', 'Center'], ['right', 'Right']];
const BASE_SWATCHES = ['#ffffff', '#111827', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#a78bfa', '#f43f5e'];

/**
 * Reusable text-style editor. `value` is a style object { font, weight, italic, case, tracking, lineHeight,
 * align, color, opacity, shadow }; `onChange(patch)` receives only the keys that changed (undefined = clear).
 * `show` limits which controls appear (the global Body/Accent roles can't safely change weight, for instance).
 */
const TypeControls = ({ value = {}, onChange, show, swatches = [], fallbackFont, onReset, dense = false }) => {
    const has = (k) => !show || show.includes(k);
    const info = getFontInfo(value.font || fallbackFont);
    const weights = info?.weights || DEFAULT_WEIGHTS;
    const italicOk = !info || info.italic;
    const colors = [...new Set([...swatches, ...BASE_SWATCHES])].slice(0, 12);
    const num = (k, fallback) => (value[k] === undefined ? fallback : value[k]);

    return (
        <div className={`pc-type ${dense ? 'dense' : ''}`}>
            {has('font') && (
                <label className="pc-row"><span>Font</span>
                    <FontPicker value={value.font} onChange={(font) => onChange({ font })} />
                </label>
            )}

            {has('weight') && (
                <div className="pc-row"><span>Weight</span>
                    <div className="pc-seg">
                        {weights.map((w) => (
                            <button key={w} type="button" className={`pc-btn ${String(value.weight) === w ? 'on' : ''}`}
                                style={{ fontWeight: w }} onClick={() => onChange({ weight: String(value.weight) === w ? undefined : w })}>
                                {WEIGHT_LABEL[w] || w}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {(has('italic') || has('case')) && (
                <div className="pc-row"><span>Style</span>
                    <div className="pc-seg">
                        {has('italic') && (
                            <button type="button" className={`pc-btn ${value.italic ? 'on' : ''}`} style={{ fontStyle: 'italic' }} disabled={!italicOk}
                                title={italicOk ? 'Italic' : 'This font has no italic'} onClick={() => onChange({ italic: value.italic ? undefined : true })}>I</button>
                        )}
                        {has('case') && CASES.map(([k, label]) => (
                            <button key={k || 'none'} type="button" className={`pc-btn ${(value.case || '') === k ? 'on' : ''}`} onClick={() => onChange({ case: k || undefined })}>{label}</button>
                        ))}
                    </div>
                </div>
            )}

            {has('align') && (
                <div className="pc-row"><span>Align</span>
                    <div className="pc-seg">
                        {ALIGNS.map(([k, label]) => (
                            <button key={k} type="button" className={`pc-btn ${value.align === k ? 'on' : ''}`} onClick={() => onChange({ align: value.align === k ? undefined : k })}>{label}</button>
                        ))}
                    </div>
                </div>
            )}

            {has('tracking') && (
                <label className="pc-row"><span>Letter spacing <b>{num('tracking', 0)}px</b></span>
                    <input type="range" min="-2" max="12" step="0.5" value={num('tracking', 0)} onChange={(e) => onChange({ tracking: Number(e.target.value) })} />
                </label>
            )}
            {has('lineHeight') && (
                <label className="pc-row"><span>Line height <b>{num('lineHeight', 1.2)}</b></span>
                    <input type="range" min="0.8" max="2" step="0.05" value={num('lineHeight', 1.2)} onChange={(e) => onChange({ lineHeight: Number(e.target.value) })} />
                </label>
            )}
            {has('opacity') && (
                <label className="pc-row"><span>Opacity <b>{Math.round(num('opacity', 1) * 100)}%</b></span>
                    <input type="range" min="0.1" max="1" step="0.05" value={num('opacity', 1)} onChange={(e) => onChange({ opacity: Number(e.target.value) })} />
                </label>
            )}

            {has('color') && (
                <div className="pc-row"><span>Colour</span>
                    <div className="pc-colors">
                        {colors.map((c) => (
                            <button key={c} type="button" aria-label={c} className={`pc-dot ${value.color === c ? 'on' : ''}`} style={{ background: c }} onClick={() => onChange({ color: c })} />
                        ))}
                        <input type="color" aria-label="Custom text colour" value={/^#[0-9a-f]{6}$/i.test(value.color || '') ? value.color : '#ffffff'} onChange={(e) => onChange({ color: e.target.value })} />
                        {value.color && <button type="button" className="pc-link" onClick={() => onChange({ color: undefined })}>Auto</button>}
                    </div>
                </div>
            )}

            {has('shadow') && (
                <div className="pc-row"><span>Shadow</span>
                    <div className="pc-seg">
                        {[[undefined, 'Default'], [true, 'On'], [false, 'Off']].map(([k, label]) => (
                            <button key={label} type="button" className={`pc-btn ${value.shadow === k ? 'on' : ''}`} onClick={() => onChange({ shadow: k })}>{label}</button>
                        ))}
                    </div>
                </div>
            )}

            {onReset && <button type="button" className="pc-link" onClick={onReset}>Reset text style</button>}
        </div>
    );
};

export default TypeControls;
