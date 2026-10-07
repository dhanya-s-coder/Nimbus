import React, { useMemo } from 'react';
import PosterStage from '../PosterStage';
import { getDesignRecipes } from '../data/autoDesigner';
import { normalizeFormData } from '../data/normalizeFormData';
import { SAMPLES, TITLE_FIELD } from '../data/samples';
import '../poster-studio.css';

export const TEMPLATE_META = {
    academic: { icon: '🎓', blurb: 'Talks, seminars, guest lectures' },
    recruitment: { icon: '🤝', blurb: 'Recruitment drives, join us' },
    event: { icon: '🎉', blurb: 'Fests, cultural & social events' },
    hackathon: { icon: '💻', blurb: 'Hackathons, coding contests' },
    announcement: { icon: '📢', blurb: 'Notices & official updates' },
};

export const TemplateCards = ({ templates, selected, onSelect }) => (
    <div className="ps-templates" role="radiogroup" aria-label="Poster type">
        {Object.entries(templates).map(([id, t]) => (
            <button key={id} type="button" role="radio" aria-checked={selected === id} className={`ps-template ${selected === id ? 'active' : ''}`} onClick={() => onSelect(id)}>
                <span className="ps-template-icon">{TEMPLATE_META[id]?.icon}</span>
                <span className="ps-template-name">{t.name}</span>
                <span className="ps-template-blurb">{TEMPLATE_META[id]?.blurb}</span>
            </button>
        ))}
    </div>
);

/** Progress while the one-click flow runs. steps = ['Reading your details', ...]; active = index. */
export const Stepper = ({ steps, active }) => (
    <div className="ps-stepper" role="status" aria-live="polite">
        <div className="ps-orb" aria-hidden="true"><span /><span /><span /></div>
        <ol>
            {steps.map((label, i) => (
                <li key={label} className={i < active ? 'done' : i === active ? 'current' : ''}>
                    <span className="ps-step-dot">{i < active ? '✓' : i + 1}</span>
                    <span>{label}</span>
                </li>
            ))}
        </ol>
        <p className="ps-stepper-hint">Usually 15–40 seconds. You can keep tweaking the form meanwhile.</p>
    </div>
);

/** Live "looks" preview: the user's own title on 6 curated designs, so they can pick a style before creating. */
export const Inspiration = ({ template, title, picked, onPick }) => {
    const designs = useMemo(() => getDesignRecipes(template).slice(0, 6), [template]);
    const sample = SAMPLES[template];
    const field = TITLE_FIELD[template];
    const data = useMemo(() => normalizeFormData(template, { ...sample, [field]: (title || '').trim() || sample[field] }), [template, title, sample, field]);
    return (
        <div className="ps-inspo">
            <div className="ps-inspo-head">
                <h3>Pick a look</h3>
                <p>Optional — Nimbus will choose one that fits if you don't.</p>
            </div>
            <div className="ps-inspo-grid">
                {designs.map((d) => {
                    const active = picked && picked.skeleton === d.skeleton && picked.background === d.background && picked.frame === d.frame && picked.decoration === d.decoration;
                    return (
                        <button key={d.index} type="button" className={`ps-look ${active ? 'active' : ''}`} onClick={() => onPick(active ? null : d)} aria-pressed={!!active}>
                            <PosterStage recipe={{ ...d }} data={data} aiBackgroundImage={null} width={200} />
                            {active && <span className="ps-look-check">✓</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

/** One-tap adjustments under the poster. */
export const QuickTweaks = ({ onColors, onLayout, onBackground, onPhoto, onTitleSize, busy }) => (
    <div className="ps-tweaks" role="group" aria-label="Quick tweaks">
        <button type="button" onClick={onColors} title="Try a different colour palette">🎨 Colours</button>
        <button type="button" onClick={onLayout} title="Try a different layout">🔀 Layout</button>
        <button type="button" onClick={onBackground} disabled={busy} title="Generate a new background image">{busy ? '⏳ Background…' : '🖼 Background'}</button>
        <span className="ps-tweak-group">
            <button type="button" onClick={() => onPhoto(-0.2)} title="Lighter photo">☀️</button>
            <button type="button" onClick={() => onPhoto(0.2)} title="Darker photo">🌙</button>
        </span>
        <span className="ps-tweak-group">
            <button type="button" onClick={() => onTitleSize(-0.1)} title="Smaller title">A−</button>
            <button type="button" onClick={() => onTitleSize(0.1)} title="Bigger title">A+</button>
        </span>
    </div>
);

export const STYLE_CHIPS = [
    'Elegant & formal', 'Bold & colourful', 'Dark & techy', 'Minimal & clean', 'Warm & festive', 'Youthful & fun',
];
