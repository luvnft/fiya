/**
 * Remove leading hash from text.
 * When searching for hash tag, we need to remove the hash.
 * And we only handle the first hash
 */
export function unhash(text: string) {
    return text.trim().replace(/^#/, '');
}
