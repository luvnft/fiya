import { env } from '@/constants/env.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';

class FarcasterSessionHolder extends SessionHolder<FarcasterSession> {
    override resumeSession(session: FarcasterSession) {
        this.internalSession = session;
    }

    override fetch<T>(url: string, options?: RequestInit, required = false) {
        if (required && !this.internalSession?.token) throw new Error('Farcaster session is required');

        return this.internalSession?.token
            ? fetchJSON<T>(url, {
                  ...options,
                  headers: { ...options?.headers, Authorization: `Bearer ${this.sessionRequired.token}` },
              })
            : fetchJSON<T>(url, options);
    }

    fetchHubble<T>(url: string, options?: RequestInit) {
        const headers = {
            'Content-Type': 'application/octet-stream',
            ...options?.headers,
            api_key: 'TO_BE_REPLACED_LATER',
        };

        if (env.internal.HUBBLE_TOKEN) {
            headers.api_key = env.internal.HUBBLE_TOKEN;
        } else if (env.external.NEXT_PUBLIC_HUBBLE_TOKEN) {
            headers.api_key = env.external.NEXT_PUBLIC_HUBBLE_TOKEN;
        } else {
            throw new Error('token not found.');
        }

        return fetchJSON<T>(url, {
            ...options,
            headers,
        });
    }
}

export const farcasterSessionHolder = new FarcasterSessionHolder();
