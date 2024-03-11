'use client';

import { Trans } from '@lingui/macro';
import { Appearance } from '@masknet/public-api';
import { useMemo } from 'react';
import { useMediaQuery } from 'usehooks-ts';

import { changeLocale } from '@/actions/changeLocale.js';
import { OptionButton } from '@/app/(settings)/components/OptionButton.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { useThemeModeStore } from '@/store/useThemeModeStore.js';
import { Locale } from '@/types/index.js';

export default function Display() {
    const setThemeMode = useThemeModeStore.use.setThemeMode();
    const mode = useThemeModeStore.use.themeMode();
    const isDarkOS = useMediaQuery('(prefers-color-scheme: dark)');
    const locale = useMemo(() => getLocaleFromCookies(), []);

    return (
        <div className="flex w-full flex-col items-center p-[24px]">
            <div className=" w-full gap-[24px] pb-6 text-[20px] font-bold leading-[24px] text-main">
                <Trans>Display</Trans>
            </div>

            {[
                {
                    value: Appearance.default,
                    label: <Trans>Follow System</Trans>,
                },
                {
                    value: Appearance.light,
                    label: <Trans>Light Mode</Trans>,
                },
                {
                    value: Appearance.dark,
                    label: <Trans>Dark Mode</Trans>,
                },
            ].map((option, index) => (
                <OptionButton
                    key={index}
                    darkMode={option.value === Appearance.default ? isDarkOS : option.value === Appearance.dark}
                    selected={mode === option.value}
                    label={option.label}
                    onClick={() => {
                        setThemeMode(option.value);
                    }}
                />
            ))}

            <div className=" w-full gap-[24px] py-6 text-[20px] font-bold leading-[24px] text-main">
                <Trans>Language</Trans>
            </div>

            {[
                {
                    value: Locale.en,
                    label: 'English',
                },
                {
                    value: Locale.zhHans,
                    label: '简体中文',
                },
            ].map((option, index) => (
                <OptionButton
                    key={index}
                    selected={option.value === locale}
                    darkMode={mode === Appearance.default ? isDarkOS : mode === Appearance.dark}
                    label={option.label}
                    onClick={async () => {
                        const data = new FormData();
                        data.append('locale', option.value);
                        await changeLocale(data);
                    }}
                />
            ))}
        </div>
    );
}
