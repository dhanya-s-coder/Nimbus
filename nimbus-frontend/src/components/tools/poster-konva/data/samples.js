// Sample content used by the inspiration gallery and the dev QA page.
export const SAMPLES = {
    academic: { eventTitle: 'Research Symposium 2025', speakerName: 'Dr. John Smith', speakerDesignation: 'Professor of Computer Science', department: 'Department of Computer Science', date: 'January 15, 2025', time: '10:00 AM - 12:00 PM', venue: 'Seminar Hall A', description: 'A deep dive into modern AI research', subdescription: 'Join us for an inspiring session covering the latest developments in machine learning, with live demos, Q&A and networking with researchers from across the country.' },
    recruitment: { recruitmentTitle: 'Join Our Team!', teamName: 'Nimbus Tech Club', description: 'Build. Learn. Lead.', subdescription: 'We are recruiting passionate students for design, development and outreach roles for the upcoming year.', eligibility: '2nd year students and above', benefits: 'Mentorship, networking, certificates', deadline: 'Apply by January 20, 2025', contactInfo: 'recruitment@nimbus.io' },
    event: { eventName: 'TechFest 2025', tagline: 'Innovate. Create. Celebrate.', description: 'Three days of tech', subdescription: 'The biggest student-run technology festival with competitions, workshops and live performances.', date: 'March 15-17, 2025', time: '9:00 AM onwards', venue: 'Main Auditorium', organizer: 'Society Council', highlights: 'Live performances, workshops, prizes', prizes: 'Winner: Rs 10,000, certificates' },
    hackathon: { eventName: 'CodeSprint 2025', hackathonTheme: 'AI for Social Good', duration: '48 Hours', subdescription: 'Build something that matters in 48 hours with mentors on call.', dateDuration: 'Feb 10-12', venueMode: 'Hybrid', organizer: 'Nimbus Tech Club', prizes: 'Rs 50,000 prize pool, internships', registrationDeadline: 'Feb 5, 2025' },
    announcement: { announcementTitle: 'Campus Closure Notice', details: 'Effective immediately', subdescription: 'The campus will remain closed on Friday for maintenance. All classes are rescheduled.', applicableTo: 'All students and faculty', importantDates: 'Effective from Jan 1, 2025', issuedBy: 'Office of Administration' },
};

/** The form field that holds the poster title for each template. */
export const TITLE_FIELD = {
    academic: 'eventTitle',
    recruitment: 'recruitmentTitle',
    event: 'eventName',
    hackathon: 'eventName',
    announcement: 'announcementTitle',
};

/** Which layouts suit which mood (from the art director). */
export const MOOD_LAYOUTS = {
    formal: ['framed-classic', 'editorial', 'centered'],
    elegant: ['framed-classic', 'editorial', 'split-panel'],
    playful: ['bold-hero', 'event-cards', 'asymmetric'],
    energetic: ['bold-hero', 'asymmetric', 'event-cards'],
    tech: ['bold-hero', 'asymmetric', 'split-panel'],
    minimal: ['editorial', 'centered', 'split-panel'],
};
