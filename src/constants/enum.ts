export enum NODE_ENV {
    Production = 'production',
    Development = 'development',
    Test = 'test',
}
export enum VERCEL_NEV {
    Production = 'production',
    Preview = 'preview',
    Development = 'development',
}

export enum STATUS {
    Enabled = 'enabled',
    Disabled = 'disabled',
}

export enum PageRoute {
    Home = '/',
    Following = '/following',
    Notifications = '/notifications',
    Profile = '/profile',
    Settings = '/settings',
    Developers = '/developers',
    Search = '/search',
}

export enum SocialPlatform {
    Farcaster = 'Farcaster',
    Lens = 'Lens',
    Twitter = 'Twitter',
}

export enum SourceInURL {
    Farcaster = 'farcaster',
    Lens = 'lens',
    Twitter = 'twitter',
}

export enum SearchType {
    Users = 'users',
    Posts = 'posts',
    Channels = 'channels',
}

export enum KeyType {
    DigestOpenGraphLink = 'digestOpenGraphLink',
    DigestFrameLink = 'digestFrameLink',
    GetPostOGById = 'getPostOGById',
    GetProfileOGById = 'getProfileOGById',
    GetChannelOGById = 'getChannelOGById',
    UploadToBlob = 'uploadToBlob',
    GetLensThreadByPostId = 'getLensThreadByPostId',
    RefreshLensThreadLock = 'RefreshLensThreadLock',
    GetFollowings = 'getFollowings',
}

export enum ProfileTabType {
    Feed = 'Feed',
    Replies = 'Replies',
    Liked = 'Liked',
    Media = 'Media',
    Collected = 'Collected',
    Channels = 'Channels',
}

export enum EngagementType {
    Mirrors = 'mirrors',
    Quotes = 'quotes',
    Recasts = 'recasts',
    Likes = 'likes',
}

export enum RestrictionType {
    Everyone = 0,
    OnlyPeopleYouFollow = 1,
    MentionedUsers = 2,
}

export enum ScrollListKey {
    Discover = 'discover-list',
    Following = 'following-list',
    Followers = 'followers-list',
    Notification = 'notification-list',
    Search = 'search-list',
    Comment = 'comment-list',
    Channel = 'channel-post-list',
    Profile = 'profile-post-list',
    Collected = 'profile-collected-list',
    Engagement = 'post-engagement',
}
