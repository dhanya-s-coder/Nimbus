import Centered from './Centered';
import BoldHero from './BoldHero';
import SplitPanel from './SplitPanel';
import Editorial from './Editorial';
import Asymmetric from './Asymmetric';
import FramedClassic from './FramedClassic';
import EventCards from './EventCards';
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
};

/** True when every part of a design recipe has a Konva implementation. */
export const isKonvaSupported = (recipe) =>
    !!recipe
    && !!LAYOUTS[recipe.skeleton]
    && !!BACKGROUNDS[recipe.background]
    && !!DECORATIONS[recipe.decoration]
    && !!FRAMES[recipe.frame];
