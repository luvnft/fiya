import { RedPacketMetaKey } from '@masknet/plugin-redpacket';
import type { TypedMessage } from '@masknet/typed-message';

const RP_ENCRYPTED_KEY = `${RedPacketMetaKey}:encrypted`;

export function hasRpPayload(message: TypedMessage | null) {
    return message?.meta?.has(RedPacketMetaKey);
}

export function isRpEncrypted(message: TypedMessage | null) {
    if (hasRpPayload(message)) return message?.meta?.get(RP_ENCRYPTED_KEY) === true;
    return false;
}

export function updateRpEncrypted<T extends TypedMessage>(message: T | null, encrypted = true): T | null {
    if (hasRpPayload(message) && message?.meta) {
        return {
            ...message,
            meta: new Map([[RP_ENCRYPTED_KEY, encrypted], ...(message?.meta?.entries() ?? [])]),
        };
    }
    return message;
}
