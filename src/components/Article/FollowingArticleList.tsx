'use client';

import { createIndicator, createPageable } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { getArticleItemContent } from '@/components/VirtualList/getArticleItemContent.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export const FollowingArticleList = memo(function FollowingArticleList() {
    const currentSource = useGlobalState.use.currentSource();

    const articleQueryResult = useSuspenseInfiniteQuery({
        queryKey: ['articles', 'following', currentSource],
        networkMode: 'always',
        queryFn: async ({ pageParam }) => {
            if (currentSource !== Source.Article) return createPageable(EMPTY_LIST, undefined);
            return FireflyArticleProvider.getFollowingArticles(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((x) => x.data || EMPTY_LIST),
    });

    return (
        <ListInPage
            key={currentSource}
            queryResult={articleQueryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Following}:${currentSource}`,
                computeItemKey: (index, article) => `${article.id}-${index}`,
                itemContent: (index, article) =>
                    getArticleItemContent(index, article, `${ScrollListKey.Following}:${currentSource}`),
            }}
            NoResultsFallbackProps={{
                className: 'pt-[228px]',
            }}
        />
    );
});