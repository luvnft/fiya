import urlcat from 'urlcat';

import type { SourceInURL } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import { getChannelById } from '@/services/getChannelById.js';

export async function getChannelOGById(source: SourceInURL, channelId: string) {
    const channel = await getChannelById(resolveSocialPlatform(source), channelId);
    if (!channel) return createSiteMetadata();

    const images = [
        {
            url: channel.imageUrl,
        },
    ];

    const title = createPageTitle(`${channel.name} (/${channel.id})`);
    const description = channel.description ?? '';

    return createSiteMetadata({
        openGraph: {
            type: 'website',
            url: urlcat(SITE_URL, getChannelUrl(channel)),
            title,
            description,
            images,
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images,
        },
    });
}
