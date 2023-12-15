'use client';

import { safeUnreachable } from '@masknet/kit';
import { createIndicator, createPageable, EMPTY_LIST, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { attemptUntil } from '@masknet/web3-shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { useMemo } from 'react';
import { useInView } from 'react-cool-inview';

import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { ProfileInList } from '@/components/Search/ProfileInList.js';
import { useSearchState } from '@/components/Search/useSearchState.js';
import { SearchType, SocialPlatform } from '@/constants/enum.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post, Profile } from '@/providers/types/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function Page() {
    const { keyword, searchType } = useSearchState();
    const { currentSource } = useGlobalState();

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['search', searchType, keyword, currentSource],
        queryFn: async ({ pageParam }) => {
            if (!keyword) return;

            const indicator = pageParam ? createIndicator(undefined, pageParam) : undefined;

            if (searchType === SearchType.Profiles) {
                switch (currentSource) {
                    case SocialPlatform.Lens:
                        return LensSocialMediaProvider.searchProfiles(keyword, indicator);
                    case SocialPlatform.Farcaster:
                        return WarpcastSocialMediaProvider.searchProfiles(keyword, indicator);
                    default:
                        safeUnreachable(currentSource);
                        return;
                }
            } else if (searchType === SearchType.Posts) {
                switch (currentSource) {
                    case SocialPlatform.Lens:
                        return LensSocialMediaProvider.searchPosts(keyword, indicator);
                    case SocialPlatform.Farcaster:
                        return attemptUntil<Pageable<Post, PageIndicator>>(
                            [
                                async () => WarpcastSocialMediaProvider.searchPosts(keyword, indicator),
                                async () => FireflySocialMediaProvider.searchPosts(keyword, indicator),
                            ],
                            createPageable<Post>(EMPTY_LIST, createIndicator(indicator)),
                        );
                    default:
                        safeUnreachable(currentSource);
                        return;
                }
            } else {
                safeUnreachable(searchType);
                return;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
    });

    const { observe } = useInView({
        rootMargin: '300px 0px',
        onChange: async ({ inView }) => {
            if (!inView || !hasNextPage || isFetching || isFetchingNextPage) {
                return;
            }
            await fetchNextPage();
        },
    });

    const results = useMemo(() => {
        return compact(data.pages.flatMap((x) => x?.data as Array<Profile | Post>));
    }, [data.pages]);

    return (
        <div>
            {results.length ? (
                results.map((item) => {
                    if (searchType === SearchType.Profiles) {
                        const profile = item as Profile;
                        return <ProfileInList key={profile.profileId} profile={profile} />;
                    }
                    if (searchType === SearchType.Posts) {
                        const post = item as Post;
                        return <SinglePost key={post.postId} post={post} />;
                    }
                    return null;
                })
            ) : (
                <NoResultsFallback />
            )}

            {hasNextPage && results.length ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
}