import DisableNoIcon from '@/assets/disable-no.svg';
import YesIcon from '@/assets/yes.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar, type ProfileAvatarProps } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileInListProps {
    profile: Profile;
    isSelected: boolean;
    onSelect: (profile: Profile) => void;
    ProfileAvatarProps?: Partial<ProfileAvatarProps>;
}

export function ProfileInList({ isSelected, onSelect, profile, ProfileAvatarProps }: ProfileInListProps) {
    return (
        <ClickableButton
            className="inline-flex h-[48px] w-full items-center justify-start gap-4 outline-none"
            onClick={() => {
                onSelect(profile);
            }}
        >
            <div
                className="flex h-[48px] w-[48px] items-center justify-center rounded-full"
                style={{
                    background:
                        'radial-gradient(circle at center, rgba(255, 184, 224, 1), rgba(190, 158, 255, 1), rgba(136, 192, 252, 1), rgba(134, 255, 153, 1))',
                }}
            >
                <ProfileAvatar profile={profile} size={48} {...ProfileAvatarProps} />
            </div>
            <ProfileName profile={profile} />
            {isSelected ? (
                <YesIcon width={40} height={40} />
            ) : (
                <div className="flex h-10 w-10 items-center justify-center">
                    <DisableNoIcon width={20} height={20} />
                </div>
            )}
        </ClickableButton>
    );
}
