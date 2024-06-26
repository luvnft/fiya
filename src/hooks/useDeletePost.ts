import { t } from '@lingui/macro';
import { usePathname, useRouter } from 'next/navigation.js';
import { useAsyncFn } from 'react-use';

import { type SocialSource } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useComeBack } from '@/hooks/useComeback.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function useDeletePost(source: SocialSource) {
    const router = useRouter();
    const pathname = usePathname();
    const navBack = useComeBack();
    return useAsyncFn(
        async (post: Post) => {
            try {
                const provider = resolveSocialMediaProvider(source);
                const result = await provider.deletePost(post.postId);
                if (!result) throw new Error(`Failed to delete post: ${post.postId}`);

                if (isRoutePathname(pathname, '/post') && post.type === 'Post') {
                    navBack();
                }
                enqueueSuccessMessage(t`Post was deleted`);
            } catch (error) {
                enqueueErrorMessage(t`Failed to delete`, {
                    error,
                });
            }
        },
        [source, router, pathname, navBack],
    );
}
