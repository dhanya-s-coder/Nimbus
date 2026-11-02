// Names and groupings of the decorative pieces (decoration layer, frame, motifs, layout ornaments).
// Pure data: no imports, so the editor, the layers and the panel can all share it.
// Every piece is wrapped in <Editable id=...>, so it can be moved, resized and hidden like any other element.

export const DECOR_LABELS = {
    // decorations
    d_orb1: 'Glow (top)', d_rings1: 'Rings (top corner)', d_orb2: 'Glow (bottom)', d_rings2: 'Rings (bottom corner)',
    d_geo1: 'Squares', d_geo2: 'Circles', d_geo3: 'Diamond', d_dots: 'Dots', d_geo4: 'Lines',
    d_arcs1: 'Corner arcs (top)', d_arcs2: 'Corner arcs (bottom)',
    d_line_top: 'Top line', d_line_bottom: 'Bottom line', d_line_side: 'Side line',
    d_gold_tl: 'Gold corner (top left)', d_gold_tr: 'Gold corner (top right)', d_gold_bl: 'Gold corner (bottom left)', d_gold_br: 'Gold corner (bottom right)',
    d_gold_border: 'Inner border', d_gold_glow: 'Gold glow',
    d_network: 'Network', d_net_line: 'Bottom line',
    // frames
    d_frame: 'Frame', d_br_tl: 'Corner bracket (top left)', d_br_tr: 'Corner bracket (top right)', d_br_bl: 'Corner bracket (bottom left)', d_br_br: 'Corner bracket (bottom right)',
    d_side: 'Side bar', d_side_top: 'Top bar', d_side_bottom: 'Bottom bar',
    // small outlined shapes scattered by some designs
    d_motif1: 'Outlined shape (1)', d_motif2: 'Outlined shape (2)', d_motif3: 'Outlined shape (3)',
    // background pattern under everything
    d_pattern: 'Background pattern',
    // layout ornaments
    d_hud: 'HUD grid', d_hc1: 'Corner line (top)', d_hc2: 'Corner line (bottom)', d_fc_frame: 'Ornate frame', badge: 'Register badge',
};

export const DECOR_PIECES = {
    'glow-orbs': ['d_orb1', 'd_rings1', 'd_orb2', 'd_rings2'],
    'geometric-shapes': ['d_geo1', 'd_geo2', 'd_geo3', 'd_dots', 'd_geo4'],
    'corner-accents': ['d_arcs1', 'd_arcs2'],
    'accent-lines': ['d_line_top', 'd_line_bottom', 'd_line_side'],
    'gold-corners': ['d_gold_tl', 'd_gold_tr', 'd_gold_bl', 'd_gold_br', 'd_gold_border', 'd_gold_glow'],
    'network-lines': ['d_network', 'd_net_line'],
};

export const FRAME_PIECES = {
    'double-line': ['d_frame'],
    'corner-brackets': ['d_br_tl', 'd_br_tr', 'd_br_bl', 'd_br_br'],
    'gradient-border': ['d_frame'],
    'accent-sidebar': ['d_side', 'd_side_top', 'd_side_bottom'],
};

/** Designs that also scatter small outlined shapes (see Motifs in PosterStage). */
export const MOTIF_DECORATIONS = ['geometric-shapes', 'accent-lines'];

/** Ornaments drawn by a layout itself. Some depend on the data (hackathon badge, no speaker photo). */
export const layoutPieces = (skeleton, data = {}) => {
    if (skeleton === 'bold-hero') return ['d_hud', 'd_hc1', 'd_hc2', ...(data.templateType === 'hackathon' ? ['badge'] : [])];
    if (skeleton === 'framed-classic') return ['d_fc_frame'];
    if (skeleton === 'split-panel' && !data.speakerPhoto) return ['rings', 'rule'];
    return [];
};

/** Every decorative piece the current design draws, in a sensible order, as unique ids. */
export const piecesFor = (recipe = {}, data = {}) => {
    const ids = [
        ...(recipe.background && recipe.background !== 'solid-gradient' ? ['d_pattern'] : []),
        ...(DECOR_PIECES[recipe.decoration] || []),
        ...(MOTIF_DECORATIONS.includes(recipe.decoration) ? ['d_motif1', 'd_motif2', 'd_motif3'] : []),
        ...layoutPieces(recipe.skeleton, data),
        ...(FRAME_PIECES[recipe.frame] || []),
    ];
    return [...new Set(ids)];
};
