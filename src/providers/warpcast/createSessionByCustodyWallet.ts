import urlcat from 'urlcat';
import type { WalletClient } from 'wagmi';

import { WARPCAST_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer.js';
import type { UserResponse } from '@/providers/types/Warpcast.js';
import { WarpcastSession } from '@/providers/warpcast/Session.js';

/**
 * Create a session by signing the challenge with the custody wallet
 * @param signal
 * @returns
 */
export async function createSessionByCustodyWallet(client: WalletClient, signal?: AbortSignal) {
    const { payload, token } = await generateCustodyBearer(client);
    const response = await fetchJSON<{
        result: {
            token: {
                secret: string;
            };
        };
        errors?: Array<{ message: string; reason: string }>;
    }>(urlcat(WARPCAST_ROOT_URL, '/auth'), {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (response.errors?.length) throw new Error(response.errors[0].message);

    const { result: user } = await fetchJSON<UserResponse>(
        urlcat(WARPCAST_ROOT_URL, '/me', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${response.result.token.secret}`,
            },
        }),
    );

    return new WarpcastSession(
        user.fid.toString(),
        response.result.token.secret,
        payload.params.timestamp,
        payload.params.expiresAt,
        response.result.token.secret,
    );
}