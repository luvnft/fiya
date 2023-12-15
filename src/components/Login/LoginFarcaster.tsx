'use client';

import { t, Trans } from '@lingui/macro';
import { useCallback, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { useAsyncFn, useEffectOnce, useUnmount } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { classNames } from '@/helpers/classNames.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { LoginModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { WarpcastSession } from '@/providers/warpcast/Session.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';

export function LoginFarcaster() {
    const [url, setUrl] = useState('');
    const controllerRef = useRef<AbortController>();
    const enqueueSnackbar = useCustomSnackbar();
    const updateProfiles = useFarcasterStateStore.use.updateProfiles();
    const updateCurrentProfile = useFarcasterStateStore.use.updateCurrentProfile();

    const login = useCallback(
        async (createSession: () => Promise<WarpcastSession>) => {
            try {
                const session = await createSession();
                const profile = await FireflySocialMediaProvider.getProfileById(session.profileId);

                updateProfiles([profile]);
                updateCurrentProfile(profile, session);

                enqueueSnackbar(t`Your Farcaster account is now connected`, {
                    variant: 'success',
                });
                LoginModalRef.close();
            } catch (error) {
                if (error instanceof Error && error.message === 'Aborted') return;

                enqueueSnackbar(error instanceof Error ? error.message : t`Failed to login`, {
                    variant: 'error',
                });
                LoginModalRef.close();
            }
        },
        [updateProfiles, updateCurrentProfile, enqueueSnackbar],
    );

    const [{ loading: loadingGrantPermission, error: errorGrantPermission }, onLoginWithGrantPermission] =
        useAsyncFn(async () => {
            controllerRef.current?.abort();
            controllerRef.current = new AbortController();
            await login(() =>
                WarpcastSocialMediaProvider.createSessionByGrantPermission(setUrl, controllerRef.current?.signal),
            );
        }, [login, setUrl]);

    const [{ loading: loadingCustodyWallet }, onLoginWithCustodyWallet] = useAsyncFn(async () => {
        if (controllerRef.current) controllerRef.current.abort();
        await login(() => WarpcastSocialMediaProvider.createSessionByCustodyWallet());
    }, [login]);

    useEffectOnce(() => {
        onLoginWithGrantPermission();
    });

    useUnmount(() => {
        controllerRef.current?.abort();
    });

    return (
        <div
            className="flex w-[600px] flex-col rounded-[12px]"
            style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
        >
            <div className="flex min-h-[475px] w-full flex-col items-center gap-[16px] p-[16px] ">
                {url ? (
                    <>
                        <div className=" text-center text-[12px] leading-[16px] text-lightSecond">
                            <Trans>
                                On your mobile device with Warpcast, open the <span className="font-bold">Camera</span>{' '}
                                app and scan the QR code
                            </Trans>
                        </div>
                        <div
                            className=" relative flex cursor-pointer items-center justify-center"
                            onClick={onLoginWithGrantPermission}
                        >
                            <QRCode
                                className={classNames({
                                    'blur-md': !!errorGrantPermission,
                                })}
                                value={url}
                                size={360}
                            />
                            {errorGrantPermission ? (
                                <button className=" absolute text-sm font-semibold text-main">
                                    <Trans>Click to refresh QRCode</Trans>
                                </button>
                            ) : null}
                        </div>
                        <button
                            className="text-sm font-semibold text-lightSecond"
                            disabled={loadingCustodyWallet}
                            onClick={onLoginWithCustodyWallet}
                        >
                            {loadingCustodyWallet ? (
                                <Trans>Loading...</Trans>
                            ) : (
                                <Trans>Login with custody wallet</Trans>
                            )}
                        </button>
                    </>
                ) : (
                    <div className="flex w-full flex-1 flex-col items-center justify-center">
                        <LoadingIcon className="animate-spin" width={24} height={24} />
                    </div>
                )}
            </div>
        </div>
    );
}