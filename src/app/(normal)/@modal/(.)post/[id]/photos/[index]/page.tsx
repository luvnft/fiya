'use client';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/keyboard';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { useMemo } from 'react';
import { Keyboard, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { PostActionsWithGrid } from '@/components/Actions/index.js';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Image } from '@/components/Image.js';
import { Modal } from '@/components/Modal.js';
import type { SocialSourceInURL } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

interface Props {
    params: {
        id: string;
        index: string;
    };
    searchParams: { source: SocialSourceInURL };
}

interface CustomArrowProps extends Omit<ClickableButtonProps, 'children'> {
    currentSlide?: number | undefined;
    slideCount?: number | undefined;
}

function CustomLeftArrow(props: CustomArrowProps) {
    return (
        <ClickableButton {...props}>
            <ArrowLeftIcon width={24} height={24} className="rounded-full p-1 text-main hover:bg-bg" />
        </ClickableButton>
    );
}

function CustomRightArrow(props: CustomArrowProps) {
    return (
        <ClickableButton {...props}>
            <ArrowRightIcon width={24} height={24} className="rounded-full p-1 text-main hover:bg-bg" />
        </ClickableButton>
    );
}

export default function PreviewPhotoModal({ params: { id: postId, index }, searchParams: { source } }: Props) {
    const router = useRouter();
    const isMedium = useIsMedium();

    const currentSource = resolveSocialSource(source);

    const { data: post = null } = useSuspenseQuery({
        queryKey: [currentSource, 'post-detail', postId],
        queryFn: async () => {
            if (!postId) return;

            const provider = resolveSocialMediaProvider(currentSource);
            const post = await provider.getPostById(postId);
            if (!post) return;

            return post;
        },
        // The image data of the post will not be changed.
        staleTime: Infinity,
    });

    const images = useMemo(() => {
        if (!post) return EMPTY_LIST;
        const asset = post.metadata.content?.asset;
        const imageAttachments =
            compact(post.metadata.content?.attachments?.filter((x) => x.type === 'Image').map((x) => x.uri)) ??
            EMPTY_LIST;

        if (asset?.type === 'Image' && imageAttachments.length === 1) {
            return [asset.uri];
        }
        return imageAttachments;
    }, [post]);

    return (
        <Modal open backdrop={false} onClose={() => router.back()}>
            <div
                className="preview-actions fixed inset-0 flex transform-none flex-col items-center justify-center bg-black/90 bg-opacity-90 outline-none transition-all"
                onClick={isMedium ? () => router.back() : undefined}
            >
                <div className="absolute left-4 top-4 cursor-pointer text-main">
                    <CloseButton onClick={() => router.back()} />
                </div>
                <div className="flex w-full text-main">
                    <Swiper
                        modules={[Navigation, Keyboard]}
                        navigation={{
                            prevEl: '.prev-button',
                            nextEl: '.next-button',
                        }}
                        keyboard
                        initialSlide={Number(index) - 1}
                    >
                        {images.map((x, key) => {
                            return (
                                <SwiperSlide key={key} className="flex">
                                    <div>
                                        <Image
                                            key={index}
                                            src={x}
                                            alt={x}
                                            width={1000}
                                            height={1000}
                                            className="max-h-[calc(100vh-110px)] w-full object-contain max-md:h-[calc(calc(100vh-env(safe-area-inset-bottom)-env(safe-are-inset-top)-90px))] max-md:max-w-[calc(100%-30px)]"
                                        />
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                        <CustomLeftArrow className="prev-button absolute left-[50px] top-[50%] z-[9999] max-md:hidden" />
                        <CustomRightArrow className="next-button absolute right-[50px] top-[50%] z-[9999] max-md:hidden" />
                    </Swiper>
                </div>
                <div className="absolute my-1 flex items-center justify-between bottom-safe">
                    {post ? <PostActionsWithGrid className="gap-8" post={post} disablePadding /> : null}
                </div>
            </div>
        </Modal>
    );
}
