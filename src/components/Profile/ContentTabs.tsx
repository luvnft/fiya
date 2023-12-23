import { Trans } from '@lingui/macro';
import { useState } from 'react';

import type { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';

import ContentCollected from './ContentCollected.js';
import ContentFeed from './ContentFeed.js';

enum TabEnum {
    Feed = 'Feed',
    Collected = 'Collected',
}

interface ContentTabsProps {
    profileId: string;
    source: SocialPlatform;
}
export default function ContentTabs({ profileId, source }: ContentTabsProps) {
    const [tab, setTab] = useState<TabEnum>(TabEnum.Feed);

    return (
        <>
            <div className=" flex gap-5 border-b border-lightLineSecond px-5 dark:border-line">
                {Object.values(TabEnum).map((tabName) => (
                    <div key={tabName} className=" flex flex-col">
                        <button
                            className={classNames(
                                ' flex h-[46px] items-center px-[14px] font-extrabold transition-all',
                                tab === tabName ? ' text-main' : ' text-third hover:text-main',
                            )}
                            onClick={() => setTab(tabName)}
                        >
                            {tabName === TabEnum.Feed ? <Trans>Feed</Trans> : <Trans>Collected</Trans>}
                        </button>
                        <span
                            className={classNames(
                                ' h-1 w-full rounded-full bg-[#9250FF] transition-all',
                                tab !== tabName ? ' hidden' : '',
                            )}
                        />
                    </div>
                ))}
            </div>

            {tab === TabEnum.Feed && <ContentFeed source={source} profileId={profileId} />}

            {tab === TabEnum.Collected && <ContentCollected source={source} profileId={profileId} />}
        </>
    );
}
