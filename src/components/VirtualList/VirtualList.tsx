'use client';

import { floor } from 'lodash-es';
import React, { useRef } from 'react';
import { useMount, useWindowSize } from 'react-use';
import { Virtuoso, type VirtuosoHandle, type VirtuosoProps } from 'react-virtuoso';

import { useGlobalState } from '@/store/useGlobalStore.js';

interface VirtualListProps<ItemData = unknown, Context = unknown> extends VirtuosoProps<ItemData, Context> {
    listKey?: string;
}

export function VirtualList<ItemData = unknown, Context = unknown>({
    listKey,
    ...rest
}: VirtualListProps<ItemData, Context>) {
    const { height } = useWindowSize();
    const { scrollIndex, setScrollIndex } = useGlobalState();
    const ref = useRef<VirtuosoHandle>(null);

    useMount(() => {
        if (!listKey) return;
        const index = scrollIndex[listKey];
        if (!index) return;
        ref.current?.scrollIntoView({
            index,
            align: 'center',
        });
    });

    return (
        <Virtuoso
            ref={ref}
            overscan={height}
            increaseViewportBy={height}
            {...rest}
            rangeChanged={({ startIndex, endIndex }) => {
                if (!listKey) return;
                setScrollIndex(listKey, floor((endIndex - startIndex) / 2));
            }}
        />
    );
}
