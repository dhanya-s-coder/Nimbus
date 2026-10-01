import React from 'react';
import { loadFonts, renderLogos, truncate } from '../utils';

const SkeletonEventCards = ({ data, palette }) => {
    React.useEffect(() => { loadFonts(['Montserrat', 'Inter']); }, []);
    const { title, subtitle, organizer, description, infoItems = [], extraItems = [], collegeLogo, eventBrandLogo } = data;
    return <div style={{ position: 'relative', zIndex: 10, height: '100%', padding: 28, boxSizing: 'border-box', color: palette.text, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{renderLogos(collegeLogo, eventBrandLogo, { height: 38, opacity: .95 })}<span style={{ color: palette.secondary, fontSize: 10, letterSpacing: 2, fontWeight: 800 }}>{organizer || 'PRESENTS'}</span></div>
        <div style={{ marginTop: 96, maxWidth: '92%' }}><div style={{ color: palette.secondary, fontSize: 12, letterSpacing: 3, fontWeight: 800 }}>{subtitle || 'SPECIAL EVENT'}</div><h1 style={{ margin: '10px 0 8px', fontSize: title?.length > 22 ? 43 : 58, lineHeight: .95, fontFamily: "'Montserrat', sans-serif", textTransform: 'uppercase', letterSpacing: -2, color: palette.text }}>{title || 'EVENT TITLE'}</h1><div style={{ width: 76, height: 4, background: palette.primary, borderRadius: 3 }} /><p style={{ maxWidth: 410, lineHeight: 1.5, color: palette.muted, fontSize: 13 }}>{description}</p></div>
        <div style={{ position: 'absolute', left: 28, right: 28, bottom: 34, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>{infoItems.slice(0, 3).map((item, i) => <div key={i} style={{ background: `${palette.bgMid}cc`, border: `1px solid ${palette.primary}55`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}><small style={{ display: 'block', color: palette.secondary, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</small><b style={{ display: 'block', marginTop: 5, fontSize: 11 }}>{String(item.value).slice(0, 28)}</b></div>)}</div>
        {extraItems.length > 0 && <div style={{ position: 'absolute', right: 28, bottom: 108, padding: '9px 12px', borderRadius: 999, background: palette.primary, color: '#fff', fontSize: 10, fontWeight: 800 }}>{extraItems[0].label}</div>}
    </div>;
};
export default SkeletonEventCards;
