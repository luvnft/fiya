import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';

import { RestrictionType } from '@/types/compose.js';

interface ReplyRestrictionTextProps {
    type: RestrictionType;
}

export function ReplyRestrictionText({ type }: ReplyRestrictionTextProps) {
    switch (type) {
        case RestrictionType.Everyone:
            return <Trans>Everyone</Trans>;
        case RestrictionType.OnlyPeopleYouFollow:
            return <Trans>Only people you follow</Trans>;
        default:
            safeUnreachable(type);
            return null;
    }
}
