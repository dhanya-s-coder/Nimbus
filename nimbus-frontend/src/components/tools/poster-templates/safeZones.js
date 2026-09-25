/**
 * Safe zone definitions for each skeleton layout.
 * Zones are oversized on purpose so AI graphics bleed into the layout
 * instead of sitting as boxed stickers.
 */

export const SKELETON_SAFE_ZONES = {
    'centered': {
        description: 'Centered layout: text runs down the center column. Corners and side edges are empty.',
        zones: [
            { id: 'top-right', position: { top: '-4%', right: '-6%', width: '46%', height: '38%' }, desc: 'Top-right field bleeding inward' },
            { id: 'top-left', position: { top: '6%', left: '-6%', width: '32%', height: '28%' }, desc: 'Left of organizer badge' },
            { id: 'mid-right', position: { top: '28%', right: '-8%', width: '30%', height: '36%' }, desc: 'Right edge, mid-height' },
            { id: 'mid-left', position: { top: '32%', left: '-8%', width: '26%', height: '30%' }, desc: 'Left edge, mid-height' },
            { id: 'bottom-left', position: { bottom: '6%', left: '-4%', width: '32%', height: '24%' }, desc: 'Bottom-left below info cards' },
        ],
    },
    'bold-hero': {
        description: 'Bold hero: massive title takes center-left. Top-right and bottom edges have space.',
        zones: [
            { id: 'top-right', position: { top: '-6%', right: '-8%', width: '52%', height: '44%' }, desc: 'Large top-right visual field' },
            { id: 'mid-right', position: { top: '18%', right: '-10%', width: '42%', height: '48%' }, desc: 'Right side next to title' },
            { id: 'bottom-right', position: { bottom: '8%', right: '-4%', width: '36%', height: '28%' }, desc: 'Right side next to info bar' },
        ],
    },
    'split-panel': {
        description: 'Split panel: left 42% has all text. Entire right 58% is empty decorative space.',
        zones: [
            { id: 'right-full', position: { top: '0%', left: '38%', width: '62%', height: '100%' }, desc: 'Right illustration panel, overlaps the seam' },
            { id: 'right-top', position: { top: '0%', left: '42%', width: '58%', height: '52%' }, desc: 'Top half of right panel' },
            { id: 'right-bottom', position: { bottom: '0%', left: '42%', width: '58%', height: '52%' }, desc: 'Bottom half of right panel' },
        ],
    },
    'editorial': {
        description: 'Editorial stacked: content is left-aligned. Right edge and gaps between sections are open.',
        zones: [
            { id: 'top-right', position: { top: '-4%', right: '-6%', width: '44%', height: '34%' }, desc: 'Top-right corner' },
            { id: 'mid-right', position: { top: '24%', right: '-8%', width: '38%', height: '44%' }, desc: 'Right edge mid-height' },
            { id: 'bottom-right', position: { bottom: '6%', right: '-4%', width: '36%', height: '28%' }, desc: 'Bottom-right area' },
        ],
    },
    'asymmetric': {
        description: 'Asymmetric: title is left-offset, info cards stagger left-to-right. Top-right and right edge are open.',
        zones: [
            { id: 'top-right', position: { top: '-2%', right: '-6%', width: '48%', height: '40%' }, desc: 'Top-right area' },
            { id: 'mid-right', position: { top: '22%', right: '-8%', width: '40%', height: '38%' }, desc: 'Right edge next to title' },
            { id: 'bottom-left', position: { bottom: '-2%', left: '-4%', width: '36%', height: '22%' }, desc: 'Bottom-left corner' },
        ],
    },
    'framed-classic': {
        description: 'Framed classic: content is centered within an inner frame. Visuals come from the full-bleed background.',
        zones: [],
    },
};

export const getSafeZoneStyle = (zone) => {
    if (!zone?.position) return {};
    return {
        position: 'absolute',
        ...zone.position,
        pointerEvents: 'none',
    };
};

export default SKELETON_SAFE_ZONES;
