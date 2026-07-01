export interface BasePageConfig {
    type: 'home' | 'stem-partner' | 'standard' | 'our-team' | 'tally' | 'scioly-resources';
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

// --- Scioly Resources Types ---
export interface SciolyResourcesPageConfig extends BasePageConfig {
    type: 'scioly-resources';
    paragraphs?: string[];
}

// --- 5. Tally Page Types ---
export interface TallyPageConfig extends BasePageConfig {
    type: 'tally';
    labels: {
        current_time: string;
        date: string;
        delay: string;
        button_pits: string;
        button_filter: string;
        button_setup: string;
        button_reset: string;
        syncing: string;
        button_view_schedule: string;
        button_settings: string;
        minutes: string;
        team_prefix: string;
    };
    empty_state: {
        title: string;
        subtitle: string;
        button_configure: string;
        organizing_prefix: string;
        generator_link: string;
        organizing_suffix: string;
    };
    sections: {
        happening_now: {
            title: string;
            empty_text: string;
        };
        on_deck: {
            title: string;
            empty_text: string;
        };
        schedule: {
            title: string;
            empty_text: string;
        };
    };
    messages: {
        fetch_no_data: string;
        fetch_network_error: string;
        fetch_fallback_error: string;
        unknown_team: string;
    };
    schedule_modal: ScheduleModalConfig;
    settings_modal: SettingsModalConfig;
}

export interface ScheduleModalConfig {
    title: string;
    labels: {
        tournament_name: string;
        tournament_date: string;
        base_period: string;
        judging_multiplier: string;
        num_fields: string;
        num_judging: string;
        num_rounds: string;
        volunteers_arrive: string;
        team_check_in: string;
        opening_ceremonies: string;
        start_time: string;
        end_time: string;
        lunch_option: string;
        lunch_start: string;
        lunch_end: string;
        lunch_duration: string;
        team_list: string;
        team_table_header: string;
        lunch_break: string;
        matches: string;
        judging: string;
        session_continued: string;
        session_cont_short: string;
        view_schedule_title: string;
    };
    buttons: {
        go_back: string;
        grid_view: string;
        list_view: string;
        export: string;
        export_xlsx: string;
        export_pdf: string;
        export_png: string;
        generate: string;
        switch_view: string;
        exporting: string;
        go_back_title: string;
        switch_view_title: string;
    };
    lunch_options: {
        no_lunch: string;
        specific_time: string;
        after_round_1: string;
        after_round_2: string;
    };
    defaults: {
        tournament_name: string;
        base_period: number;
        judging_multiplier: number;
        num_fields: number;
        num_judging: number;
        num_rounds: number;
        start_time: string;
        end_time: string;
        lunch_option: 'none' | 'time' | 'after_round_1' | 'after_round_2';
        lunch_duration: number;
        lunch_start: string;
        lunch_end: string;
        volunteers_arrive: string;
        team_check_in: string;
        opening_ceremonies: string;
        team_list: string;
    };
    messages: {
        generation_failed: string;
        no_schedule_title: string;
        no_schedule_subtitle: string;
        export_failed_png: string;
        export_failed_pdf: string;
        export_failed_xlsx: string;
        no_matches: string;
        no_judging: string;
        error_loading: string;
        no_data_found: string;
        failed_parse: string;
        recommendation_prefix: string;
        recommendation_fields: string;
        recommendation_equals: string;
        recommendation_judging: string;
        recommendation_suffix: string;
    };
}

export interface SettingsModalConfig {
    title: string;
    tabs: {
        data_source: string;
        filter_teams: string;
        pit_information: string;
        data_source_mobile: string;
        filter_teams_mobile: string;
        pit_information_mobile: string;
    };
    labels: {
        google_sheet_id: string;
        sheet_id_placeholder: string;
        find_this_in_url: string;
        url_example: string;
        reset_all_settings: string;
        reset_warning: string;
        select_all: string;
        deselect_all: string;
        pit: string;
    };
    buttons: {
        save: string;
    };
    messages: {
        no_teams_available: string;
        no_teams_selected: string;
        warning_prefix: string;
        warning_code: string;
        warning_middle: string;
        warning_strong: string;
        warning_suffix: string;
    };
    errors: {
        empty_sheet_id: string;
        invalid_sheet_id: string;
    };
}

