import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/configs/queryClient.js';
import { Source } from '@/constants/enum.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function useIsMuted(profile: Profile | undefined) {
    const isFarcaster = profile?.source === Source.Farcaster;
    const profileId = profile?.profileId;
    const { data } = useQuery({
        enabled: isFarcaster,
        queryKey: ['profile-is-muted', profile?.source, profileId],
        queryFn: () => {
            if (!profileId) return false;
            return FireflySocialMediaProvider.getIsMuted(profileId);
        },
    });
    return isFarcaster ? data : !!profile?.viewerContext?.blocking;
}

export function getIsMuted(profile: Profile) {
    const blocked = queryClient.getQueryData<boolean>(['profile-is-muted', profile.source, profile.profileId]);
    return blocked || profile.viewerContext?.blocking;
}