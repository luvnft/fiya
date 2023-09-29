'use client';

import { Session } from 'next-auth';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useMounted } from '@/hooks/useMounted';
import { NextAuthProvider } from '@/components/NextAuthProvider';
import Image from 'next/image';

export interface NextAuthExampleProps {
    session: Session | null;
}

export function NextAuthExample(props: NextAuthExampleProps) {
    const mounted = useMounted();
    if (!mounted) return null;

    return (
        <NextAuthProvider session={props.session}>
            <Example />
        </NextAuthProvider>
    );
}


function Example() {
    const { data: session, status } = useSession();

    if (status === 'authenticated') {
        return (
            <div>
                {session.user?.image? <Image width={32} height={32} src={session.user?.image} alt={session.user.name ?? 'User'} />: null}
                <p>Signed in as {session.user?.email ?? session.user?.name}</p>
                <button onClick={() => signOut()}>Sign out</button>
            </div>
        );
    }
    return (
        <div>
            <p>Hi, there!</p>
            <button onClick={() => signIn()}>Sign in</button>
        </div>
    );
}
