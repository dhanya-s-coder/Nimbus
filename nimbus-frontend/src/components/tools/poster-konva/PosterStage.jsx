import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Group, Rect, Circle, Line, Transformer } from 'react-konva';
import { DESIGN_W, DESIGN_H, setDesignHeight } from './engine/constants';
import { contentPaletteFor, linear } from './engine/color';
import { loadPosterFonts, familiesForPalette, areFontsReady } from './engine/fonts';
import { fontsInUse, caseText, buildFontStyle } from './engine/typography';
import { buildAutoPalette } from './engine/autoPalette';
import { getPalette } from './data/palettes';
import { getBackground } from './layers/backgrounds';
import { getDecoration } from './layers/decorations';
import { getFrame } from './layers/frames';
import { Grain } from './layers/primitives';
import AIBackground from './layers/AIBackground';
import { LAYOUTS, LAYOUT_FONTS } from './layouts';
import { EditContext, Editable } from './engine/edit';
import { Txt } from './layers/ui';
import CustomElements from './editor/CustomElements';
import { isElementId } from './editor/elements';

/** Small outlined shapes that scatter deterministically per title. */
const Motifs = ({ title, palette, decorationId }) => {
    if (!['geometric-shapes', 'accent-lines'].includes(decorationId)) return null;
    const seed = String(title || '').split('').reduce((n, c) => n + c.charCodeAt(0), 0);
    const spots = [
        { x: 8 + (seed * 3) % 72, y: 12 + (seed % 18), type: 'circle' },
        { x: DESIGN_W - 34 - (8 + (seed * 7) % 70), y: 34 + (seed * 5) % 34, type: 'diamond' },
        { x: 10 + (seed * 11) % 68, y: DESIGN_H - 34 - (14 + (seed * 2) % 18), type: 'circle' },
    ];
    return (
        <>
            {spots.map((s, i) => (
                <Editable key={i} id={`d_motif${i + 1}`}>
                    {s.type === 'circle'
                        ? <Circle x={s.x + 17} y={s.y + 17} radius={17} stroke={palette.secondary} strokeWidth={2} opacity={0.55} listening={false} shadowColor={palette.secondary} shadowBlur={8} shadowOpacity={0.5} />
                        : <Rect x={s.x + 17} y={s.y + 17} width={34} height={34} offsetX={17} offsetY={17} rotation={45} stroke={palette.secondary} strokeWidth={2} cornerRadius={4} opacity={0.55} listening={false} shadowColor={palette.secondary} shadowBlur={8} shadowOpacity={0.5} />}
                </Editable>
            ))}
        </>
    );
};

/**
 * Konva poster. Authored in 600xH design space (H from the size preset), exported at 1080 logical width.
 *
 * recipe = { skeleton, background, frame, decoration, paletteId | 'auto',
 *            custom?: { size, titleFont, textScale, photoStrength } }
 * `width` is the on-screen CSS width; export uses the same stage (see exportPoster).
 */
const EMPTY_OVERRIDES = Object.freeze({});
const EMPTY_EXTRAS = Object.freeze([]);

/** User-added text boxes (custom.extras). Positioned by their own x/y, moved via overrides. */
const ExtraTexts = ({ extras, palette }) => (
    <>
        {extras.map((e) => (
            <Editable key={e.id} id={e.id}>
                <Txt
                    text={e.case ? caseText(e.text || 'Your text', e.case) : (e.text || 'Your text')} x={e.x ?? 60} y={e.y ?? 300} width={e.width ?? 480}
                    align={e.align || 'center'} fontSize={e.size || 28} fontFamily={e.font || palette.titleFonts?.[0] || 'Montserrat'}
                    fontStyle={buildFontStyle(e.weight || '700', { italic: e.italic })} fill={e.color || palette.text} lineHeight={e.lineHeight ?? 1.15} letterSpacing={e.letterSpacing || 0}
                    opacity={e.opacity ?? 1}
                    shadowColor="rgba(0,0,0,0.5)" shadowBlur={e.shadow === false ? 0 : 8} shadowOpacity={0.6}
                />
            </Editable>
        ))}
    </>
);

