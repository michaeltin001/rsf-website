import { notFound } from 'next/navigation';
import { getPageConfig } from '@/lib/content';
import { getConfig } from '@/lib/config';
import { Metadata } from 'next';

// Component Imports
import StemPartner from '@/components/stem-partner/StemPartner';
// import OurTeam from '@/components/team/OurTeam';
// import Tally from '@/components/tally/Tally';
import SciolyResources from '@/components/scioly-resources/SciolyResources';

import {
    BasePageConfig,
    StemPartnerPageConfig,
    StandardPageConfig,
    // OurTeamPageConfig,
    // TallyPageConfig,
    SciolyResourcesPageConfig
} from '@/types/page';

export function generateStaticParams() {
    const config = getConfig();
    
    // Safety fallback in case navigation doesn't strictly exist yet
    const navItems = (config as any)?.navigation || []; 
    
    return navItems
        .filter((nav: any) => nav.type === 'page' && nav.target !== 'home')
        .map((nav: any) => ({
            slug: nav.target,
        }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const pageConfig = getPageConfig(slug) as BasePageConfig | null;

    if (!pageConfig) {
        return {};
    }

    return {
        title: pageConfig.title,
        description: pageConfig.description,
    };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    // Dynamically fetch the respective TOML based on the URL slug
    const pageConfig = getPageConfig(slug) as BasePageConfig | null;

    // Trigger standard Next.js 404 behavior if the TOML isn't found
    if (!pageConfig) {
        notFound();
    }

    return (
        <div className="w-full">
            {pageConfig.type === 'stem-partner' && (
                <StemPartner config={pageConfig as StemPartnerPageConfig} />
            )}
            
            {pageConfig.type === 'standard' && (
                <StandardPageWrapper config={pageConfig as StandardPageConfig} />
            )}

            {/*
            {pageConfig.type === 'our-team' && (
                <OurTeam config={pageConfig as OurTeamPageConfig} />
            )}
            
            {pageConfig.type === 'tally' && (
                <Tally config={pageConfig as TallyPageConfig} />
            )}
            */}

            {pageConfig.type === 'scioly-resources' && (
                <SciolyResources config={pageConfig as SciolyResourcesPageConfig} />
            )}
            
            {/* Future modular pages can be added here simply by adding a new {pageConfig.type === '...'} condition */}
        </div>
    );
}

// A simple local wrapper component for handling theoretical text-only pages cleanly
function StandardPageWrapper({ config }: { config: StandardPageConfig }) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                {config.title}
            </h1>
            {config.description && (
                <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
                    {config.description}
                </p>
            )}
            <div className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                {config.content}
            </div>
        </div>
    );
}
