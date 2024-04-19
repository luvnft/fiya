import { Trans } from '@lingui/macro';
import type { HTMLProps, ReactNode } from 'react';

import BlackHoleIcon from '@/assets/black-hole.svg';
import { classNames } from '@/helpers/classNames.js';

interface Props extends HTMLProps<HTMLDivElement> {
    message?: string | ReactNode;
    icon?: ReactNode;
}

export function NoResultsFallback({ icon, message, className, ...rest }: Props) {
    return (
        <div className={classNames('flex flex-col items-center py-12 text-secondary', className)} {...rest}>
            {icon ?? <BlackHoleIcon width={200} height="auto" className="text-secondaryMain" />}
            <div className="mt-3 break-words break-all text-center text-[15px] font-bold">
                {message ?? (
                    <div className="mt-10">
                        <Trans>There is no data available for display.</Trans>
                    </div>
                )}
            </div>
        </div>
    );
}
