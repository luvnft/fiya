'use client';
import LoadingIcon from '@/assets/loading.svg';

export default function Loading() {
    return (
        <div className="flex min-h-[500px] items-center justify-center">
            {/* <Image src="/svg/loading.svg" className="animate-spin" width={24} height={24} alt="loading" /> */}
            <LoadingIcon className="animate-spin" width={24} height={24} />
        </div>
    );
}