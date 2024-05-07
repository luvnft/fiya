import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useState } from 'react';

import ComeBackIcon from '@/assets/comeback.svg';
import { FollowButton } from '@/components/Profile/FollowButton.js';
import { ProfileMoreAction } from '@/components/Profile/ProfileMoreAction.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface TitleProps {
    profile: Profile;
}

export function Title({ profile }: TitleProps) {
    const [reached, setReached] = useState(false);

    const { scrollY } = useScroll();
    const isMedium = useIsMedium();

    useMotionValueEvent(scrollY, 'change', (value) => {
        setReached(value > 48);
    });

    const comeback = useComeBack();

    return (
        <div className="sticky top-0 z-50 flex h-[60px] items-center bg-primaryBottom px-4">
            <div className="mr-1 flex items-center gap-7 overflow-auto">
                <ComeBackIcon className=" shrink-0 cursor-pointer text-lightMain" onClick={comeback} />
                <span className=" overflow-hidden text-ellipsis whitespace-nowrap text-xl font-black text-lightMain">
                    {profile.displayName || '-'}
                </span>
            </div>

            {(profile && reached) || !isMedium ? (
                <>
                    <FollowButton className="ml-auto" profile={profile} />
                    <ProfileMoreAction className="ml-2 text-main" profile={profile} />
                </>
            ) : null}
        </div>
    );
}
