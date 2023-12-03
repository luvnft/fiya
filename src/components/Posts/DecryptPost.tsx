'use client';
import { DOMProxy } from '@dimensiondev/holoflows-kit';
import { type PostContext, PostInfoProvider } from '@masknet/plugin-infra/content-script';
import {
    createConstantSubscription,
    EMPTY_ARRAY,
    EnhanceableSite,
    PostIdentifier,
    ProfileIdentifier,
    ValueRef,
} from '@masknet/shared-base';
import type { TypedMessage } from '@masknet/typed-message';
import { makeTypedMessageEmpty, makeTypedMessageTuple } from '@masknet/typed-message';
import { compact } from 'lodash-es';
import { memo, type PropsWithChildren, useMemo, useState } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { DecryptMessage } from '@/main/DecryptMessage.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface Props extends PropsWithChildren<{}> {
    raw: string;
    post: Post;
}

export const DecryptPost = memo(function DecryptPost({ raw, post, children }: Props) {
    const [result, setResult] = useState<TypedMessage | null>(null);

    const payload = raw.replace(/.*PostData_v2=/, '');
    const hasMaskPayload = /\bPostData_v2=/.test(raw);
    const postInfo = useMemo((): PostContext => {
        const author = ProfileIdentifier.of('mask.social', post.author.displayName).unwrapOr(null);
        const url = `${location.origin}/detail/${post.source === SocialPlatform.Farcaster ? 'farcaster' : 'lens'}/${
            post.postId
        }`;
        const imageUris: string[] = compact(
            post.metadata.content?.attachments
                ?.filter((x) => x.type === 'Image')
                .map((x) => x.uri)
                .filter(Boolean) ?? [],
        );
        return {
            author: createConstantSubscription(author),
            coAuthors: EMPTY_ARRAY,
            avatarURL: createConstantSubscription(new URL(post.author.pfp)),
            nickname: createConstantSubscription(post.author.nickname),
            site: EnhanceableSite.Firefly,
            postID: createConstantSubscription(post.postId),
            get rootNode() {
                return null;
            },
            rootElement: DOMProxy(),
            actionsElement: DOMProxy(),
            // TODO
            isFocusing: false,
            suggestedInjectionPoint: document.body,
            comment: undefined,
            identifier: createConstantSubscription(author ? new PostIdentifier(author, post.postId) : null),
            url: createConstantSubscription(new URL(url)),
            mentionedLinks: createConstantSubscription([]),
            postMetadataImages: createConstantSubscription(imageUris),
            rawMessage: createConstantSubscription(makeTypedMessageTuple([makeTypedMessageEmpty()])),
            encryptComment: new ValueRef<null | ((commentToEncrypt: string) => Promise<string>)>(null),
            decryptComment: new ValueRef<null | ((commentToEncrypt: string) => Promise<string | null>)>(null),
            hasMaskPayload: createConstantSubscription(!!hasMaskPayload),
            postIVIdentifier: createConstantSubscription(null),
            publicShared: createConstantSubscription(!post.isHidden),
            isAuthorOfPost: createConstantSubscription(!post.hasMirrored),
            version: createConstantSubscription(-40),
            decryptedReport() {
                return;
            },
        };
    }, [post, hasMaskPayload]);

    return (
        <PostInfoProvider post={postInfo}>
            {children}
            <div
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <DecryptMessage text={payload} version="2" />
            </div>
        </PostInfoProvider>
    );
});
