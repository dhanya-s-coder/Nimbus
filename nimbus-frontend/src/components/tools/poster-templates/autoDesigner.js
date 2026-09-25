

const DESIGN_POOLS = {
    academic: [
        // 1. Clean split-panel — default for academic (looks like reference tech-talk poster)
        {
            skeleton: 'split-panel',
            background: 'solid-gradient',
            frame: 'none',
            decoration: 'accent-lines',
            palettes: ['slateCrisp', 'universityBlue', 'midnightSlate'],
        },
        // 2. Editorial with light sage — CSETimes-style clean feel
        {
            skeleton: 'editorial',
            background: 'dot-grid',
            frame: 'accent-sidebar',
            decoration: 'accent-lines',
            palettes: ['sageMint', 'creamFormal', 'slateCrisp'],
        },
        // 3. Framed classic — formal academic lecture
        {
            skeleton: 'framed-classic',
            background: 'solid-gradient',
            frame: 'none',
            decoration: 'corner-accents',
            palettes: ['creamFormal', 'warmAmber', 'goldFormal'],
        },
        // 4. Centered — with gradient
        {
            skeleton: 'centered',
            background: 'topography',
            frame: 'gradient-border',
            decoration: 'glow-orbs',
            palettes: ['royalPurple', 'universityBlue', 'electricIndigo'],
        },
        // 5. Bold editorial
        {
            skeleton: 'editorial',
            background: 'layered-waves',
            frame: 'corner-brackets',
            decoration: 'geometric-shapes',
            palettes: ['oceanTeal', 'emeraldAcademic'],
        },
    ],

    recruitment: [
        // 1. Light sage/mint — matches CSETimes recruitment poster exactly
        {
            skeleton: 'centered',
            background: 'mesh-network',
            frame: 'none',
            decoration: 'network-lines',
            palettes: ['sageMint', 'slateCrisp'],
        },
        // 2. Bold hero with fresh green
        {
            skeleton: 'bold-hero',
            background: 'solid-gradient',
            frame: 'gradient-border',
            decoration: 'glow-orbs',
            palettes: ['emeraldAcademic', 'forestGreen', 'oceanTeal'],
        },
        // 3. Asymmetric — modern professional
        {
            skeleton: 'asymmetric',
            background: 'topography',
            frame: 'accent-sidebar',
            decoration: 'accent-lines',
            palettes: ['slateCrisp', 'universityBlue', 'midnightSlate'],
        },
        // 4. Split panel with vibrant colors
        {
            skeleton: 'split-panel',
            background: 'layered-waves',
            frame: 'none',
            decoration: 'glow-orbs',
            palettes: ['royalPurple', 'electricIndigo'],
        },
        // 5. Bold hero — energetic
        {
            skeleton: 'bold-hero',
            background: 'hex-grid',
            frame: 'double-line',
            decoration: 'corner-accents',
            palettes: ['crimsonBold', 'sunsetOrange', 'charcoalPro'],
        },
    ],

    event: [
        // 1. Formal invitation — Yaadein-style (gold, dark, elegant)
        {
            skeleton: 'framed-classic',
            background: 'gold-sparkle',
            frame: 'none',
            decoration: 'gold-corners',
            palettes: ['goldFormal', 'warmAmber'],
        },
        // 2. Vibrant centered — festive
        {
            skeleton: 'centered',
            background: 'layered-waves',
            frame: 'gradient-border',
            decoration: 'glow-orbs',
            palettes: ['royalPurple', 'roseGold', 'sunsetOrange'],
        },
        // 3. Bold hero — energetic fest
        {
            skeleton: 'bold-hero',
            background: 'solid-gradient',
            frame: 'corner-brackets',
            decoration: 'geometric-shapes',
            palettes: ['charcoalPro', 'crimsonBold', 'electricIndigo'],
        },
        // 4. Asymmetric — modern cultural
        {
            skeleton: 'asymmetric',
            background: 'diagonal-stripes',
            frame: 'none',
            decoration: 'accent-lines',
            palettes: ['neonCyber', 'electricIndigo', 'oceanTeal'],
        },
        // 5. Formal framed — cream
        {
            skeleton: 'framed-classic',
            background: 'solid-gradient',
            frame: 'none',
            decoration: 'corner-accents',
            palettes: ['creamFormal', 'roseGold'],
        },
        // 6. Gold editorial — elegant
        {
            skeleton: 'editorial',
            background: 'gold-sparkle',
            frame: 'accent-sidebar',
            decoration: 'gold-corners',
            palettes: ['goldFormal', 'warmAmber'],
        },
    ],

    hackathon: [
        // 1. Violet drama — CodeSSHe-style
        {
            skeleton: 'bold-hero',
            background: 'hex-grid',
            frame: 'gradient-border',
            decoration: 'geometric-shapes',
            palettes: ['violetDrama', 'neonCyber', 'electricIndigo'],
        },
        // 2. Asymmetric tech
        {
            skeleton: 'asymmetric',
            background: 'mesh-network',
            frame: 'corner-brackets',
            decoration: 'network-lines',
            palettes: ['charcoalPro', 'midnightSlate', 'neonCyber'],
        },
        // 3. Split panel
        {
            skeleton: 'split-panel',
            background: 'topography',
            frame: 'none',
            decoration: 'accent-lines',
            palettes: ['electricIndigo', 'violetDrama', 'universityBlue'],
        },
        // 4. Centered with glow
        {
            skeleton: 'centered',
            background: 'solid-gradient',
            frame: 'double-line',
            decoration: 'glow-orbs',
            palettes: ['royalPurple', 'sunsetOrange', 'crimsonBold'],
        },
        // 5. Bold hero with ocean
        {
            skeleton: 'bold-hero',
            background: 'solid-gradient',
            frame: 'accent-sidebar',
            decoration: 'glow-orbs',
            palettes: ['oceanTeal', 'neonCyber'],
        },
    ],

    announcement: [
        // 1. Framed classic — formal notice
        {
            skeleton: 'framed-classic',
            background: 'solid-gradient',
            frame: 'none',
            decoration: 'corner-accents',
            palettes: ['creamFormal', 'slateCrisp', 'goldFormal'],
        },
        // 2. Editorial — clean professional
        {
            skeleton: 'editorial',
            background: 'dot-grid',
            frame: 'accent-sidebar',
            decoration: 'accent-lines',
            palettes: ['midnightSlate', 'universityBlue'],
        },
        // 3. Centered — simple important
        {
            skeleton: 'centered',
            background: 'solid-gradient',
            frame: 'double-line',
            decoration: 'none',
            palettes: ['slateCrisp', 'universityBlue', 'emeraldAcademic'],
        },
        // 4. Bold hero
        {
            skeleton: 'bold-hero',
            background: 'solid-gradient',
            frame: 'gradient-border',
            decoration: 'glow-orbs',
            palettes: ['crimsonBold', 'sunsetOrange', 'charcoalPro'],
        },
        // 5. Framed formal — gold
        {
            skeleton: 'framed-classic',
            background: 'gold-sparkle',
            frame: 'none',
            decoration: 'gold-corners',
            palettes: ['goldFormal', 'warmAmber'],
        },
    ],
};

