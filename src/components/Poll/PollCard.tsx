import { Plural, plural, t } from '@lingui/macro';
import dayjs from 'dayjs';
import { sumBy } from 'lodash-es';
import { Fragment, useCallback, useState } from 'react';

import RightAnswerIcon from '@/assets/right-answer.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { POLL_ACTION_ENABLED } from '@/constants/poll.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import type { PollOption } from '@/providers/types/Poll.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PollCardProps {
    post: Post;
}
interface VoteButtonProps {
    option: PollOption;
    post: Post;
}
interface VoteResultProps {
    option: PollOption;
    totalVotes: number;
    isUserVoted: boolean;
}

function VoteButton({ option, post }: VoteButtonProps) {
    const isLogin = useIsLogin(post.source);

    const handleVote = () => {
        enqueueErrorMessage('Not implemented yet');
    };

    return (
        <div className="mt-3">
            <ClickableButton
                disabled={!isLogin}
                className="h-10 w-full rounded-[5px] border border-lightMain text-center text-base font-bold leading-10 text-lightMain hover:border-link hover:text-link disabled:!cursor-default disabled:!opacity-100"
                onClick={handleVote}
            >
                {option.label}
            </ClickableButton>
        </div>
    );
}

function VoteResult({ option, totalVotes, isUserVoted }: VoteResultProps) {
    const { label, votes = 0 } = option;
    const currentRate = totalVotes ? parseFloat(((votes / totalVotes) * 100).toFixed(2)) : 0;

    return (
        <div className="relative mt-3 h-10">
            <div
                className={classNames('absolute h-full rounded-[5px]', isUserVoted ? 'bg-link' : 'bg-secondaryMain')}
                style={{ width: currentRate ? `${currentRate}%` : '10px' }}
            />
            <div className="absolute z-10 flex h-full w-full items-center justify-between pl-5 text-base font-bold text-lightMain">
                <span className="flex items-center gap-2">
                    <span>{label}</span>
                    {isUserVoted ? <RightAnswerIcon className="mr-2" width={20} height={20} /> : null}
                </span>
                <span>{currentRate}%</span>
            </div>
        </div>
    );
}

export function PollCard({ post }: PollCardProps) {
    const [userVote] = useState<string>();
    const profile = useCurrentProfile(post.source);

    const getPollTimeLeft = useCallback((endDatetime: string) => {
        const now = new Date().getTime();
        const timeLeft = new Date(endDatetime).getTime() - now;

        if (timeLeft <= 0) {
            return t`Final results`;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        if (days >= 1) {
            return plural(days, { one: '1 day', other: `${days} days` });
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        if (hours >= 1) {
            return plural(hours, { one: '1 hour', other: `${hours} hours` });
        }

        const minutes = Math.floor(timeLeft / (1000 * 60));
        if (minutes >= 1) {
            return plural(minutes, { one: '1 minute', other: `${minutes} minutes` });
        }

        return t`Less than a minute left`;
    }, []);

    const { poll } = post;
    if (!poll) return null;

    const totalVotes = sumBy(poll.options, (option) => option.votes ?? 0);

    const showResultsOnly =
        !POLL_ACTION_ENABLED[post.source] ||
        poll.votingStatus === 'closed' ||
        isSameProfile(profile, post.author) ||
        !!userVote;

    const timeLeft =
        poll.votingStatus === 'closed' || (poll.endDatetime && dayjs(poll.endDatetime).isBefore(new Date()))
            ? t`Final results`
            : poll.endDatetime
              ? t`${getPollTimeLeft(poll.endDatetime)} left`
              : '';

    return (
        <div>
            {poll.options.map((option, index) => (
                <Fragment key={index}>
                    {showResultsOnly ? (
                        <VoteResult option={option} totalVotes={totalVotes} isUserVoted={userVote === option.label} />
                    ) : (
                        <VoteButton option={option} post={post} />
                    )}
                </Fragment>
            ))}
            <div className="mt-3 text-xs leading-6 text-lightSecond">
                <Plural value={totalVotes} one={`${totalVotes} Vote`} other={`${totalVotes} Votes`} />
                {timeLeft ? ` · ${timeLeft}` : ''}
            </div>
        </div>
    );
}
