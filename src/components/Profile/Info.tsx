import { Trans } from '@lingui/macro';

import { Avatar } from '@/components/Avatar.js';
import { BioMarkup } from '@/components/Markup/index.js';
import { FollowButton } from '@/components/Profile/FollowButton.js';
import { ProfileMoreAction } from '@/components/Profile/ProfileMoreAction.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import type { SocialPlatform } from '@/constants/enum.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface InfoProps {
    isMyProfile: boolean;
    profile?: Profile;
    source: SocialPlatform;
}

export function Info({ isMyProfile, profile, source }: InfoProps) {
    const followingCount = profile?.followingCount ?? 0;
    const followerCount = profile?.followerCount ?? 0;

    const isMedium = useIsMedium();

    return (
        <div className=" flex gap-3 p-3">
            {profile?.pfp ? (
                <Avatar src={profile.pfp} alt="avatar" size={80} className=" h-20 w-20 rounded-full" />
            ) : (
                <SourceIcon className="rounded-full" source={source} size={80} />
            )}

            <div className=" relative flex flex-1 flex-col gap-[6px] pt-4">
                <div className=" flex flex-col">
                    <div className=" flex items-center gap-2">
                        <span className=" text-xl font-black text-lightMain">{profile?.displayName}</span>
                        <SourceIcon source={source} size={20} />
                        {!isMyProfile && profile && isMedium ? (
                            <>
                                <div className="ml-auto ">
                                    <FollowButton profile={profile} />
                                </div>
                                <ProfileMoreAction profile={profile} />
                            </>
                        ) : null}
                    </div>
                    <span className="text-[15px] text-secondary">@{profile?.handle}</span>
                </div>

                <BioMarkup className="text-[15px]" source={profile?.source}>
                    {profile?.bio ?? '-'}
                </BioMarkup>

                <div className=" flex gap-3 text-[15px]">
                    <div className=" flex gap-1">
                        <span className=" font-bold text-lightMain">{followingCount}</span>
                        <span className=" text-secondary">
                            {profile?.viewerContext?.following ? <Trans>Following</Trans> : <Trans>Followings</Trans>}
                        </span>
                    </div>

                    <div className=" flex gap-1">
                        <span className=" font-bold text-lightMain">{followerCount}</span>
                        <span className=" text-secondary">
                            {followerCount === 1 ? <Trans>Follower</Trans> : <Trans>Followers</Trans>}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
