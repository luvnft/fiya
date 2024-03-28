import urlcat from 'urlcat';

import { MAX_FRAME_SIZE_PER_POST } from '@/constants/index.js';
import { anySignal } from '@/helpers/anySignal.js';
import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import { BaseLoader } from '@/libs/base/Loader.js';
import type { Frame, LinkDigested } from '@/types/frame.js';
import type { ResponseJSON } from '@/types/index.js';

class Loader extends BaseLoader<Frame> {
    protected override fetch(url: string, signal?: AbortSignal) {
        return new Promise<Frame | null>((resolve, reject) => {
            requestIdleCallback(async () => {
                try {
                    const timeout = AbortSignal.timeout(30_000);
                    const response = await fetchCachedJSON<ResponseJSON<LinkDigested>>(
                        urlcat('/api/frame', { link: url }),
                        {
                            signal: signal ? anySignal(timeout, signal) : timeout,
                        },
                        {
                            throwIfNotOK: true,
                        },
                    );
                    if (response.success) resolve(response.data.frame);
                    else resolve(null);
                } catch {
                    reject(new Error('Failed to fetch frame'));
                }
            });
        });
    }

    protected override parse(content: string) {
        return super.parse(content).slice(0, MAX_FRAME_SIZE_PER_POST);
    }
}

export const FrameLoader = new Loader();
