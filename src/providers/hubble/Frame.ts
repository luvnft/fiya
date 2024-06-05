import { Factories, MessageType } from '@farcaster/core';
import { toBytes } from 'viem';

import { encodeMessageData } from '@/helpers/encodeMessageData.js';
import type { Provider } from '@/providers/types/Frame.js';
import type { FrameSignaturePacket } from '@/providers/types/Hubble.js';
import type { Frame, Index } from '@/types/frame.js';

class FrameProvider implements Provider<FrameSignaturePacket> {
    async generateSignaturePacket(
        postId: string,
        frame: Frame,
        index: Index,
        input?: string,
        additional?: {
            // the state is not read from frame, for initial frame it should not provide state
            state?: string;
            transactionId?: string;
        },
    ): Promise<FrameSignaturePacket> {
        const { messageBytes, messageData, messageDataHash } = await encodeMessageData(
            (fid) => ({
                type: MessageType.FRAME_ACTION,
                frameActionBody: {
                    url: toBytes(frame.url),
                    buttonIndex: index,
                    castId: {
                        fid,
                        hash: toBytes(postId),
                    },
                    inputText: input ? toBytes(input) : new Uint8Array([]),
                    state: additional?.state ? toBytes(additional?.state) : new Uint8Array([]),
                    transactionId: additional?.transactionId ? toBytes(additional.transactionId) : new Uint8Array([]),
                    address: new Uint8Array([]),
                },
            }),
            async (messageData, signer) => {
                return Factories.FrameActionMessage.create(
                    {
                        data: messageData,
                    },
                    {
                        transient: { signer },
                    },
                );
            },
        );

        const packet = {
            untrustedData: {
                fid: messageData.fid,
                url: frame.url,
                messageHash: messageDataHash,
                timestamp: messageData.timestamp,
                network: messageData.network,
                buttonIndex: index,
                inputText: input,
                state: additional?.state,
                transactionId: additional?.transactionId,
                castId: {
                    fid: messageData.fid,
                    hash: postId,
                },
            },
            trustedData: {
                // no 0x prefix
                messageBytes: Buffer.from(messageBytes).toString('hex'),
            },
        };

        if (typeof packet.untrustedData.state === 'undefined') delete packet.untrustedData.state;

        return packet;
    }
}

export const HubbleFrameProvider = new FrameProvider();
