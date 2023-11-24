import { Image } from '@/esm/Image.js';

interface AccountCardProps {
    avatar: string;
    name: string;
    userName: string;
    id: string;
    setAccount: (profileId: string) => void;
    isCurrent: boolean;
}

export function AccountCard({ avatar, name, userName, id, isCurrent, setAccount }: AccountCardProps) {
    return (
        <div className="inline-flex h-[48px] w-full items-center justify-start gap-[16px]">
            <div
                className="flex h-[48px] w-[48px] items-center justify-center rounded-[99px]"
                style={{
                    background:
                        'radial-gradient(circle at center, rgba(255, 184, 224, 1), rgba(190, 158, 255, 1), rgba(136, 192, 252, 1), rgba(134, 255, 153, 1))',
                }}
            >
                <Image src={avatar} alt="avatar" width={46} height={46} className="rounded-[99px]" />
            </div>
            <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                <div className="font-['PingFang SC'] text-base font-medium text-neutral-900">{name}</div>
                <div className="font-['PingFang SC'] text-[15px] font-normal text-neutral-500">@{userName}</div>
            </div>
            {isCurrent ? (
                <Image src="/svg/yes.svg" alt="yes" width={40} height={40} />
            ) : (
                <button
                    onClick={() => {
                        setAccount(id);
                    }}
                >
                    <Image src="/svg/disableNo.svg" alt="select" width={20} height={20} />
                </button>
            )}
        </div>
    );
}