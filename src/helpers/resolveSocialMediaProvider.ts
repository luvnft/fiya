import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';

export function resolveSocialMediaProvider(source: SocialPlatform) {
    switch (source) {
        case SocialPlatform.Lens:
            return LensSocialMediaProvider;
        case SocialPlatform.Farcaster:
            return FarcasterSocialMediaProvider;
        case SocialPlatform.Twitter:
            return TwitterSocialMediaProvider;
        default:
            safeUnreachable(source);
            return;
    }
}