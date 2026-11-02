import React, { useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PosterStage from './PosterStage';
import { getDesignByIndex } from './data/autoDesigner';
import { normalizeFormData } from './data/normalizeFormData';
import { exportPosterBlob } from './engine/exportPoster';
import { applyContent } from './editor/content';

// Dev-only QA page (not mounted in production): /dev/poster?t=event&i=0&p=royalPurple&bg=0
const SAMPLES = {
    academic: { eventTitle: 'Research Symposium 2025', speakerName: 'Dr. John Smith', speakerDesignation: 'Professor of Computer Science', department: 'Department of Computer Science', date: 'January 15, 2025', time: '10:00 AM - 12:00 PM', venue: 'Seminar Hall A', description: 'A deep dive into modern AI research', subdescription: 'Join us for an inspiring session covering the latest developments in machine learning, with live demos, Q&A and networking with researchers from across the country.' },
    recruitment: { recruitmentTitle: 'Join Our Team!', teamName: 'Nimbus Tech Club', description: 'Build. Learn. Lead.', subdescription: 'We are recruiting passionate students for design, development and outreach roles for the upcoming year.', eligibility: '2nd year students and above', benefits: 'Mentorship, networking, certificates', deadline: 'Apply by January 20, 2025', contactInfo: 'recruitment@nimbus.io' },
    event: { eventName: 'TechFest 2025', tagline: 'Innovate. Create. Celebrate.', description: 'Three days of tech', subdescription: 'The biggest student-run technology festival with competitions, workshops and live performances.', date: 'March 15-17, 2025', time: '9:00 AM onwards', venue: 'Main Auditorium', organizer: 'Society Council', highlights: 'Live performances, workshops, prizes', prizes: 'Winner: Rs 10,000, certificates' },
    hackathon: { eventName: 'CodeSprint 2025', hackathonTheme: 'AI for Social Good', duration: '48 Hours', subdescription: 'Build something that matters in 48 hours with mentors on call.', dateDuration: 'Feb 10-12', venueMode: 'Hybrid', organizer: 'Nimbus Tech Club', prizes: 'Rs 50,000 prize pool, internships', registrationDeadline: 'Feb 5, 2025' },
    announcement: { announcementTitle: 'Campus Closure Notice', details: 'Effective immediately', subdescription: 'The campus will remain closed on Friday for maintenance. All classes are rescheduled.', applicableTo: 'All students and faculty', importantDates: 'Effective from Jan 1, 2025', issuedBy: 'Office of Administration' },
};
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
            // ?typo={"title":{"font":"Anton","case":"upper"}}  /  ?ov={"sub":{"style":{"color":"#f59e0b"}}}
            ...(q.get('typo') ? { typography: JSON.parse(q.get('typo')) } : {}),
            ...(q.get('ov') ? { overrides: JSON.parse(q.get('ov')) } : {}),
            // ?el=[{...elements}]  /  ?bg={"c1":"#111","c2":"#333"}  (free-form canvas)
            ...(q.get('content') ? { content: JSON.parse(q.get('content')) } : {}),
            ...(q.get('el') ? { elements: JSON.parse(q.get('el')) } : {}),
            ...(q.get('cbg') ? { bg: JSON.parse(q.get('cbg')) } : {}),
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
            <PosterStage ref={ref} recipe={recipe} data={applyContent(normalizeFormData(t, form), recipe.custom.content)} aiBackgroundImage={q.get('bg') === '0' ? null : BG} width={600} />
        </div>
    );
};

export default DevPreview;
