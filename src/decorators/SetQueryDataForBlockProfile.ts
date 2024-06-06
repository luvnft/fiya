import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import type { SocialSource } from '@/constants/enum.js';
import { patchNotificationQueryDataOnAuthor } from '@/helpers/patchNotificationQueryData.js';
import { type Matcher, patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import { type Profile, type Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

function setBlockStatus(source: SocialSource, profileId: string, status: boolean) {
    const matcher: Matcher = (post) => post?.author.profileId === profileId;
    patchPostQueryData(source, matcher, (draft) => {
        if (draft.author.profileId !== profileId) return;
        draft.author.viewerContext = {
            ...draft.author.viewerContext,
            blocking: status,
        };
    });

    queryClient.setQueriesData<Profile>({ queryKey: ['profile', source] }, (old) => {
        if (!old || old.profileId !== profileId) return old;
        return produce(old, (draft) => {
            draft.viewerContext = {
                ...draft.viewerContext,
                blocking: status,
            };
        });
    });

    patchNotificationQueryDataOnAuthor(source, (profile) => {
        if (profile.profileId === profileId) {
            profile.viewerContext = {
                ...profile.viewerContext,
                blocking: status,
            };
        }
    });

    queryClient.setQueryData(['profile-is-blocked', source, profileId], status);
}

const METHODS_BE_OVERRIDDEN = ['blockProfile', 'unblockProfile'] as const;

export function SetQueryDataForBlockProfile(source: SocialSource) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (profileId: string) => {
                    const m = method as (profileId: string) => Promise<boolean>;
                    const status = key === 'blockProfile';
                    setBlockStatus(source, profileId, status);
                    try {
                        const result = await m?.call(target.prototype, profileId);
                        if (!result) {
                            // rolling back
                            setBlockStatus(source, profileId, !status);
                            return false;
                        }
                        return result;
                    } catch (err) {
                        // rolling back
                        setBlockStatus(source, profileId, !status);
                        throw err;
                    }
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);
        return target;
    };
}