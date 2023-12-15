import { t } from '@lingui/macro';

import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export const metadata = createSiteMetadata({
    title: createPageTitle(t`Communities`),
});

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}