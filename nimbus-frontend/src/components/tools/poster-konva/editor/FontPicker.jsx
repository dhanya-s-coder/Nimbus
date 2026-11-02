import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FONT_LIBRARY, FONT_CATEGORIES, ensureFontCss } from '../engine/fontLibrary';

const RECENT_KEY = 'nimbus-poster-recent-fonts';
const readRecent = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } };
const pushRecent = (family) => {
    try { localStorage.setItem(RECENT_KEY, JSON.stringify([family, ...readRecent().filter((f) => f !== family)].slice(0, 5))); } catch { /* private mode */ }
};

/**
 * Searchable font dropdown. Every row is drawn in its own typeface (library fonts are lazy-loaded
 * the first time the list opens). `value` '' / undefined means "design default".
 */
const FontPicker = ({ value, onChange, defaultLabel = 'Design default' }) => {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const [cat, setCat] = useState('All');
    const [recent, setRecent] = useState(readRecent);
    const root = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        FONT_LIBRARY.forEach((f) => ensureFontCss(f.family));
        const onDown = (e) => { if (root.current && !root.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open]);

    const list = useMemo(() => FONT_LIBRARY.filter((f) =>
        (cat === 'All' || f.category === cat) && f.family.toLowerCase().includes(q.trim().toLowerCase())), [q, cat]);

    const pick = (family) => {
        if (family) { pushRecent(family); setRecent(readRecent()); }
        onChange(family || undefined);
        setOpen(false);
    };

    const row = (family, label = family) => (
        <button key={`${label}-${family}`} type="button" className={`pc-font-row ${family === (value || '') ? 'on' : ''}`}
            style={family ? { fontFamily: `"${family}", sans-serif` } : undefined} onClick={() => pick(family)}>
            {label}
        </button>
    );

    return (
        <div className="pc-font" ref={root}>
            <button type="button" className="pc-font-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
                style={value ? { fontFamily: `"${value}", sans-serif` } : undefined}>
                <span>{value || defaultLabel}</span><span aria-hidden>▾</span>
            </button>
            {open && (
                <div className="pc-font-pop" role="listbox">
                    <input className="pc-font-search" autoFocus placeholder="Search fonts…" value={q} onChange={(e) => setQ(e.target.value)} />
                    <div className="pc-font-cats">
                        {['All', ...FONT_CATEGORIES].map((c) => (
                            <button key={c} type="button" className={`pc-chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>
                        ))}
                    </div>
                    <div className="pc-font-list">
                        {!q && cat === 'All' && row('', defaultLabel)}
                        {!q && cat === 'All' && recent.length > 0 && <div className="pc-font-head">Recent</div>}
                        {!q && cat === 'All' && recent.map((f) => row(f))}
                        {!q && cat === 'All' && recent.length > 0 && <div className="pc-font-head">All fonts</div>}
                        {list.map((f) => row(f.family))}
                        {!list.length && <div className="pc-font-head">No fonts match</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FontPicker;
