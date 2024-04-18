import type { SVGAttributes } from 'react';

import { measureChars } from '@/helpers/chars.js';
import { getCurrentPostLimits } from '@/helpers/getCurrentPostLimits.js';
import type { CompositePost } from '@/store/useComposeStore.js';

interface Props extends SVGAttributes<SVGElement> {
    post: CompositePost;
    rootPost: CompositePost;
}

export function CountdownCircle({ post, rootPost, ...rest }: Props) {
    const { visibleLength } = measureChars(post.chars, rootPost.availableSources);
    const { SAFE_CHAR_LIMIT, DANGER_CHAR_LIMIT, MAX_CHAR_SIZE_PER_POST } = getCurrentPostLimits(
        rootPost.availableSources,
    );

    const isGreen = visibleLength < SAFE_CHAR_LIMIT;
    const isWarning = visibleLength > SAFE_CHAR_LIMIT && visibleLength < DANGER_CHAR_LIMIT;
    const color = isGreen ? 'rgba(61, 194, 51, 0.5)' : isWarning ? 'rgba(255, 177, 0, 0.5)' : 'rgba(255, 53, 69, 0.5)';
    const dasharray = Math.PI * 2 * 70;
    const progress = Math.min(1, visibleLength / MAX_CHAR_SIZE_PER_POST);
    const dashoffset = Math.floor(dasharray * (1 - progress));

    return (
        <svg viewBox="0 0 160 160" {...rest}>
            <circle r="70" cx="80" cy="80" fill="transparent" stroke="rgba(61,194,51,0.2)" strokeWidth="15px" />
            <circle
                r="70"
                cx="80"
                cy="80"
                fill="transparent"
                stroke={color}
                strokeLinecap="round"
                strokeWidth="12px"
                strokeDasharray={`${dasharray.toFixed(3)}px`}
                strokeDashoffset={`${dashoffset}px`}
            />
        </svg>
    );
}
