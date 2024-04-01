'use client';

import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { useRouter } from 'next/navigation.js';
import { forwardRef } from 'react';

import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { SocialPlatform } from '@/constants/enum.js';
import { SORTED_SOURCES } from '@/constants/index.js';
import { useProfileStoreAll } from '@/hooks/useProfileStoreAll.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface LogoutModalProps {
    source?: SocialPlatform;
    profile?: Profile;
}

export const LogoutModal = forwardRef<SingletonModalRefCreator<LogoutModalProps | void>>(function LogoutModal(_, ref) {
    const router = useRouter();

    const profileStoreAll = useProfileStoreAll();

    const [open, dispatch] = useSingletonModal(ref, {
        async onOpen(props) {
            let profiles: Profile[] = [];

            if (props?.profile) {
                profiles = [props.profile];
            } else if (props?.source) {
                profiles = profileStoreAll[props.source].profiles;
            } else {
                profiles = SORTED_SOURCES.flatMap((x) => profileStoreAll[x].profiles);
            }
            const confirmed = await ConfirmModalRef.openAndWaitForClose({
                title: t`Log out`,
                content: (
                    <>
                        <div className="text-[15px] font-medium leading-normal text-lightMain">
                            {profiles.length > 1 ? (
                                <Trans>Confirm to log out these accounts?</Trans>
                            ) : (
                                <Trans>Confirm to log out this account?</Trans>
                            )}
                        </div>
                        {profiles.map((profile) => (
                            <div
                                key={profile.profileId}
                                className="flex items-center justify-between gap-2 rounded-[8px] px-3 py-2 backdrop-blur-[8px]"
                                style={{ boxShadow: '0px 0px 20px 0px var(--color-bottom-bg)' }}
                            >
                                <ProfileAvatar profile={profile} size={36} />
                                <ProfileName profile={profile} />
                            </div>
                        ))}
                    </>
                ),
            });
            if (!confirmed) return;

            const source = props?.source || props?.profile?.source;

            if (source) {
                profileStoreAll[source].clearCurrentProfile();
            } else {
                SORTED_SOURCES.forEach((x) => profileStoreAll[x].clearCurrentProfile());
            }

            dispatch?.close();
            await delay(300);
            router.push('/');
        },
    });

    return null;
});
