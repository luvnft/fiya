import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import type { Metrics } from '@/app/api/firefly/decrypt-metrics/route.js';
import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { FAKE_SIGNER_REQUEST_TOKEN, FarcasterSession } from '@/providers/farcaster/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { LensSession } from '@/providers/lens/Session.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import type { MetricsDownloadResponse } from '@/providers/types/Firefly.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import type { ResponseJSON } from '@/types/index.js';

/**
 * Download encrypted metrics from Firefly.
 * @param session
 * @returns
 */
async function downloadMetricsFromFirefly(signal?: AbortSignal) {
    const response = await fireflySessionHolder.fetch<MetricsDownloadResponse>(
        urlcat(FIREFLY_ROOT_URL, '/v1/metrics/download'),
        {
            signal,
        },
        true,
    );
    const data = resolveFireflyResponseData(response);
    return data?.ciphertext;
}

/**
 * Decrypt the metrics from Firefly.
 * @param cipher
 * @param signal
 * @returns
 */
async function decryptMetricsFromFirefly(cipher: string, signal?: AbortSignal) {
    const response = await fetchJSON<ResponseJSON<Metrics>>('/api/firefly/decrypt-metrics', {
        method: 'POST',
        body: JSON.stringify({ text: cipher }),
        signal,
    });
    if (!response.success) throw new Error(response.error.message);
    return response.data;
}

function convertMetricToSession(metric: Metrics[0]) {
    const platform = metric.platform;
    switch (platform) {
        case 'farcaster':
            return metric.login_metadata.map(
                (x) =>
                    new FarcasterSession(
                        `${x.fid}`,
                        x.signer_private_key.startsWith('0x') ? x.signer_private_key : `0x${x.signer_private_key}`,
                        x.login_time,
                        x.login_time,
                        // the signerRequestToken cannot recover from the metric
                        // but it is necessary for distinguish grant by permission session
                        // so we use a fake token here
                        FAKE_SIGNER_REQUEST_TOKEN,
                    ),
            );
        case 'lens':
            return metric.login_metadata.map(
                (x) => new LensSession(x.profile_id, x.token, x.login_time, x.login_time, x.refresh_token),
            );
        case 'twitter':
            return metric.login_metadata.map(
                (x) =>
                    new TwitterSession(x.client_id, '', x.login_time, x.login_time, {
                        clientId: x.client_id,
                        consumerKey: x.consumer_key,
                        consumerSecret: x.consumer_secret,
                        accessToken: x.access_token,
                        accessTokenSecret: x.access_token_secret,
                    }),
            );
        default:
            safeUnreachable(platform);
            return [];
    }
}

/**
 * Download and decrypt metrics from Firefly, then convert them to sessions.
 * @returns
 */
export async function syncSessionFromFirefly(signal?: AbortSignal) {
    // Ensure that the Firefly session is resumed before calling this function.
    fireflySessionHolder.assertSession();

    const cipher = await downloadMetricsFromFirefly(signal);
    if (!cipher) return [];

    const metrics = await decryptMetricsFromFirefly(cipher, signal);
    const sessions = metrics.flatMap<FarcasterSession | LensSession | TwitterSession>(convertMetricToSession);

    // save consumer secret to KV
    await Promise.all(
        sessions.map(async (session) => {
            if (session.type !== SessionType.Twitter) return session;
            return TwitterSession.recordPayload((session as TwitterSession).payload);
        }),
    );

    return sessions;
}
