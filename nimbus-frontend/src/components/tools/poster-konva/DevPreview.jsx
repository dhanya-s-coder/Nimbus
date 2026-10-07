import React, { useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PosterStage from './PosterStage';
import { getDesignByIndex } from './data/autoDesigner';
import { normalizeFormData } from './data/normalizeFormData';
import { exportPosterBlob } from './engine/exportPoster';
import { SAMPLES } from './data/samples';

// Dev-only QA page (not mounted in production): /dev/poster?t=event&i=0&p=royalPurple&bg=0
const BG = 'https://res.cloudinary.com/dld4lmm8j/image/upload/v1791364526/nimbus/sdnkrijzybuwtee2qqqc.jpg';

const DevPreview = () => {
    const [q] = useSearchParams();
    const ref = useRef(null);
    const t = q.get('t') || 'event';
    const style = getDesignByIndex(t, Number(q.get('i') || 0));
    const recipe = {
        ...style,
        ...(q.get('p') ? { paletteId: q.get('p') } : {}),
        ...(q.get('s') ? { skeleton: q.get('s') } : {}),
        ...(q.get('b') ? { background: q.get('b') } : {}),
        ...(q.get('f') ? { frame: q.get('f') } : {}),
        ...(q.get('d') ? { decoration: q.get('d') } : {}),
        custom: {
            ...(q.get('size') ? { size: q.get('size') } : {}),
            ...(q.get('font') ? { titleFont: q.get('font') } : {}),
            ...(q.get('scale') ? { textScale: Number(q.get('scale')) } : {}),
            ...(q.get('strength') ? { photoStrength: Number(q.get('strength')) } : {}),
        },
    };
    const full = SAMPLES[t];
    const only = q.get('min') ? { [Object.keys(full)[0]]: full[Object.keys(full)[0]] } : full; // ?min=1 -> title only
    const form = { ...only, ...(q.get('photo') ? { speakerPhoto: BG } : {}), ...(q.get('shape') ? { speakerShape: q.get('shape') } : {}),
        ...(q.get('qr') ? { qr1Image: BG } : {}), ...(q.get('long') ? { [Object.keys(SAMPLES[t])[0]]: 'An Extraordinarily Long Event Title That Keeps Going And Going For Testing' } : {}) };
    useEffect(() => {
        window.__exportPng = async (w = 2160) => {
            const blob = await exportPosterBlob(ref.current, { outputWidth: w });
            return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
        };
    }, []);
    return (
        <div style={{ background: '#222', padding: 0, width: 600 }}>
            <PosterStage ref={ref} recipe={recipe} data={normalizeFormData(t, form)} aiBackgroundImage={q.get('bg') === '0' ? null : BG} width={600} />
        </div>
    );
};

export default DevPreview;
