import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { useMemo } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import SendIcon from '@/assets/send.svg';
import Send2Icon from '@/assets/send2.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CountdownCircle } from '@/components/Compose/CountdownCircle.js';
import { Tooltip } from '@/components/Tooltip.js';
import { MAX_CHAR_SIZE_PER_POST, MAX_POST_SIZE_PER_THREAD } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { isValidPost } from '@/helpers/isValidPost.js';
import { measureChars } from '@/helpers/readChars.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useSetEditorContent } from '@/hooks/useSetEditorContent.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { crossPost } from '@/services/crossPost.js';
import { crossPostThread } from '@/services/crossPostThread.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';

interface ComposeSendProps extends React.HTMLAttributes<HTMLDivElement> {
    post: CompositePost;
}

export function ComposeSend(props: ComposeSendProps) {
    const { type, posts, addPostInThread } = useComposeStateStore();

    const { visibleLength, invisibleLength } = measureChars(props.post.chars);

    const isMedium = useIsMedium();
    const setEditorContent = useSetEditorContent();

    const [{ loading: loadingCrossPost }, handleCrossPost] = useAsyncFn(async () => {
        try {
            await crossPost(type, props.post);
        } finally {
            ComposeModalRef.close();
        }
    }, [type, props.post]);

    const [{ loading: loadingCrossPostThread }, handleCrossPostThread] = useAsyncFn(async () => {
        try {
            await crossPostThread();
        } finally {
            ComposeModalRef.close();
        }
    }, []);

    const disabledCrossPost = useMemo(() => {
        if (loadingCrossPost) return true;
        return isValidPost(props.post);
    }, [props.post, loadingCrossPost]);

    const disabledCrossPostThread = useMemo(() => {
        if (loadingCrossPostThread) return true;
        return posts.some((x) => !isValidPost(x));
    }, [loadingCrossPostThread, posts]);

    const loading = posts.length > 1 ? loadingCrossPostThread : loadingCrossPost;
    const disabled = posts.length > 1 ? disabledCrossPostThread : disabledCrossPost;
    const handlePost = posts.length > 1 ? handleCrossPostThread : handleCrossPost;

    if (!isMedium) {
        return (
            <ClickableButton
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer disabled:opacity-50"
                disabled={disabled}
                onClick={handlePost}
            >
                {loading ? (
                    <LoadingIcon width={24} height={24} className="animate-spin text-main" />
                ) : (
                    <Send2Icon width={24} height={24} />
                )}
            </ClickableButton>
        );
    }

    return (
        <div className=" flex h-[68px] items-center justify-end gap-4 px-4 shadow-send">
            {visibleLength ? (
                <div className=" flex items-center gap-[10px] whitespace-nowrap text-[15px] text-main">
                    <CountdownCircle count={visibleLength} width={24} height={24} className="flex-shrink-0" />
                    <span className={classNames(disabled ? ' text-danger' : '')}>
                        {visibleLength} / {MAX_CHAR_SIZE_PER_POST - invisibleLength}
                    </span>
                </div>
            ) : null}

            {visibleLength && type === 'compose' ? (
                <ClickableButton
                    className=" text-main disabled:opacity-50"
                    disabled={posts.length >= MAX_POST_SIZE_PER_THREAD}
                    onClick={() => {
                        addPostInThread();
                        setEditorContent('');
                    }}
                >
                    {posts.length >= MAX_POST_SIZE_PER_THREAD ? (
                        <PlusCircleIcon width={28} height={28} />
                    ) : (
                        <Tooltip content={t`Add`} placement="top">
                            <PlusCircleIcon width={28} height={28} />
                        </Tooltip>
                    )}
                </ClickableButton>
            ) : null}

            <ClickableButton
                disabled={disabled}
                className={classNames(
                    ' flex h-10 w-[120px] items-center justify-center gap-1 rounded-full bg-black text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black',
                )}
                onClick={handlePost}
            >
                {loading ? (
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                ) : (
                    <>
                        <SendIcon width={18} height={18} className="mr-1 text-primaryBottom" />
                        <span>{posts.length > 1 ? <Trans>Post All</Trans> : <Trans>Post</Trans>}</span>
                    </>
                )}
            </ClickableButton>
        </div>
    );
}