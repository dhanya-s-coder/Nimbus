import React, { useMemo } from 'react';
import { SponsorStrip, Motif } from './overlays';

const pill = (palette, extra = {}) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 11px',
    borderRadius: 999, background: `${palette.primary}e8`, color: '#fff',
    fontSize: 11, fontWeight: 800, letterSpacing: '.5px', ...extra,
});

const OverlayElements = ({ data, palette, decorationId }) => {
    const { extraItems = [] } = data;
    const prize = extraItems.find(x => /prize/i.test(x.label));
    const eligibility = extraItems.find(x => /eligibility|who can apply/i.test(x.label));
    const highlights = extraItems.find(x => /highlight|benefit/i.test(x.label));
    const sponsorLogos = data.sponsorLogos || [];
    const motifs = useMemo(() => {
        const seed = String(data.title || '').split('').reduce((n, c) => n + c.charCodeAt(0), 0);
        return [
            { top: 12 + seed % 18, left: 8 + (seed * 3) % 72, type: 'circle' },
            { top: 34 + (seed * 5) % 34, right: 8 + (seed * 7) % 70, type: 'diamond' },
            { bottom: 14 + (seed * 2) % 18, left: 10 + (seed * 11) % 68, type: 'circle' },
        ];
    }, [data.title]);

    return <div style={{ position: 'absolute', inset: 0, zIndex: 8, pointerEvents: 'none', fontFamily: "'Inter', sans-serif" }}>
        {['geometric-shapes', 'accent-lines'].includes(decorationId) && motifs.map(({ type, ...pos }, i) => <div key={i} style={{ position: 'absolute', ...pos, opacity: .48, pointerEvents: 'none' }}><Motif palette={palette} type={type} /></div>)}

        {prize && extraItems.length === 0 && <div style={{ ...pill(palette, { position: 'absolute', top: '18%', right: 20, background: palette.secondary || palette.primary }), boxShadow: '0 5px 18px #0006' }}>🏆 {String(prize.value).slice(0, 36)}</div>}
        {eligibility && extraItems.length === 0 && <div style={{ ...pill(palette, { position: 'absolute', left: 20, bottom: '25%', maxWidth: 190 }) }}>👥 {eligibility.label}: {Array.isArray(eligibility.value) ? eligibility.value[0] : String(eligibility.value).slice(0, 42)}</div>}
        {highlights && extraItems.length === 0 && <div style={{ position: 'absolute', left: 20, top: '62%', maxWidth: 210, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {(Array.isArray(highlights.value) ? highlights.value : [highlights.value]).slice(0, 3).map((v, i) => <span key={i} style={pill(palette, { fontSize: 9, padding: '5px 8px' })}>✦ {String(v).slice(0, 28)}</span>)}
        </div>}


        {sponsorLogos.length > 0 && <div style={{ position: 'absolute', left: 18, right: 18, bottom: 8 }}><SponsorStrip logos={sponsorLogos} /></div>}
    </div>;
};

export default OverlayElements;
