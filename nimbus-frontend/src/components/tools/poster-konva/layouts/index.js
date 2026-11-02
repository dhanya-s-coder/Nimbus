import Centered from './Centered';
import BoldHero from './BoldHero';
import SplitPanel from './SplitPanel';
import Editorial from './Editorial';
import Asymmetric from './Asymmetric';
import FramedClassic from './FramedClassic';
import EventCards from './EventCards';
import Blank from './Blank';
import MagazineCover, { FONTS as MAGAZINE_FONTS } from './MagazineCover';
import ArchWindow, { FONTS as ARCHWINDOW_FONTS } from './ArchWindow';
import NeoBrutal, { FONTS as NEOBRUTAL_FONTS } from './NeoBrutal';
import TicketPass, { FONTS as TICKETPASS_FONTS } from './TicketPass';
import BigType, { FONTS as BIGTYPE_FONTS } from './BigType';
import DiagonalSplit, { FONTS as DIAGONALSPLIT_FONTS } from './DiagonalSplit';
import GlassCard, { FONTS as GLASSCARD_FONTS } from './GlassCard';
import CircleBadge, { FONTS as CIRCLEBADGE_FONTS } from './CircleBadge';
import { BACKGROUNDS } from '../layers/backgrounds';
import { DECORATIONS } from '../layers/decorations';
import { FRAMES } from '../layers/frames';

export const LAYOUTS = {
    centered: Centered,
    'bold-hero': BoldHero,
    'split-panel': SplitPanel,
    editorial: Editorial,
    asymmetric: Asymmetric,
    'framed-classic': FramedClassic,
    'event-cards': EventCards,
    blank: Blank, // the "+" layout: nothing but the user's own elements
    'magazine-cover': MagazineCover,
    'arch-window': ArchWindow,
    'neo-brutal': NeoBrutal,
    'ticket-pass': TicketPass,
    'big-type': BigType,
    'diagonal-split': DiagonalSplit,
    'glass-card': GlassCard,
    'circle-badge': CircleBadge,
};

/** Extra fonts a layout draws with (loaded before it renders, on top of the palette's own). */
export const LAYOUT_FONTS = {
    'magazine-cover': MAGAZINE_FONTS,
    'arch-window': ARCHWINDOW_FONTS,
    'neo-brutal': NEOBRUTAL_FONTS,
    'ticket-pass': TICKETPASS_FONTS,
    'big-type': BIGTYPE_FONTS,
    'diagonal-split': DIAGONALSPLIT_FONTS,
    'glass-card': GLASSCARD_FONTS,
    'circle-badge': CIRCLEBADGE_FONTS,
};

/**
 * The newer layouts, shown under "More layouts" in the Layouts tab.
 * `background` / `frame` / `decoration` / `paletteHint` are the skin each one is previewed with.
 * `composition` is what the AI background needs to leave free for it (sent to the image prompt).
 */
export const MORE_LAYOUTS = [
    { skeleton: 'magazine-cover', name: 'Magazine Cover', background: 'solid-gradient', frame: 'none', decoration: 'none', palettes: ['crimsonBold', 'charcoalPro', 'midnightSlate'] },
    { skeleton: 'arch-window', name: 'Arch Window', background: 'solid-gradient', frame: 'none', decoration: 'none', palettes: ['creamFormal', 'sageMint', 'roseGold'] },
    { skeleton: 'neo-brutal', name: 'Neo Brutal', background: 'solid-gradient', frame: 'none', decoration: 'none', palettes: ['sunsetOrange', 'electricIndigo', 'crimsonBold'] },
    { skeleton: 'ticket-pass', name: 'Ticket Pass', background: 'solid-gradient', frame: 'none', decoration: 'none', palettes: ['neonCyber', 'violetDrama', 'sunsetOrange'] },
    { skeleton: 'big-type', name: 'Big Type', background: 'solid-gradient', frame: 'none', decoration: 'none', palettes: ['charcoalPro', 'crimsonBold', 'neonCyber'] },
    { skeleton: 'diagonal-split', name: 'Diagonal Split', background: 'solid-gradient', frame: 'none', decoration: 'none', palettes: ['electricIndigo', 'sunsetOrange', 'oceanTeal'] },
    { skeleton: 'glass-card', name: 'Glass Card', background: 'solid-gradient', frame: 'none', decoration: 'none', palettes: ['royalPurple', 'roseGold', 'oceanTeal'] },
    { skeleton: 'circle-badge', name: 'Circle Badge', background: 'solid-gradient', frame: 'none', decoration: 'none', palettes: ['goldFormal', 'emeraldAcademic', 'royalPurple'] },
];

/** Display names for every layout (the gallery labels). */
export const LAYOUT_NAMES = {
    centered: 'Centered',
    'bold-hero': 'Bold Hero',
    'split-panel': 'Split Panel',
    editorial: 'Editorial',
    asymmetric: 'Asymmetric',
    'framed-classic': 'Framed Classic',
    'event-cards': 'Event Cards',
    blank: 'Blank canvas',
    ...Object.fromEntries(MORE_LAYOUTS.map((m) => [m.skeleton, m.name])),
};

/** True when every part of a design recipe has a Konva implementation. */
export const isKonvaSupported = (recipe) =>
    !!recipe
    && !!LAYOUTS[recipe.skeleton]
    && !!BACKGROUNDS[recipe.background]
    && !!DECORATIONS[recipe.decoration]
    && !!FRAMES[recipe.frame];
