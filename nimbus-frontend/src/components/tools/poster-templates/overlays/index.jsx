import React from 'react';
import QRCode from 'qrcode';

export const Badge = ({ children, palette, className = '' }) => <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 999, background: palette.primary, color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '.4px', boxShadow: '0 4px 12px #0005' }}>{children}</span>;

export const GlassPanel = ({ children, palette, style = {} }) => <div style={{ background: 'rgba(4,10,24,.72)', border: `1px solid ${palette.primary}88`, borderRadius: 12, backdropFilter: 'blur(9px)', boxShadow: '0 8px 24px #0004', ...style }}>{children}</div>;

export const InfoCard = ({ label, value, palette }) => <GlassPanel palette={palette} style={{ padding: '9px 12px', minWidth: 80, textAlign: 'center' }}><small style={{ display: 'block', color: palette.secondary, fontSize: 8, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</small><strong style={{ display: 'block', color: '#fff', fontSize: 10, marginTop: 4 }}>{value}</strong></GlassPanel>;

export const SpeakerCutout = ({ photo, name, designation, palette }) => <div style={{ width: 112, textAlign: 'center' }}><div style={{ width: 92, height: 92, margin: 'auto', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${palette.accent || '#fff'}`, boxShadow: '0 8px 22px #0008' }}><img src={photo} alt="Speaker" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>{name && <Badge palette={palette}>{name}</Badge>}{designation && <small style={{ display: 'block', color: '#fff', fontSize: 8, marginTop: 3, textShadow: '0 2px 5px #000' }}>{designation}</small>}</div>;

export const QrCard = ({ image, url, palette }) => {
    const [src, setSrc] = React.useState(image || '');
    React.useEffect(() => { if (!image && url) QRCode.toDataURL(url, { margin: 1, width: 180 }).then(setSrc).catch(() => {}); }, [image, url]);
    if (!src) return null;
    return <div style={{ padding: 8, borderRadius: 10, background: '#fff', color: palette.bg, textAlign: 'center', boxShadow: '0 6px 20px #0008' }}><img src={src} alt="Register QR" style={{ width: 66, height: 66, objectFit: 'contain', display: 'block' }} /><b style={{ display: 'block', fontSize: 8, marginTop: 4 }}>SCAN TO REGISTER</b></div>;
};

export const SponsorStrip = ({ logos }) => <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>{logos.slice(0, 5).map((src, i) => <img key={i} src={src} alt="Sponsor" style={{ height: 22, maxWidth: 70, objectFit: 'contain', background: '#fff', borderRadius: 4, padding: 3 }} />)}</div>;

export const DiagonalPanel = ({ children, palette }) => <div style={{ clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)', background: `linear-gradient(135deg, ${palette.primary}dd, ${palette.bg}dd)`, padding: 14, color: '#fff' }}>{children}</div>;

export const TimelineRail = ({ items, palette }) => <div style={{ borderLeft: `2px solid ${palette.primary}`, paddingLeft: 10, display: 'grid', gap: 5 }}>{items.slice(0, 5).map((item, i) => <div key={i} style={{ color: '#fff', fontSize: 9 }}><b style={{ color: palette.secondary }}>{item.year || item.label}</b> {item.value || item.text}</div>)}</div>;

export const Motif = ({ palette, type = 'spark' }) => <div aria-hidden="true" style={{ width: 34, height: 34, border: `2px solid ${palette.secondary}`, transform: type === 'diamond' ? 'rotate(45deg)' : 'none', borderRadius: type === 'circle' ? '50%' : 4, opacity: .8 }} />;
