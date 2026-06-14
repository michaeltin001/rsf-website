export interface BasePageConfig {
    type: 'home' | 'stem-partner' | 'standard' | 'our-team' | 'tally';
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

export interface StemInitiativeSection {
    title: string;
    headline: string;
    paragraphs: string[];
}

export interface StemProgramItem {
    title: string;
    description: string;
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

export interface StemTimelineSection {
    headline: string;
    sub_headline: string;
    levels: StemDevelopmentLevel[];
}


export interface StemDevelopmentLevel {
    level: string;
    title: string;
    text: string;
}

export interface StemSupportSection {
    title: string;
    items: string[];
}

export interface StemTargetAudienceItem {
    title: string;
    icon: string;
}

export interface StemTargetAudience {
    title: string;
    items: StemTargetAudienceItem[];
}

export interface StemGrantCallout {
    title: string;
    body: string;
    disclaimer: string;
}

export interface StemPartnerPageConfig extends BasePageConfig {
    type: 'stem-partner';
    hero: StemHeroSection;
    initiative: StemInitiativeSection;
    programs: StemProgramsSection;
    support: StemSupportSection;

    timeline: StemTimelineSection;
    grant_callout: StemGrantCallout;
    target_audience: StemTargetAudience;
    contact: StemContactSection;
}

// --- 3. Our Team Page Types ---
export interface TeamMember {
    name: string;
    title: string;
    description: string;
    image: string;
}

export interface OurTeamPageConfig extends BasePageConfig {
    type: 'our-team';
    team: TeamMember[];
}

// --- 4. Standard Fallback Types ---
export interface StandardPageConfig extends BasePageConfig {
    type: 'standard';
    content: string;
}

// --- 5. Tally Page Types ---
export interface TallyPageConfig extends BasePageConfig {
    type: 'tally';
}