const usageTracker = {};

/**
 * Pick the next design from the curated pool for a template type.
 * Cycles through all designs before repeating.
 *
 * @param {string} templateType - e.g., 'academic', 'recruitment', 'event', 'hackathon', 'announcement'
 * @param {object} [hints] - Optional hints to influence selection, e.g. { hasSpeakerPhoto: true }
 * @returns {{ skeleton, background, frame, decoration, paletteId }}
 */
export const getNextDesign = (templateType, hints = {}) => {
    const pool = DESIGN_POOLS[templateType] || DESIGN_POOLS.event;

    if (hints.hasSpeakerPhoto) {
        const splitDesigns = pool.filter(d => d.skeleton === 'split-panel');
        if (splitDesigns.length > 0) {
            const design = splitDesigns[0];
            const paletteId = design.palettes[Math.floor(Math.random() * design.palettes.length)];
            return {
                skeleton: design.skeleton,
                background: design.background,
                frame: design.frame,
                decoration: design.decoration,
                paletteId,
            };
        }
    }

    if (usageTracker[templateType] === undefined) {
        usageTracker[templateType] = 0;
    } else {
        usageTracker[templateType] = (usageTracker[templateType] + 1) % pool.length;
    }

    const design = pool[usageTracker[templateType]];
    const paletteId = design.palettes[Math.floor(Math.random() * design.palettes.length)];

    return {
        skeleton: design.skeleton,
        background: design.background,
        frame: design.frame,
        decoration: design.decoration,
        paletteId,
    };
};


export const getDesignByIndex = (templateType, index) => {
    const pool = DESIGN_POOLS[templateType] || DESIGN_POOLS.event;
    const safeIndex = index % pool.length;
    const design = pool[safeIndex];
    const paletteId = design.palettes[0];

    return {
        skeleton: design.skeleton,
        background: design.background,
        frame: design.frame,
        decoration: design.decoration,
        paletteId,
    };
};


export const getDesignCount = (templateType) => {
    return (DESIGN_POOLS[templateType] || DESIGN_POOLS.event).length;
};


export const resetDesignTracker = (templateType) => {
    delete usageTracker[templateType];
};

export default { getNextDesign, getDesignByIndex, getDesignCount, resetDesignTracker };
