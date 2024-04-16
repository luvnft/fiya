import { produce } from 'immer';

import type { SocialPlatform } from '@/constants/enum.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import type { Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

function toggleMirror(source: SocialPlatform, postId: string) {
    patchPostQueryData(source, postId, (draft) => {
        draft.hasMirrored = !draft.hasMirrored;
        draft.stats = produce(draft.stats, (old) => {
            return {
                ...old,
                comments: old?.comments || 0,
                reactions: old?.reactions || 0,
                mirrors: (old?.mirrors || 0) + (draft?.hasMirrored ? 1 : -1),
            };
        });
    });
}

const METHODS_BE_OVERRIDDEN = ['mirrorPost', 'unmirrorPost'] as const;

export function SetQueryDataForMirrorPost(source: SocialPlatform) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (postId: string, ...args: unknown[]) => {
                    const m = method as (
                        postId: string,
                        ...args: unknown[]
                    ) => ReturnType<Exclude<Provider[K], undefined>>;
                    const result = await m.call(target.prototype, postId, ...args);

                    toggleMirror(source, postId);

                    return result;
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}
