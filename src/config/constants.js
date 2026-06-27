/**
 * Constants & Configuration
 * 
 * Centralized configuration for all scrapers, user agents,
 * timeouts, and default values.
 */

// ─── User Agent Pool ───────────────────────────────────────────
// Rotated randomly to avoid fingerprinting
export const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
];

// ─── HTTP Defaults ─────────────────────────────────────────────
export const HTTP_DEFAULTS = {
    timeoutMs: 30_000,       // 30 second timeout per request
    maxRetries: 3,           // Retry failed requests up to 3 times
    retryDelayMs: 1_000,     // Initial retry delay (exponential backoff)
    delayBetweenRequestsMs: 500, // Minimum delay between requests to same host
};

// ─── Concurrency ───────────────────────────────────────────────
export const CONCURRENCY = {
    defaultMaxConcurrency: 5,  // Max scrapers running in parallel
    minConcurrency: 1,
    maxConcurrency: 10,
};

// ─── Scraper Registry ──────────────────────────────────────────
// Single source of truth for all supported job platforms
export const SCRAPER_REGISTRY = {
    // ── Original / Core sources ──
    remoteok: {
        name: 'remoteok',
        displayName: 'RemoteOK',
        baseUrl: 'https://remoteok.com',
        category: 'remote',
        type: 'api', // Uses JSON API
    },
    indeed: {
        name: 'indeed',
        displayName: 'Indeed',
        baseUrl: 'https://www.indeed.com',
        category: 'worldwide',
        type: 'html',
    },
    wellfound: {
        name: 'wellfound',
        displayName: 'Wellfound',
        baseUrl: 'https://wellfound.com',
        category: 'worldwide',
        type: 'html',
    },
    weworkremotely: {
        name: 'weworkremotely',
        displayName: 'WeWorkRemotely',
        baseUrl: 'https://weworkremotely.com',
        category: 'remote',
        type: 'html',
    },

    // ── Worldwide platforms ──
    glassdoor: {
        name: 'glassdoor',
        displayName: 'Glassdoor',
        baseUrl: 'https://www.glassdoor.com',
        category: 'worldwide',
        type: 'html',
    },
    monster: {
        name: 'monster',
        displayName: 'Monster',
        baseUrl: 'https://www.monster.com',
        category: 'worldwide',
        type: 'html',
    },
    simplyhired: {
        name: 'simplyhired',
        displayName: 'SimplyHired',
        baseUrl: 'https://www.simplyhired.com',
        category: 'worldwide',
        type: 'html',
    },
    ziprecruiter: {
        name: 'ziprecruiter',
        displayName: 'ZipRecruiter',
        baseUrl: 'https://www.ziprecruiter.com',
        category: 'worldwide',
        type: 'html',
    },
    dice: {
        name: 'dice',
        displayName: 'Dice',
        baseUrl: 'https://www.dice.com',
        category: 'tech',
        type: 'html',
    },
    flexjobs: {
        name: 'flexjobs',
        displayName: 'FlexJobs',
        baseUrl: 'https://www.flexjobs.com',
        category: 'remote',
        type: 'html',
    },
    jobicy: {
        name: 'jobicy',
        displayName: 'Jobicy',
        baseUrl: 'https://jobicy.com',
        category: 'remote',
        type: 'api',
    },
    linkedin: {
        name: 'linkedin',
        displayName: 'LinkedIn',
        baseUrl: 'https://www.linkedin.com',
        category: 'worldwide',
        type: 'html',
    },
    careerbuilder: {
        name: 'careerbuilder',
        displayName: 'CareerBuilder',
        baseUrl: 'https://www.careerbuilder.com',
        category: 'worldwide',
        type: 'html',
    },
    angellist: {
        name: 'angellist',
        displayName: 'AngelList',
        baseUrl: 'https://angel.co',
        category: 'startup',
        type: 'html',
    },
    toptal: {
        name: 'toptal',
        displayName: 'Toptal',
        baseUrl: 'https://www.toptal.com',
        category: 'remote',
        type: 'html',
    },
    turing: {
        name: 'turing',
        displayName: 'Turing',
        baseUrl: 'https://www.turing.com',
        category: 'remote',
        type: 'html',
    },
    arc: {
        name: 'arc',
        displayName: 'Arc',
        baseUrl: 'https://arc.dev',
        category: 'remote',
        type: 'html',
    },

    // ── India platforms ──
    naukri: {
        name: 'naukri',
        displayName: 'Naukri',
        baseUrl: 'https://www.naukri.com',
        category: 'india',
        type: 'html',
    },
    shine: {
        name: 'shine',
        displayName: 'Shine',
        baseUrl: 'https://www.shine.com',
        category: 'india',
        type: 'html',
    },
    timesjobs: {
        name: 'timesjobs',
        displayName: 'TimesJobs',
        baseUrl: 'https://www.timesjobs.com',
        category: 'india',
        type: 'html',
    },
    foundit: {
        name: 'foundit',
        displayName: 'Foundit',
        baseUrl: 'https://www.foundit.in',
        category: 'india',
        type: 'html',
    },
    instahyre: {
        name: 'instahyre',
        displayName: 'Instahyre',
        baseUrl: 'https://www.instahyre.com',
        category: 'india',
        type: 'html',
    },
    hirist: {
        name: 'hirist',
        displayName: 'Hirist',
        baseUrl: 'https://www.hirist.tech',
        category: 'india',
        type: 'html',
    },
    cutshort: {
        name: 'cutshort',
        displayName: 'CutShort',
        baseUrl: 'https://cutshort.io',
        category: 'india',
        type: 'html',
    },
};

// ─── Helper Functions ──────────────────────────────────────────

/**
 * Get display name for a source key
 * @param {string} sourceKey - Source identifier
 * @returns {string} Human-readable name
 */
export function getSourceDisplayName(sourceKey) {
    return SCRAPER_REGISTRY[sourceKey]?.displayName || sourceKey;
}

/**
 * Get a random User-Agent string
 * @returns {string}
 */
export function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Get all valid source keys
 * @returns {string[]}
 */
export function getAllSourceKeys() {
    return Object.keys(SCRAPER_REGISTRY);
}

/**
 * Get sources by category
 * @param {string} category - 'worldwide', 'remote', 'india', 'tech', 'startup'
 * @returns {string[]}
 */
export function getSourcesByCategory(category) {
    return Object.entries(SCRAPER_REGISTRY)
        .filter(([, config]) => config.category === category)
        .map(([key]) => key);
}
