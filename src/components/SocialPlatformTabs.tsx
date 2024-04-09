'use client';

import { usePathname, useSearchParams } from 'next/navigation.js';
import { startTransition } from 'react';

import { SocialPlatform, SourceInURL } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { replaceSearchParams } from '@/helpers/replaceSearchParams.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function SocialPlatformTabs() {
    const { currentSource, updateCurrentSource } = useGlobalState();
    const currentProfileAll = useCurrentProfileAll();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    if (isRoutePathname(pathname, '/settings') || isRoutePathname(pathname, '/post')) return null;

    if (pathname !== '/profile' && isRoutePathname(pathname, '/profile')) {
        const param = pathname.split('/');
        const handle = param[param.length - 1];
        const sourceString = searchParams.get('source') as SourceInURL;
        const source = resolveSocialPlatform(sourceString);

        if (currentProfileAll[source]?.handle !== handle) return null;
    }

    return (
        <div className="border-b border-line bg-primaryBottom px-4">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                {[SocialPlatform.Farcaster, SocialPlatform.Lens].map((value) => (
                    <li key={value} className="flex flex-1 list-none justify-center lg:flex-initial lg:justify-start">
                        <a
                            className={classNames(
                                currentSource === value ? 'border-b-2 border-[#9250FF] text-main' : 'text-third',
                                'h-[43px] px-4 text-center text-xl font-bold leading-[43px] hover:cursor-pointer hover:text-main',
                                'md:h-[60px] md:py-[18px] md:leading-6',
                            )}
                            aria-current={currentSource === value ? 'page' : undefined}
                            onClick={() =>
                                startTransition(() => {
                                    scrollTo(0, 0);
                                    updateCurrentSource(value);
                                    replaceSearchParams(
                                        new URLSearchParams({
                                            source: resolveSourceInURL(value),
                                        }),
                                    );
                                })
                            }
                        >
                            {value}
                        </a>
                    </li>
                ))}
            </nav>
        </div>
    );
}
