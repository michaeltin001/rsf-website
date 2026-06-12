export interface BasePageConfig {
    type: 'home' | 'stem-ms' | 'standard';
    title?: string;
    description?: string;
}

// --- 1. Home Page / Hero Layout Types ---
export interface Initiative {
    title: string;
    content: string;
}

export interface HeroSection {
    title: string;
    backgroundImage: string;
}

export interface AboutSection {
    title: string;
    headline: string;
    content: string;
    imagePlaceholder: string;
}

export interface ImpactMetric {
    title: string;
    description: string;
    icon: string;
}

export interface ImpactSection {
    title: string;
    headlinePrefix: string;
    headlineHighlight: string;
    content: string;
    metrics: ImpactMetric[];
}

export interface VolunteerSection {
    title: string;
    headline: string;
    content: string;
    buttonPrimary: string;
    buttonSecondary: string;
    imagePlaceholder: string;
}

export interface HomePageConfig extends BasePageConfig {
    type: 'home';
    hero: HeroSection;
    about: AboutSection;
    impact: ImpactSection;
    initiatives: Initiative[];
    volunteer: VolunteerSection;
}

// --- 2. RUSD STEM MS Collaboration Types ---
export interface StemHeroSection {
    headline: string;
    sub_headline: string;
    cta_button: string;
    bg_image: string;
}

export interface StemPartner {
    name: string;
    short_name: string;
}

export interface StemInitiativeSection {
    title: string;
    headline: string;
    paragraphs: string[];
    partners: StemPartner[];
}

export interface StemProgramItem {
    title: string;
    focus: string;
    resources: string;
    icon: string;
}

export interface StemProgramsSection {
    title: string;
    headline: string;
    items: StemProgramItem[];
}

export interface StemContactInfo {
    name: string;
    email: string;
}

export interface StemContactSection {
    headline: string;
    body: string;
    info: StemContactInfo;
}

export interface StemResourceSlide {
    title: string;
    subtitle: string;
    diagramText: string;
}

export interface StemResourceSection {
    headline: string;
    slides: StemResourceSlide[];
}

export interface StemTimelineItem {
    period: string;
    title: string;
    description: string;
}

export interface StemTimelineProgram {
    name: string;
    items: StemTimelineItem[];
}

export interface StemTimelineSection {
    headline: string;
    sub_headline: string;
    programs: StemTimelineProgram[];
}

export interface StemFaqItem {
    question: string;
    answer: string;
}

export interface StemFaqSection {
    headline: string;
    sub_headline: string;
    items: StemFaqItem[];
}

export interface RUSDStemPageConfig extends BasePageConfig {
    type: 'stem-ms';
    hero: StemHeroSection;
    initiative: StemInitiativeSection;
    programs: StemProgramsSection;
    resources: StemResourceSection;
    timeline: StemTimelineSection;
    faq: StemFaqSection;
    contact: StemContactSection;
}

// --- 3. Standard Fallback Types ---
export interface StandardPageConfig extends BasePageConfig {
    type: 'standard';
    content: string;
}
