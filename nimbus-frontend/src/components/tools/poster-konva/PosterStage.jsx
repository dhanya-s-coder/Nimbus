import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { Stage, Layer, Group, Rect, Circle } from 'react-konva';
import { POSTER_W, POSTER_H, DESIGN_W, DESIGN_H, DESIGN_SCALE } from './engine/constants';
import { contentPaletteFor, linear } from './engine/color';
import { loadPosterFonts, familiesForPalette } from './engine/fonts';
import { getPalette } from './data/palettes';
import { getBackground } from './layers/backgrounds';
import { getDecoration } from './layers/decorations';
import { getFrame } from './layers/frames';
import { Grain } from './layers/primitives';
import AIBackground from './layers/AIBackground';
import { LAYOUTS } from './layouts';

/** Small outlined shapes that scatter deterministically per title (parity with the DOM overlay). */
const Motifs = ({ title, palette, decorationId }) => {
    if (!['geometric-shapes', 'accent-lines'].includes(decorationId)) return null;
    const seed = String(title || '').split('').reduce((n, c) => n + c.charCodeAt(0), 0);
    const spots = [
        { x: 8 + (seed * 3) % 72, y: 12 + (seed % 18), type: 'circle' },
        { x: DESIGN_W - 34 - (8 + (seed * 7) % 70), y: 34 + (seed * 5) % 34, type: 'diamond' },
        { x: 10 + (seed * 11) % 68, y: DESIGN_H - 34 - (14 + (seed * 2) % 18), type: 'circle' },
    ];
    return (
        <Group opacity={0.48} listening={false}>
            {spots.map((s, i) => (s.type === 'circle'
                ? <Circle key={i} x={s.x + 17} y={s.y + 17} radius={17} stroke={palette.secondary} strokeWidth={2} opacity={0.8} />
                : <Rect key={i} x={s.x + 17} y={s.y + 17} width={34} height={34} offsetX={17} offsetY={17} rotation={45} stroke={palette.secondary} strokeWidth={2} cornerRadius={4} opacity={0.8} />))}
        </Group>
    );
};

/**
 * Konva poster. Authored in 600x750 design space, rendered/exported at 1080x1350 logical.
 * `width` is the on-screen CSS width; export uses the same stage (see exportPoster).
 */
const PosterStage = forwardRef(({ recipe, data, aiBackgroundImage, width = 600 }, ref) => {
    const palette = getPalette(recipe.paletteId);
    // image: undefined = not loaded yet, null = none/failed, number = average luminance 0..1
    const [imgLuma, setImgLuma] = useState(undefined);
    useEffect(() => { setImgLuma(aiBackgroundImage ? undefined : null); }, [aiBackgroundImage]);
    const contentPalette = useMemo(
        () => contentPaletteFor(palette, typeof imgLuma === 'number' ? imgLuma < 0.6 : undefined),
        [palette, imgLuma]
    );
    const [fontsReady, setFontsReady] = useState(false);

    const families = useMemo(() => familiesForPalette(palette), [palette]);
    useEffect(() => {
        let alive = true;
        setFontsReady(false);
        loadPosterFonts(families).then(() => alive && setFontsReady(true));
        return () => { alive = false; };
    }, [families]);

    const height = (width * POSTER_H) / POSTER_W;
    const k = width / DESIGN_W; // design px -> screen px

    const Background = getBackground(recipe.background);
    const Decoration = getDecoration(recipe.decoration);
    const Frame = getFrame(recipe.frame);
    const Layout = LAYOUTS[recipe.skeleton] || LAYOUTS.centered;

    return (
        <Stage ref={ref} width={width} height={height} style={{ width, height, lineHeight: 0 }}>
            <Layer scaleX={k} scaleY={k} listening={false} clip={{ x: 0, y: 0, width: DESIGN_W, height: DESIGN_H }}>
                <Rect width={DESIGN_W} height={DESIGN_H} fill={palette.bg} />
                <Background palette={palette} />
                <AIBackground src={aiBackgroundImage} palette={palette} onReady={(l) => setImgLuma(l)} />
                <Decoration palette={palette} />
                <Grain opacity={0.08} />
                {/* readability gradient above art, below text */}
                {contentPalette.darkContent && (
                    <Rect width={DESIGN_W} height={DESIGN_H}
                        {...linear(0, 0, 0, DESIGN_H, [[0, 'rgba(4,10,24,0.28)'], [0.34, 'rgba(4,10,24,0.08)'], [1, 'rgba(4,10,24,0.56)']])} />
                )}
                <Motifs title={data.title} palette={contentPalette} decorationId={recipe.decoration} />
                {fontsReady && imgLuma !== undefined && <Layout data={data} palette={contentPalette} />}
                <Frame palette={contentPalette} />
            </Layer>
        </Stage>
    );
});

export { DESIGN_SCALE };
export default PosterStage;
