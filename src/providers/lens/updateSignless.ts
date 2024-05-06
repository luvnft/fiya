import type { TypedDataDomain } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';

export async function updateSignless(enable: boolean): Promise<void> {
    const typedDataResult = await lensSessionHolder.sdk.profile.createChangeProfileManagersTypedData({
        approveSignless: enable,
    });

    const { id, typedData } = typedDataResult.unwrap();
    const walletClient = await getWalletClientRequired(config);
    const signedTypedData = await walletClient.signTypedData({
        domain: typedData.domain as TypedDataDomain,
        types: typedData.types,
        primaryType: 'ChangeDelegatedExecutorsConfig',
        message: typedData.value,
    });

    const broadcastOnchainResult = await lensSessionHolder.sdk.transaction.broadcastOnchain({
        id,
        signature: signedTypedData,
    });

    const onchainRelayResult = broadcastOnchainResult.unwrap();

    if (onchainRelayResult.__typename === 'RelayError') {
        // TODO: read error message from onchainRelayResult and show it to user
        console.warn("Couldn't update signless", onchainRelayResult);
        throw new Error("Couldn't update signless");
    }
    return;
}
