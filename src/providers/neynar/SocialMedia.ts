import { createIndicator, createPageable, EMPTY_LIST, type Pageable, type PageIndicator } from '@masknet/shared-base';
import urlcat from 'urlcat';

import { farcasterClient } from '@/configs/farcasterClient.js';
import { NEYNAR_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatFarcasterProfileFromNeynar } from '@/helpers/formatFarcasterProfileFromNeynar.js';
import type { Profile as NeynarProfile } from '@/providers/types/Neynar.js';
import {
    type Notification,
    type Post,
    type Profile,
    type Provider,
    type Reaction,
    SessionType,
} from '@/providers/types/SocialMedia.js';

function fetchNeynarJSON<T>(url: string, options: RequestInit): Promise<T> {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (process.env.HUBBLE_TOKEN) {
        // @ts-ignore - api_key is not in the type definition
        headers.api_key = process.env.HUBBLE_TOKEN;
    } else if (process.env.NEXT_PUBLIC_HUBBLE_TOKEN) {
        // @ts-ignore - api_key is not in the type definition
        headers.api_key = process.env.NEXT_PUBLIC_HUBBLE_TOKEN;
    }

    return fetchJSON(url, {
        ...options,
        headers,
    });
}

export class NeynarSocialMedia implements Provider {
    get type() {
        return SessionType.Farcaster;
    }

    async publishPost(post: Post): Promise<string> {
        throw new Error('Method not implemented.');
    }

    async upvotePost(postId: string): Promise<Reaction> {
        throw new Error('Method not implemented.');
    }

    async unvotePost(postId: string) {
        throw new Error('Method not implemented.');
    }

    async getProfilesByAddress(address: string): Promise<Profile[]> {
        throw new Error('Method not implemented.');
    }

    async getProfileById(profileId: string): Promise<Profile> {
        throw new Error('Method not implemented.');
    }

    async getProfileByHandle(handle: string): Promise<Profile> {
        throw new Error('Method not implemented.');
    }

    async getPostById(postId: string): Promise<Post> {
        throw new Error('Method not implemented.');
    }

    async getCommentsById(postId: string): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async discoverPosts(): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async discoverPostsById(profileId: string): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getPostsByProfileId(profileId: string): Promise<Pageable<Post>> {
        throw new Error('Method not implemented.');
    }

    async getPostsBeMentioned(profileId: string): Promise<Pageable<Post>> {
        throw new Error('Method not implemented.');
    }

    async getPostsLiked(profileId: string): Promise<Pageable<Post>> {
        throw new Error('Method not implemented.');
    }

    async getPostsReplies(profileId: string): Promise<Pageable<Post>> {
        throw new Error('Method not implemented.');
    }

    async getPostsByParentPostId(postId: string): Promise<Pageable<Post>> {
        throw new Error('Method not implemented.');
    }

    async getReactors(postId: string): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }

    async follow(profileId: string) {
        throw new Error('Method not implemented.');
    }
    async unfollow(profileId: string) {
        throw new Error('Method not implemented.');
    }
    async getFollowers(profileId: string): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }
    async getFollowings(profileId: string): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }
    async getNotifications(): Promise<Pageable<Notification>> {
        throw new Error('Method not implemented.');
    }
    async getSuggestedFollows(): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }
    async searchPosts(q: string): Promise<Pageable<Post>> {
        throw new Error('Method not implemented.');
    }
    async getThreadByPostId(postId: string): Promise<Post[]> {
        throw new Error('Method not implemented.');
    }

    async getProfilesByIds(ids: string[]) {
        const session = farcasterClient.getSession();
        if (!ids.length) return EMPTY_LIST;
        const url = urlcat(NEYNAR_URL, '/v2/farcaster/user/bulk', {
            fids: ids.join(','),
            viewer_fid: session?.profileId,
        });

        const data = await fetchNeynarJSON<{ users: NeynarProfile[] }>(url, {
            method: 'GET',
        });

        return data.users.map(formatFarcasterProfileFromNeynar);
    }
    async searchProfiles(q: string, indicator?: PageIndicator | undefined) {
        const session = farcasterClient.getSession();
        const url = urlcat(NEYNAR_URL, '/v2/farcaster/user/search', {
            q,
            viewer_fid: session?.profileId || 0,
        });

        const data = await fetchNeynarJSON<{ result: { users: NeynarProfile[] } }>(url, {
            method: 'GET',
        });

        const result = data.result.users.map(formatFarcasterProfileFromNeynar);
        return createPageable(result, createIndicator(indicator));
    }
}

export const NeynarSocialMediaProvider = new NeynarSocialMedia();
