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
export interface StemHeaderSection {
    headline: string;
    partnership_text: string;
    partners: string[];
}

export interface StemOurProgramSection {
    title: string;
    headline: string;
    content: string;
}

export interface StemProgramItem {
    title: string;
    description: string;
    icon: string;
}

export interface StemProgramsSection {
    title: string;
    items: StemProgramItem[];
}

export interface StemInvolvementSection {
    title: string;
    headline: string;
}

export interface StemContactSection {
    title: string;
    text: string;
    email: string;
    name: string;
}

export interface RUSDStemPageConfig extends BasePageConfig {
    type: 'stem-ms';
    header: StemHeaderSection;
    our_program: StemOurProgramSection;
    programs: StemProgramsSection;
    involvement: StemInvolvementSection;
    contact: StemContactSection;
}

// --- 3. Standard Fallback Types ---
export interface StandardPageConfig extends BasePageConfig {
    type: 'standard';
    content: string;
}
