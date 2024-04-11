import { type IStorageProvider, LensClient as LensClientSDK, production } from '@lens-protocol/client';

import type { LensSession } from '@/providers/lens/Session.js';

const ls = typeof window === 'undefined' ? undefined : window.localStorage;

class LocalStorageProvider implements IStorageProvider {
    getItem(key: string) {
        return ls?.getItem(key) ?? null;
    }

    setItem(key: string, value: string) {
        ls?.setItem(key, value);
    }

    removeItem(key: string) {
        ls?.removeItem(key);
    }
}

class LensClient {
    private lensClientSDK: LensClientSDK | null = null;

    get sdk() {
        if (!this.lensClientSDK) {
            this.lensClientSDK = new LensClientSDK({
                environment: production,
                storage: new LocalStorageProvider(),
            });
        }
        return this.lensClientSDK;
    }

    async resumeSession(session: LensSession, refreshToken: string) {
        const verified = await this.sdk.authentication.verify(session.token);
        if (!verified) throw new Error('Invalid session');

        const now = Date.now();
        localStorage.setItem(
            'lens.production.credentials',
            JSON.stringify({
                data: {
                    refreshToken,
                },
                metadata: {
                    createdAt: now,
                    updatedAt: now,
                    version: 2,
                },
            }),
        );
    }
}

export const lensClient = new LensClient();
