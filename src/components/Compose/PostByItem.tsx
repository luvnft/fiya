import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import RadioDisableNoIcon from '@/assets/radio.disable-no.svg';
import YesIcon from '@/assets/yes.svg';
import { Avatar } from '@/components/Avatar.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useProfiles } from '@/hooks/useProfiles.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import { createSessionForProfileId } from '@/providers/lens/createSessionForProfileId.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useLensStateStore } from '@/store/useProfileStore.js';

interface PostByItemProps {
    source: SocialSource;
    disabled?: boolean;
}

export function PostByItem({ source, disabled = false }: PostByItemProps) {
    const profiles = useProfiles(source);
    const currentProfile = useCurrentProfile(source);

    const updateLensCurrentAccount = useLensStateStore.use.updateCurrentAccount();

    const { enableSource, disableSource } = useComposeStateStore();
    const { availableSources, images } = useCompositePost();

    const [{ loading }, loginLens] = useAsyncFn(
        async (profile: Profile) => {
            try {
                const session = await createSessionForProfileId(profile.profileId);
                updateLensCurrentAccount({ profile, session });
                lensSessionHolder.resumeSession(session);
                enqueueSuccessMessage(t`Your ${resolveSourceName(profile.source)} account is now connected.`);
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login`), {
                    error,
                });
                throw error;
            }
        },
        [updateLensCurrentAccount],
    );

    if (!currentProfile || !profiles?.length)
        return (
            <div className="flex h-10 items-center justify-between border-b border-secondaryLine last:border-none">
                <div className="flex items-center gap-2 text-main">
                    <SocialSourceIcon size={24} source={source} />
                    <span className="font-bold text-main">{resolveSourceName(source)}</span>
                </div>

                <ClickableButton
                    className="font-bold text-blueBottom"
                    onClick={async () => {
                        if (source === Source.Farcaster && images.length > 2) {
                            enqueueErrorMessage(t`Only up to 2 images can be chosen.`);
                            return;
                        }

                        ComposeModalRef.close();
                        await delay(300);
                        LoginModalRef.open({
                            source,
                        });
                    }}
                >
                    <Trans>Login</Trans>
                </ClickableButton>
            </div>
        );

    return profiles.map((profile) => (
        <div
            className={classNames(
                'flex h-10 items-center justify-between border-b border-secondaryLine last:border-none',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            )}
            key={profile.profileId}
            onClick={() => {
                if (!isSameProfile(currentProfile, profile) || disabled) return;
                if (availableSources.includes(currentProfile.source)) disableSource(currentProfile.source);
                else enableSource(currentProfile.source);
            }}
        >
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Avatar src={profile.pfp} size={24} alt={profile.handle} />
                    <SocialSourceIcon
                        className="absolute -bottom-1 -right-1 z-10 rounded-full border border-white dark:border-gray-900"
                        source={profile.source}
                        size={12}
                    />
                </div>
                <span
                    className={classNames(
                        'font-bold',
                        isSameProfile(currentProfile, profile) ? 'text-main' : 'text-secondary',
                    )}
                >
                    @{profile.handle}
                </span>
            </div>
            {isSameProfile(currentProfile, profile) ? (
                availableSources.includes(currentProfile.source) ? (
                    <YesIcon width={40} height={40} className="relative -right-[10px]" />
                ) : (
                    <RadioDisableNoIcon width={20} height={20} className="text-secondaryLine" />
                )
            ) : currentProfile.source === Source.Lens ? (
                <ClickableButton
                    className="font-bold text-blueBottom"
                    disabled={loading}
                    onClick={() => loginLens(profile)}
                >
                    {loading ? <LoadingIcon className="animate-spin" width={24} height={24} /> : <Trans>Switch</Trans>}
                </ClickableButton>
            ) : null}
        </div>
    ));
}
