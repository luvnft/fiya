import { uniqBy } from 'lodash-es';

import { isSameProfile } from '@/helpers/isSameProfile.js';
import { type Post } from '@/providers/types/SocialMedia.js';

export function mergeTreadPostsForLens(posts: Post[]) {
    const filtered = posts.filter((post, index, arr) => {
        if (post.type !== 'Comment') return true;

        if (
            !post.root &&
            isSameProfile(post.author, post.commentOn?.author) &&
            arr.some((x) => x.root?.postId === post.commentOn?.postId)
        )
            return false;

        return true;
    });

    return uniqBy(filtered, (x) => {
        if (x.type !== 'Comment' || !x.root) return x.postId;
        if (x.type === 'Comment' && x.firstComment?.postId !== x.postId) return x.postId;
        return x.root.postId;
    });
}
