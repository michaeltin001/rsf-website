import { notFound } from 'next/navigation';
import { getPageConfig } from '@/lib/content';
import { Metadata } from 'next';
import SciolyResourcesEvent from '@/components/scioly-resources/SciolyResourcesEvent';
import { SciolyResourcesPageConfig, SciolyEventItem } from '@/types/page';

export function generateStaticParams() {
    const config = getPageConfig('scioly-resources') as SciolyResourcesPageConfig | null;
    
    if (!config || !config.events) {
        return [];
    }
    
    return config.events.map((event) => {
        const slug = event.link.split('/').pop() || '';
        return {
            event_name: slug,
        };
    });
}

export async function generateMetadata({ params }: { params: Promise<{ event_name: string }> }): Promise<Metadata> {
    const { event_name } = await params;
    const config = getPageConfig('scioly-resources') as SciolyResourcesPageConfig | null;

    if (!config || !config.events) {
        return {};
    }

    const event = config.events.find(e => e.link.endsWith(`/${event_name}`));

    if (!event) {
        return {};
    }

    return {
        title: `${event.title} Syllabus`,
        description: `Science Olympiad syllabus and resources for ${event.title}.`,
    };
}

export default async function SciolyResourcesEventPage({ params }: { params: Promise<{ event_name: string }> }) {
    const { event_name } = await params;
    const config = getPageConfig('scioly-resources') as SciolyResourcesPageConfig | null;

    if (!config || !config.events) {
        notFound();
    }

    const event = config.events.find(e => e.link.endsWith(`/${event_name}`));

    if (!event) {
        notFound();
    }

    return (
        <SciolyResourcesEvent event={event} config={config} />
    );
}
