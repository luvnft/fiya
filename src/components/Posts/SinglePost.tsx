'use client';

import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation.js';
import { memo, useMemo } from 'react';
import { useInView } from 'react-cool-inview';

import { FeedActionType } from '@/components/Posts/ActionType.js';
import { PostBody } from '@/components/Posts/PostBody.js';
import { PostHeader } from '@/components/Posts/PostHeader.js';
import { SocialPlatform } from '@/constants/enum.js';
import { dynamic } from '@/esm/dynamic.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useObserveLensPost } from '@/hooks/useObserveLensPost.js';
import type { Post } from '@/providers/types/SocialMedia.js';

const PostActions = dynamic(() => import('@/components/Actions/index.js').then((module) => module.PostActions), {
    ssr: false,
});

interface SinglePostProps {
    post: Post;
    disableAnimate?: boolean;
    showMore?: boolean;
    isComment?: boolean;
    isDetail?: boolean;
}
export const SinglePost = memo<SinglePostProps>(function SinglePost({
    post,
    disableAnimate = false,
    showMore = false,
    isComment = false,
    isDetail = false,
}) {
    const router = useRouter();
    const { observe } = useObserveLensPost(post.postId, post.source);

    const pathname = usePathname();
    const isPostPage = isRoutePathname(pathname, '/post');
    const postLink = getPostUrl(post);

    const { observe: observeRef } = useInView({
        rootMargin: '300px 0px',
        onChange: async ({ inView }) => {
            if (!inView || isPostPage) {
                return;
            }
            router.prefetch(postLink);
        },
    });

    const isThread = useMemo(() => {
        switch (post.source) {
            case SocialPlatform.Lens:
                return (
                    post.type === 'Comment' &&
                    post.firstComment?.postId === post.postId &&
                    isSameProfile(post.root?.author, post.author)
                );
            case SocialPlatform.Farcaster:
                return (
                    post.type === 'Comment' &&
                    isSameProfile(post.commentOn?.author, post.author) &&
                    isSameProfile(post.root?.author, post.author)
                );
            default:
                safeUnreachable(post.source);
                return false;
        }
    }, [post]);

    return (
        <motion.article
            ref={observeRef}
            initial={!disableAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cursor-pointer border-b border-line bg-bottom px-4 py-3 hover:bg-bg"
            onClick={() => {
                const selection = window.getSelection();
                if (selection && selection.toString().length !== 0) return;
                if (!isPostPage || isComment) router.push(postLink);
                return;
            }}
        >
            {!isComment ? <FeedActionType post={post} /> : null}

            <PostHeader post={post} />

            <PostBody post={post} showMore={showMore} ref={observe} />

            {!isDetail ? <PostActions post={post} disabled={post.isHidden} /> : null}

            {isThread && !isPostPage ? (
                <div className="mt-2 w-full cursor-pointer text-center text-[15px] font-bold text-link">
                    <div>
                        <Trans>Show More</Trans>
                    </div>
                </div>
            ) : null}
        </motion.article>
    );
});
