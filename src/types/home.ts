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
  icon: string;
  title: string;
  description: string;
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

export interface HomeContent {
  hero: HeroSection;
  about: AboutSection;
  impact: ImpactSection;
  initiatives: Initiative[];
  volunteer: VolunteerSection;
}