const PosterStage = forwardRef(({ recipe, data, aiBackgroundImage, width = 600, editing = false, selectedId = null, onSelect, onCommit, onDelete, onUndo, onRedo }, ref) => {
    const custom = recipe.custom || {};
    const designH = setDesignHeight(custom.size); // before any child renders (live binding)

    // photo: undefined = loading, null = none/failed, {luma, hues} = ready
    const [photo, setPhoto] = useState(undefined);
    useEffect(() => { setPhoto(aiBackgroundImage ? undefined : null); }, [aiBackgroundImage]);

    const palette = useMemo(() => {
        const base = recipe.paletteId === 'auto'
            ? buildAutoPalette(photo?.hues, { titleFonts: [custom.titleFont || 'Montserrat', 'Outfit'] })
            : getPalette(recipe.paletteId);
        // Title/Body font choices (Text tab) are folded into the palette so layouts and measuring pick them up unchanged.
        const tFont = custom.typography?.title?.font || custom.titleFont;
        const bFont = custom.typography?.body?.font;
        let out = tFont ? { ...base, titleFonts: [tFont, ...(base.titleFonts || [])] } : base;
        if (bFont) out = { ...out, bodyFont: bFont };
        // layouts that bring their own display fonts only use them when the user has not picked one
        return { ...out, userTitleFont: tFont || undefined, userBodyFont: bFont || undefined };
    }, [recipe.paletteId, photo, custom.titleFont, custom.typography?.title?.font, custom.typography?.body?.font]);

    const contentPalette = useMemo(
        () => ({ ...contentPaletteFor(palette, typeof photo?.luma === 'number' ? photo.luma < 0.6 : undefined), textScale: custom.textScale || 1, type: custom.typography }),
        [palette, photo, custom.textScale, custom.typography]
    );

    const [fontsReady, setFontsReady] = useState(false);
    const usedFonts = fontsInUse(custom).join('|');
    const families = useMemo(() => [...familiesForPalette(palette), ...(LAYOUT_FONTS[recipe.skeleton] || []), ...(usedFonts ? usedFonts.split('|') : [])], [palette, usedFonts, recipe.skeleton]);
    useEffect(() => {
        let alive = true;
        if (!areFontsReady(families)) setFontsReady(false); // already-loaded fonts: don't blank the poster while re-rendering
        loadPosterFonts(families).then(() => alive && setFontsReady(true));
        return () => { alive = false; };
    }, [families]);

    const height = (width * designH) / DESIGN_W;
    const k = width / DESIGN_W; // design px -> screen px
    const strength = custom.photoStrength ?? 1;

    // -- direct editing ------------------------------------------------------
    const overrides = custom.overrides || EMPTY_OVERRIDES;
    const extras = custom.extras || EMPTY_EXTRAS;
    const elements = custom.elements || EMPTY_EXTRAS;
    const selEl = elements.find((e) => e.id === selectedId);
    const nodes = useRef({});
    const trRef = useRef(null);
    const [guides, setGuides] = useState({});
    const register = useCallback((id, node) => { if (node) nodes.current[id] = node; else delete nodes.current[id]; }, []);
    const editCtx = useMemo(() => ({
        editing, overrides, selectedId, designW: DESIGN_W, designH, typography: custom.typography,
        select: (id) => onSelect && onSelect(id),
        commit: (id, patch) => onCommit && onCommit(id, patch),
        register, setGuides,
    }), [editing, overrides, selectedId, designH, custom.typography, onSelect, onCommit, register]);

    useEffect(() => {
        const tr = trRef.current;
        if (!tr) return undefined;
        const node = editing && selectedId && !overrides[selectedId]?.locked ? nodes.current[selectedId] : null;
        tr.nodes(node ? [node] : []);

        // Layouts mark their root groups listening={false} (cheaper when just viewing). While editing, the
        // ancestors of every editable element must listen or Konva never delivers events to them.
        const touched = [];
        if (editing) {
            Object.values(nodes.current).forEach((n) => {
                for (let p = n.getParent(); p && p.nodeType !== 'Stage'; p = p.getParent()) {
                    if (!p.listening()) { p.listening(true); touched.push(p); }
                }
            });
        }
        tr.getLayer()?.batchDraw();
        return () => { touched.forEach((p) => p.listening(false)); };
    });

    useEffect(() => {
        if (!editing) return undefined;
        const onKey = (ev) => {
            const tag = (document.activeElement?.tagName || '').toLowerCase();
            if (['input', 'textarea', 'select'].includes(tag) || document.activeElement?.isContentEditable) return;
            const mod = ev.ctrlKey || ev.metaKey;
            if (mod && ev.key.toLowerCase() === 'z') { ev.preventDefault(); (ev.shiftKey ? onRedo : onUndo)?.(); return; }
            if (mod && ev.key.toLowerCase() === 'y') { ev.preventDefault(); onRedo?.(); return; }
            if (!selectedId) return;
            const step = ev.shiftKey ? 10 : 1;
            const cur = overrides[selectedId] || {};
            const move = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[ev.key];
            if (move) { ev.preventDefault(); onCommit?.(selectedId, { x: (cur.x || 0) + move[0], y: (cur.y || 0) + move[1] }); }
            else if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); onDelete?.(selectedId); }
            else if (ev.key === 'Escape') onSelect?.(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [editing, selectedId, overrides, onCommit, onDelete, onSelect, onUndo, onRedo]);

    const Background = getBackground(recipe.background);
    const Decoration = getDecoration(recipe.decoration);
    const Frame = getFrame(recipe.frame);
    const Layout = LAYOUTS[recipe.skeleton] || LAYOUTS.centered;

    return (
        <EditContext.Provider value={editCtx}>
        <Stage ref={ref} width={width} height={height} style={{ width, height, lineHeight: 0 }}
            onMouseDown={(e) => { if (editing && (e.target === e.target.getStage() || e.target.getParent()?.nodeType === 'Layer')) onSelect?.(null); }}>
            <Layer scaleX={k} scaleY={k} listening={editing} clip={{ x: 0, y: 0, width: DESIGN_W, height: designH }}>
                <Rect width={DESIGN_W} height={designH} fill={palette.bg} />
                {recipe.background && recipe.background !== 'solid-gradient'
                    ? <Editable id="d_pattern" pick={false}><Group listening={false}><Background palette={palette} /></Group></Editable>
                    : <Background palette={palette} />}
                {custom.bg && (
                    <Rect width={DESIGN_W} height={designH} {...(custom.bg.c2
                        ? linear(0, 0, DESIGN_W * 0.35, designH, [[0, custom.bg.c1], [1, custom.bg.c2]])
                        : { fill: custom.bg.c1 })} />
                )}
                <AIBackground src={aiBackgroundImage} palette={palette} strength={strength} onReady={(info) => setPhoto(info)} />
                <Decoration palette={palette} />
                <Grain opacity={0.08} />
                {/* readability gradient above art, below text */}
                {contentPalette.darkContent && (
                    <Rect width={DESIGN_W} height={designH} opacity={Math.min(1.4, strength)}
                        {...linear(0, 0, 0, designH, [[0, 'rgba(4,10,24,0.28)'], [0.34, 'rgba(4,10,24,0.08)'], [1, 'rgba(4,10,24,0.56)']])} />
                )}
                <Motifs title={data.title} palette={contentPalette} decorationId={recipe.decoration} />
                {fontsReady && photo !== undefined && <Layout data={data} palette={contentPalette} />}
                {fontsReady && photo !== undefined && <ExtraTexts extras={extras} palette={contentPalette} />}
                {fontsReady && photo !== undefined && elements.length > 0 && <CustomElements elements={elements} data={data} palette={contentPalette} editing={editing} />}
                <Frame palette={contentPalette} />
                {editing && (
                    <Group name="editor-ui" listening={false}>
                        {guides.x !== undefined && <Line points={[guides.x, 0, guides.x, designH]} stroke="#f43f5e" strokeWidth={0.8} dash={[4, 3]} />}
                        {guides.y !== undefined && <Line points={[0, guides.y, DESIGN_W, guides.y]} stroke="#f43f5e" strokeWidth={0.8} dash={[4, 3]} />}
                    </Group>
                )}
                {editing && (
                    <Transformer
                        ref={trRef} name="editor-ui" shouldOverdrawWholeArea rotateEnabled={isElementId(selectedId)} keepRatio={!(selEl && (selEl.type === 'image' || (selEl.type === 'shape' && selEl.kind !== 'line') || selEl.type === 'block'))} flipEnabled={false}
                        enabledAnchors={selEl && selEl.type === 'shape' && selEl.kind === 'line'
                            ? ['middle-left', 'middle-right']
                            : selEl && (selEl.type === 'image' || selEl.type === 'shape')
                                ? ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']
                                : ['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                        anchorSize={9 / k} anchorCornerRadius={2} borderStroke="#f97316" anchorStroke="#f97316" anchorFill="#ffffff" borderStrokeWidth={1 / k}
                        boundBoxFunc={(o, n) => (n.width < 12 || (n.height < 8 && !(selEl && selEl.kind === 'line')) ? o : n)}
                    />
                )}
            </Layer>
        </Stage>
        </EditContext.Provider>
    );
});

export default PosterStage;
