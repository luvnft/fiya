export const URL_REGEX =
    /(?<!@)\b((https?:\/\/)?[a-zA-Z0-9]+([-.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}(:[0-9]{1,5})?(\/[^ \n,)]*)?)/gi;

export const EMAIL_REGEX =
    /(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))/;

export const MENTION_REGEX = /@[^\s()@:%+~#?&=,!?']+/g;

export const HASHTAG_REGEX = /(#\w*[A-Za-z]\w*)/g;

export const CHANNEL_REGEX = /(?<=\s)\/[\w-]+\b/g;

export const MIRROR_HOSTNAME_REGEXP = /mirror\.xyz|.+\.mirror\.xyz/i;

export const WARPCAST_THREAD_REGEX = /^https:\/\/warpcast\.com\/([^/]+)\/([^/]+)$/;

export const WARPCAST_CONVERSATIONS_REGEX = /^https:\/\/warpcast\.com\/~\/conversations\/0x[a-fA-F0-9]+$/;

export const LENS_DETAIL_REGEX = /^https:\/\/hey\.xyz\/posts\/.*$/;

export const MASK_SOCIAL_DETAIL_REGEX =
    /((https:\/\/|http:\/\/)?(?:firefly\.|firefly-staging\.|firefly-canary\.)?mask\.social|\.vercel\.app)\/post\/([\w-]+)$/i;

export const OLD_MASK_SOCIAL_POST_PATH_REGEX = /\/post\/(lens|farcaster)\/([\w-]+)/i;

export const OLD_MASK_SOCIAL_PROFILE_PATH_REGEX = /\/profile\/(\w+)\/([\w-]+)/i;

export const MASK_SOCIAL_POST_PATH_REGEX = /\/post\/([\w-]+)/i;

export const BIO_TWITTER_PROFILE_REGEX = /([^\s]+)\.twitter/;