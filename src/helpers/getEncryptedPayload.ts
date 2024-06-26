import { compact, first } from 'lodash-es';

import type { Post } from '@/providers/types/SocialMedia.js';
import { steganographyDecodeImage } from '@/services/steganography.js';

export type EncryptedPayload = readonly [string | Uint8Array, '1' | '2'];

export function getEncryptedPayloadFromText(post: Post): EncryptedPayload | undefined {
    const raw = post.metadata.content?.content;
    if (!raw) return;

    const matched = raw.match(/(?:.*)PostData_(v1|v2)=(.*)/);
    if (!matched) return;

    const [, version, payload] = matched;

    if (version === 'v1') return [payload, '1'];
    if (version === 'v2') return [payload, '2'];
    return;
}

export async function getEncryptedPayloadFromImageAttachment(post: Post): Promise<EncryptedPayload | undefined> {
    const result =
        post.metadata.content?.attachments?.map(async (attachment) => {
            if (attachment.type !== 'Image') return;
            if (!attachment.uri) return;

            const decoded = await steganographyDecodeImage(attachment.uri);
            if (!decoded) return;

            return [decoded, '2'] as EncryptedPayload;
        }) ?? [];

    const allSettled = await Promise.allSettled(result);
    return first(compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null))));
}
