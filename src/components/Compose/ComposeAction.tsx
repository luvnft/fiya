import { Popover } from '@headlessui/react';
import { BugAntIcon, ChevronRightIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { CrossIsolationMessages } from '@masknet/shared-base';
import { $getSelection } from 'lexical';
import { useCallback, useMemo } from 'react';
import { useAsyncFn } from 'react-use';

import AtIcon from '@/assets/at.svg';
import GalleryIcon from '@/assets/gallery.svg';
import NumberSignIcon from '@/assets/number-sign.svg';
import RedPacketIcon from '@/assets/red-packet.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Media } from '@/components/Compose/Media.js';
import { PostBy } from '@/components/Compose/PostBy.js';
import { ReplyRestriction } from '@/components/Compose/ReplyRestriction.js';
import { ReplyRestrictionText } from '@/components/Compose/ReplyRestrictionText.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { Tooltip } from '@/components/Tooltip.js';
import { MAX_POST_SIZE_PER_THREAD, SORTED_SOURCES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { connectMaskWithWagmi } from '@/helpers/connectWagmiWithMask.js';
import { getCurrentPostLimits } from '@/helpers/getCurrentPostLimits.js';
import { measureChars } from '@/helpers/readChars.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useProfilesAll } from '@/hooks/useProfilesAll.js';
import { useSetEditorContent } from '@/hooks/useSetEditorContent.js';
import { PluginDebuggerMessages } from '@/mask/message-host/index.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { type CompositePost, useComposeStateStore, useCompositePost } from '@/store/useComposeStore.js';

interface ComposeActionProps {
    post: CompositePost;
}

export function ComposeAction(props: ComposeActionProps) {
    const { chars, images, video } = props.post;

    const isMedium = useIsMedium();

    const currentProfileAll = useCurrentProfileAll();
    const profilesAll = useProfilesAll();

    const { type, posts, addPostInThread, updateRestriction } = useComposeStateStore();
    const { rootPost, isRootPost } = useCompositePost();

    const { length, visibleLength, invisibleLength } = useMemo(() => measureChars(chars), [chars]);

    const [editor] = useLexicalComposerContext();
    const setEditorContent = useSetEditorContent();

    const insertText = useCallback(
        (text: string) => {
            editor.update(() => {
                $getSelection()?.insertText(text);
            });
        },
        [editor],
    );

    const [{ loading }, openRedPacketComposeDialog] = useAsyncFn(async () => {
        await connectMaskWithWagmi();
        // import dynamically to avoid the start up dependency issue of mask packages
        await import('@/helpers/setupCurrentVisitingProfile.js').then((module) =>
            module.setupCurrentVisitingProfileAsFireflyApp(),
        );
        await delay(300);
        CrossIsolationMessages.events.redpacketDialogEvent.sendToLocal({
            open: true,
            fireflyContext: Object.fromEntries(
                SORTED_SOURCES.map((x) => {
                    const currentProfile = currentProfileAll[x];
                    return [
                        `current${x}Profile`,
                        currentProfile
                            ? {
                                  ...currentProfile,
                                  ownedBy: currentProfile.ownedBy?.address,
                              }
                            : undefined,
                    ];
                }),
            ),
        });
    }, [currentProfileAll, profilesAll]);

    const { MAX_CHAR_SIZE_PER_POST } = getCurrentPostLimits(rootPost.availableSources);
    const maxImageCount = currentProfileAll.Farcaster ? 2 : 4;
    const mediaDisabled = !!video || images.length >= maxImageCount;

    return (
        <div className=" px-4 pb-4">
            <div className=" relative flex h-9 items-center gap-3">
                <Popover as="div" className="relative">
                    {({ close }) => (
                        <>
                            <Popover.Button className=" flex cursor-pointer gap-1 text-main focus:outline-none">
                                <Tooltip content={t`Media`} placement="top">
                                    <GalleryIcon
                                        className={classNames(
                                            ' text-main',
                                            mediaDisabled ? ' cursor-no-drop opacity-50' : ' cursor-pointer',
                                        )}
                                        width={24}
                                        height={24}
                                    />
                                </Tooltip>
                            </Popover.Button>

                            {!mediaDisabled ? <Media close={close} /> : null}
                        </>
                    )}
                </Popover>

                <Tooltip content={t`Mention`} placement="top">
                    <AtIcon
                        className=" cursor-pointer text-main"
                        width={24}
                        height={24}
                        onClick={() => insertText('@')}
                    />
                </Tooltip>

                <Tooltip content={t`Hashtag`} placement="top">
                    <NumberSignIcon
                        className=" cursor-pointer text-main"
                        width={24}
                        height={24}
                        onClick={() => insertText('#')}
                    />
                </Tooltip>

                {process.env.NODE_ENV === 'development' ? (
                    <>
                        <Tooltip content={t`Debug Connection`} placement="top">
                            <BugAntIcon
                                className="h-6 w-6 cursor-pointer text-main"
                                onClick={async () => {
                                    ComposeModalRef.close();
                                    await delay(300);
                                    PluginDebuggerMessages?.connectionDialogUpdated.sendToLocal({ open: true });
                                }}
                            />
                        </Tooltip>
                        <Tooltip content={t`Debug Console`} placement="top">
                            <BugAntIcon
                                className={`h-6 w-6 cursor-pointer text-main`}
                                onClick={async () => {
                                    ComposeModalRef.close();
                                    await delay(300);
                                    PluginDebuggerMessages?.consoleDialogUpdated.sendToLocal({ open: true });
                                }}
                            />
                        </Tooltip>
                    </>
                ) : null}

                <div
                    className={classNames(
                        'hidden h-6 cursor-pointer items-center gap-x-2 rounded-[32px] border border-foreground px-3 py-1 md:flex md:h-auto',
                        {
                            'opacity-50': loading,
                        },
                    )}
                    onClick={async () => {
                        if (loading) return;
                        openRedPacketComposeDialog();
                    }}
                >
                    <RedPacketIcon width={16} height={16} />
                    <span className="text-[13px] font-medium leading-6 text-lightMain">
                        <Trans>LuckyDrop</Trans>
                    </span>
                </div>

                {visibleLength && !isMedium ? (
                    <div className=" ml-auto flex items-center gap-[10px] whitespace-nowrap text-[15px] text-main">
                        <span className={classNames(length > MAX_CHAR_SIZE_PER_POST ? 'text-danger' : '')}>
                            {visibleLength} / {MAX_CHAR_SIZE_PER_POST - invisibleLength}
                        </span>
                    </div>
                ) : null}

                {visibleLength && type === 'compose' && !isMedium ? (
                    <ClickableButton
                        className=" text-main disabled:opacity-50"
                        disabled={posts.length >= MAX_POST_SIZE_PER_THREAD}
                        onClick={() => {
                            addPostInThread();
                            setEditorContent('');
                        }}
                    >
                        <PlusCircleIcon width={28} height={28} />
                    </ClickableButton>
                ) : null}
            </div>

            <div className=" flex h-9 items-center justify-between">
                <span className=" text-[15px] text-secondary">
                    <Trans>Share to</Trans>
                </span>
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button
                                className=" flex cursor-pointer gap-1 text-main focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={!isRootPost}
                            >
                                <span className="flex items-center gap-x-1 font-bold">
                                    {rootPost.availableSources
                                        .filter((x) => !!currentProfileAll[x])
                                        .map((y) => (
                                            <SourceIcon key={y} source={y} size={20} />
                                        ))}
                                </span>
                                {type === 'compose' ? (
                                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                ) : null}
                            </Popover.Button>
                            <PostBy />
                        </>
                    )}
                </Popover>
            </div>

            <div className=" flex h-9 items-center justify-between">
                <span className=" text-[15px] text-secondary">
                    <Trans>Allow replies from</Trans>
                </span>
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button
                                className=" flex cursor-pointer gap-1 text-main focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={!isRootPost}
                            >
                                <span className=" text-[15px] font-bold">
                                    <ReplyRestrictionText type={rootPost.restriction} />
                                </span>
                                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                            </Popover.Button>
                            <ReplyRestriction
                                post={rootPost}
                                restriction={rootPost.restriction}
                                setRestriction={updateRestriction}
                            />
                        </>
                    )}
                </Popover>
            </div>
        </div>
    );
}
