import React from 'react';
import { HistoryProvider } from '../../../context/HistoryContext';
import PosterGenerator from '../PosterGenerator';

// Dev-only QA page (not mounted in production): /dev/editor?tab=design
// Seeds a finished poster so the whole editor (Layouts / Design / Text tabs...) can be looked at without logging in or generating.
const BG = 'https://res.cloudinary.com/dld4lmm8j/image/upload/v1791364526/nimbus/sdnkrijzybuwtee2qqqc.jpg';

const seed = () => {
    try {
        localStorage.setItem('nimbus-last-poster', JSON.stringify({
            selectedTemplate: 'event',
            formData: { eventName: 'TechFest 2025', tagline: 'Innovate. Create. Celebrate.', subdescription: 'Three days of competitions, workshops and live performances.', date: 'March 15-17, 2025', time: '9:00 AM onwards', venue: 'Main Auditorium', organizer: 'Society Council' },
            generatedImage: BG,
            posterStyle: { skeleton: new URLSearchParams(window.location.search).get('s') || 'magazine-cover', background: 'solid-gradient', frame: 'none', decoration: 'none', paletteId: new URLSearchParams(window.location.search).get('p') || 'auto', custom: {} },
        }));
    } catch { /* ignore */ }
    return true;
};

const DevEditor = () => {
    const [ready] = React.useState(seed);
    if (!ready) return null;
    return (
        <HistoryProvider><PosterGenerator /></HistoryProvider>
    );
};

export default DevEditor;
