export function getTwitterErrorMessage(error: unknown) {
    if (!(error instanceof Error)) return 'Unknown error.';
    try {
        const {
            data: { detail, title, status },
        } = error as unknown as {
            data: {
                detail: string;
                title: string;
                status: number;
            };
        };

        return [`${title} ${status}`, detail].join('\n');
    } catch {
        return error.message;
    }
}
