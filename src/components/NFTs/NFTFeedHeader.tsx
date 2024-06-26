import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm';
import urlcat from 'urlcat';
import type { Address } from 'viem';

import { Avatar } from '@/components/Avatar.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { NFTMoreAction } from '@/components/NFTs/NFTMoreAction.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import type { NFTOwnerDisplayInfo } from '@/providers/types/NFTs.js';

interface NFTFeedHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    address: Address;
    contractAddress: Address;
    displayInfo: NFTOwnerDisplayInfo;
    time: number | string | Date;
    tokenId: string;
    chainId: ChainId;
}

export function NFTFeedHeader({
    address,
    contractAddress,
    displayInfo,
    time,
    chainId,
    tokenId,
    className,
    ...rest
}: NFTFeedHeaderProps) {
    const authorUrl = urlcat('/profile/:address', {
        address,
        source: SourceInURL.Wallet,
    });

    return (
        <div
            className={classNames(
                'flex items-start gap-3',
                className,
                !displayInfo.ensHandle ? '-mb-4' : 'mb-1.5 sm:-mb-4',
            )}
            {...rest}
        >
            <Link href={authorUrl} className="z-[1]" onClick={(event) => event.stopPropagation()}>
                <Avatar className="h-10 w-10" src={displayInfo.avatarUrl} size={40} alt={address} />
            </Link>

            <div className="flex max-w-[calc(100%-40px-88px-24px)] flex-1 flex-col items-start overflow-hidden sm:flex-row">
                <Link
                    href={authorUrl}
                    onClick={(event) => event.stopPropagation()}
                    className="block max-w-full truncate text-[15px] font-bold leading-5 text-main"
                >
                    {displayInfo.ensHandle ? displayInfo.ensHandle : formatEthereumAddress(address, 4)}
                </Link>
                {displayInfo.ensHandle ? (
                    <Link
                        href={authorUrl}
                        className="block max-w-full truncate text-[15px] leading-5 text-secondary sm:ml-2"
                    >
                        {formatEthereumAddress(address, 4)}
                    </Link>
                ) : null}
            </div>

            <div className="ml-auto flex items-center space-x-2">
                <ChainIcon chainId={chainId} size={20} />
                <span className="whitespace-nowrap text-xs leading-4 text-secondary md:text-[13px]">
                    <TimestampFormatter time={time} />
                </span>
                <NFTMoreAction
                    address={address}
                    contractAddress={contractAddress}
                    tokenId={tokenId}
                    chainId={chainId}
                />
            </div>
        </div>
    );
}
