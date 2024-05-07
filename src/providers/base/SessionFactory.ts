import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { parseJSON } from '@masknet/web3-providers/helpers';
import z from 'zod';

import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import { LensSession } from '@/providers/lens/Session.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export class SessionFactory {
    /**
     * Creates a session instance based on the serialized session in string.
     *
     * @param serializedSession - The serialized session session in string.
     * @returns An instance of a session.
     */
    static createSession<T extends Session>(serializedSession: string): T {
        const fragments = serializedSession.split(':');
        const type = fragments[0] as SessionType;
        const json = atob(fragments[1]) as string;
        // for lens session, the second token is the refresh token
        // for farcaster session, the second token is the signer request token
        const secondToken = fragments[2] ?? '';
        // for farcaster session, the third token is the channel token
        const thirdToken = fragments[3] ?? '';

        const session = parseJSON<{
            type: SessionType;
            profileId: string;
            token: string;
            createdAt: number;
            expiresAt: number;
        }>(json);
        if (!session) throw new Error(t`Failed to parse session.`);

        const schema = z.object({
            profileId: z.string(),
            token: z.string(),
            createdAt: z.number().nonnegative(),
            expiresAt: z.number().nonnegative(),
        });

        const output = schema.safeParse(session);
        if (!output.success) {
            console.error([`[session factory] zod validation failure: ${output.error}`]);
            throw new Error(t`Malformed session.`);
        }

        const createSessionFor = (type: SessionType): Session => {
            switch (type) {
                case SessionType.Lens:
                    return new LensSession(
                        session.profileId,
                        session.token,
                        session.createdAt,
                        session.expiresAt,
                        secondToken,
                    );
                case SessionType.Farcaster:
                    return new FarcasterSession(
                        session.profileId,
                        session.token,
                        session.createdAt,
                        session.expiresAt,
                        secondToken,
                        thirdToken,
                    );
                case SessionType.Twitter:
                    return new TwitterSession(session.profileId, session.token, session.createdAt, session.expiresAt);
                case SessionType.Firefly:
                    return new FireflySession(session.profileId, session.token);
                default:
                    safeUnreachable(type);
                    throw new Error(t`Unknown session type.`);
            }
        };

        return createSessionFor(type) as T;
    }
}
