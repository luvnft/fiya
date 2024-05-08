'use client';
import { safeUnreachable } from '@masknet/kit';

import GithubDarkIcon from '@/assets/github-dark.svg';
import GithubLightIcon from '@/assets/github-light.svg';
import KeyBaseIcon from '@/assets/keybase.svg';
import RedditIcon from '@/assets/reddit.svg';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import { RelationPlatform } from '@/providers/types/Firefly.js';

interface RelationPlatformIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    source: RelationPlatform;
}

export function RelationPlatformIcon({ size, source, ...props }: RelationPlatformIconProps) {
    const isDarkMode = useDarkMode();
    const style = {
        width: size,
        height: size,
        ...props.style,
    };

    switch (source) {
        case RelationPlatform.github:
            return isDarkMode ? (
                <GithubDarkIcon {...props} style={style} width={size} height={size} />
            ) : (
                <GithubLightIcon {...props} style={style} width={size} height={size} />
            );
        case RelationPlatform.reddit:
            return <RedditIcon {...props} style={style} width={size} height={size} />;
        case RelationPlatform.keybase:
            return <KeyBaseIcon {...props} style={style} width={size} height={size} />;
        default:
            safeUnreachable(source);
            return;
    }
}
