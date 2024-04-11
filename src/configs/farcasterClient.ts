import { t } from '@lingui/macro';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';

/**
 * This client serves as the global client for all requests to Farcaster.
 * When a session recover from the storage, it should be stored in this client.
 * All Farcaster providers should read sessions from this client.
 */
class FarcasterClient {
    private farcasterSession: FarcasterSession | null = null;

    get session() {
        return this.farcasterSession;
    }

    get sessionRequired() {
        if (!this.farcasterSession) throw new Error(t`No session found.`);
        return this.farcasterSession;
    }

    resumeSession(session: FarcasterSession) {
        if (session.expiresAt > Date.now()) {
            this.farcasterSession = session;
        }
    }

    withSession<T extends (session: FarcasterSession | null) => unknown>(callback: T, required = false) {
        return callback(required ? this.sessionRequired : this.session) as ReturnType<T>;
    }

    fetch<T>(url: string, options?: RequestInit, required = false) {
        return this.farcasterSession || required
            ? fetchJSON<T>(url, {
                  ...options,
                  headers: { ...options?.headers, Authorization: `Bearer ${this.sessionRequired.token}` },
              })
            : fetchJSON<T>(url, options);
    }
}

export const farcasterClient = new FarcasterClient();
