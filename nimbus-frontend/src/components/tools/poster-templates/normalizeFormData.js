

/**
 * Normalize form data from any template type into a universal poster data shape.
 *
 * @param {string} templateType 
 * @param {object} formData 
 * @returns {object} 
 */
export const normalizeFormData = (templateType, formData = {}) => {
    const d = formData;

    const title = d.eventTitle || d.eventName || d.announcementTitle || d.recruitmentTitle || '';

    let subtitle = '';
    switch (templateType) {
        case 'academic':
            subtitle = d.speakerDesignation || d.department || '';
            break;
        case 'recruitment':
            subtitle = d.teamName || '';
            break;
        case 'event':
            subtitle = d.tagline || '';
            break;
        case 'hackathon':
            subtitle = d.hackathonTheme || '';
            break;
        case 'announcement':
            subtitle = d.applicableTo || '';
            break;
        default:
            subtitle = d.tagline || d.department || '';
    }

    const organizer = d.department || d.teamName || d.organizer || d.issuedBy || '';

    // Form labels use `description` for the short subheading and
    // `subdescription` for the longer description.
    const formSubheading = d.description || d.details || '';
    const description = d.subdescription || '';

    const speakerName = d.speakerName || '';
    const speakerDesignation = d.speakerDesignation || '';

    const infoItems = [];

    const date = d.date || d.dateDuration || d.deadline || d.importantDates || '';
    const time = d.time || '';
    const venue = d.venue || '';
    const venueMode = d.venueMode || '';

    if (date) {
        infoItems.push({
            label: templateType === 'recruitment' && (d.deadline) ? 'Apply By' : 'Date',
            value: date
        });
    }
    if (time) infoItems.push({ label: 'Time', value: time });
    if (venue) infoItems.push({ label: 'Venue', value: venue });
    if (!venue && venueMode) infoItems.push({ label: 'Mode', value: venueMode });

    // ─── Extra Details (template-specific supplementary info) ─────────────────
    const extraItems = [];

    // Helper to split text blocks into bullet arrays for extraItems
    const splitToBullets = (text) => {
        if (!text) return text;
        const parts = text.split(/(?:\n|\.\s+)/).map(s => s.trim().replace(/^[-•*]\s*/, '')).filter(Boolean);
        return parts.length > 1 ? parts : text;
    };

    if (templateType === 'recruitment') {
        if (d.eligibility) extraItems.push({ label: 'Who Can Apply', value: splitToBullets(d.eligibility) });
        if (d.benefits) extraItems.push({ label: 'Highlights', value: splitToBullets(d.benefits) });
        if (d.contactInfo) extraItems.push({ label: 'Contact', value: d.contactInfo });
    }

    if (templateType === 'hackathon') {
        if (d.prizes) extraItems.push({ label: 'Prizes', value: splitToBullets(d.prizes) });
        if (d.registrationDeadline) extraItems.push({ label: 'Register By', value: d.registrationDeadline });
    }

    if (templateType === 'event') {
        if (d.highlights) extraItems.push({ label: 'Highlights', value: splitToBullets(d.highlights) });
        if (d.prizes) extraItems.push({ label: 'Prizes', value: splitToBullets(d.prizes) });
    }
    // Prefer the explicitly entered short subheading; otherwise retain the
    // template-specific subtitle (tagline, team, department, etc.).
    subtitle = formSubheading || subtitle;

    const collegeLogo = d.collegeLogo || null;
    const eventBrandLogo = d.eventBrandLogo || d.eventLogo || null;

    const speakerPhoto = d.speakerPhoto || null;
    const speakerShape = d.speakerShape || 'Hexagon';

    // QR is rendered only when a QR image was explicitly uploaded in the current form.
    const qr1 = d.qr1Image ? { image: d.qr1Image, label: d.qr1Label || 'Scan to register' } : null;
    const qr2 = (d.qr2Image) ? { image: d.qr2Image, label: d.qr2Label || 'Scan me!' } : null;

    let footer = '';
    if (d.contactInfo && templateType !== 'recruitment') {
        footer = d.contactInfo;
    }

    return {
        title,
        subtitle,
        organizer,
        description,
        speakerName,
        speakerDesignation,
        duration: d.duration || '',
        infoItems,
        extraItems,
        // Logos
        collegeLogo,
        eventBrandLogo,
        eventLogo: eventBrandLogo, // backward compat
        // Person
        speakerPhoto,
        speakerShape,
        // QR
        qr1,
        qr2,
        footer,
        templateType,
    };
};

export default normalizeFormData;
