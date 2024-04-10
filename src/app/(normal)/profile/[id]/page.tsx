import type { Metadata } from 'next';

import { ProfileDetailPage } from '@/app/(normal)/profile/pages/DetailPage.js';
import { KeyType, type SourceInURL } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { getProfileOGById } from '@/services/getProfileOGById.js';

const getProfileOGByIdRedis = memoizeWithRedis(getProfileOGById, {
    key: KeyType.GetProfileOGById,
});

interface Props {
    params: {
        id: string;
    };
    searchParams: { source: SourceInURL };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    if (isBotRequest() && searchParams.source)
        return getProfileOGByIdRedis(searchParams.source as SourceInURL, params.id);
    return createSiteMetadata();
}

export default function Page(props: Props) {
    if (isBotRequest()) return null;

    return <ProfileDetailPage {...props} />;
}