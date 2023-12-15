'use client';

import { Trans } from '@lingui/macro';
import { useDisconnect } from 'wagmi';

import LogOutIcon from '@/assets/logout.svg';
import UserAddIcon from '@/assets/user-add.svg';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { WarpcastSignerRequestIndicator } from '@/components/WarpcastSignerRequestIndicator.js';
import { SocialPlatform } from '@/constants/enum.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useProfiles } from '@/hooks/useProfiles.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';

interface AccountSettingProps {
    source: SocialPlatform;
}

export function AccountSetting({ source }: AccountSettingProps) {
    const { disconnect } = useDisconnect();
    const { currentProfile, currentProfileSession, profiles, clearCurrentProfile } = useProfiles(source);
    return (
        <div className="absolute -top-[200px] hidden rounded-[12px] bg-bgModal group-hover:block">
            <div className="flex w-[260px] flex-col gap-[23px] rounded-[16px] p-[24px]">
                {profiles.map((profile) => (
                    <div key={profile.profileId} className="flex items-center justify-between gap-[8px]">
                        <ProfileAvatar profile={profile} />
                        <ProfileName profile={profile} />
                        <WarpcastSignerRequestIndicator session={currentProfileSession}>
                            {isSameProfile(currentProfile, profile) ? (
                                <div
                                    className="h-[8px] w-[8px] rounded-full bg-success"
                                    style={{ filter: 'drop-shadow(0px 4px 10px var(--color-success))' }}
                                />
                            ) : null}
                        </WarpcastSignerRequestIndicator>
                    </div>
                ))}
                <button
                    className="flex w-full items-center gap-[8px]"
                    onClick={() => {
                        if (source === SocialPlatform.Lens) disconnect();
                        clearCurrentProfile();
                        LoginModalRef.open();
                    }}
                >
                    <UserAddIcon width={24} height={24} />
                    <div className=" text-[17px] font-bold leading-[22px] text-[#101010] dark:text-gray-400">
                        <Trans>Change account</Trans>
                    </div>
                </button>
                <button
                    className="flex items-center gap-[8px]"
                    onClick={() => {
                        LogoutModalRef.open({ source });
                    }}
                >
                    <LogOutIcon width={24} height={24} />
                    <div className=" text-[17px] font-bold leading-[22px] text-[#f00]">
                        <Trans>Log out</Trans>
                    </div>
                </button>
            </div>
        </div>
    );
}
