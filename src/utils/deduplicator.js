/**
 * Deduplication Utilities
 * 
 * Removes duplicate job listings using exact and fuzzy matching,
 * URL normalization, and completeness scoring.
 */

import { log } from 'apify';

/**
 * Generate a unique key for a job listing (exact match)
 * @param {Object} job - Normalized job object
 * @returns {string} - Unique key
 */
function generateJobKey(job) {
    const title = normalizeText(job.jobTitle);
    const company = normalizeText(job.company);
    const applyLink = normalizeUrl(job.applyLink);
    return `${title}|${company}|${applyLink}`;
}

/**
 * Generate a fuzzy key for near-duplicate detection
 * @param {Object} job - Normalized job object
 * @returns {string} - Fuzzy key
 */
function generateFuzzyKey(job) {
    // Extract core words from title (remove common filler words)
    const titleWords = normalizeText(job.jobTitle)
        .split(/\s+/)
        .filter(w => !FILLER_WORDS.has(w))
        .sort()
        .join(' ');
    const company = normalizeText(job.company);
    return `${titleWords}|${company}`;
}

/**
 * Words to ignore during fuzzy matching
 */
const FILLER_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'for', 'in', 'at', 'to', 'of',
    'is', 'are', 'was', 'were', 'be', 'been',
    'job', 'position', 'role', 'opportunity', 'opening',
    'i', 'ii', 'iii', 'iv', 'v',
    '-', '–', '—', '/', '|',
]);

/**
 * Normalize text for comparison
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Remove special chars
        .replace(/\s+/g, ' ');
}

/**
 * Normalize URL for comparison (strip tracking params, normalize domain)
 * @param {string} url
 * @returns {string}
 */
function normalizeUrl(url) {
    if (!url) return '';
    try {
        const parsed = new URL(url.toLowerCase().trim());
        // Remove common tracking parameters
        const trackingParams = [
            'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
            'ref', 'fbclid', 'gclid', 'source', 'from', 'via',
        ];
        trackingParams.forEach(p => parsed.searchParams.delete(p));
        return `${parsed.hostname}${parsed.pathname}`;
    } catch {
        return url.toLowerCase().trim();
    }
}

/**
 * Remove duplicate job listings
 * Uses both exact and fuzzy matching.
 * Prioritizes jobs with more complete information.
 * 
 * @param {Array} jobs - Array of normalized job objects
 * @returns {Array} - Deduplicated array of jobs
 */
export function deduplicateJobs(jobs) {
    const exactSeen = new Map();
    const fuzzySeen = new Map();
    let exactDupes = 0;
    let fuzzyDupes = 0;

    for (const job of jobs) {
        const exactKey = generateJobKey(job);
        const fuzzyKey = generateFuzzyKey(job);

        // Check exact duplicate
        if (exactSeen.has(exactKey)) {
            const existing = exactSeen.get(exactKey);
            if (calculateCompletenessScore(job) > calculateCompletenessScore(existing)) {
                exactSeen.set(exactKey, job);
                // Update fuzzy map too
                fuzzySeen.set(fuzzyKey, job);
            }
            exactDupes++;
            continue;
        }

        // Check fuzzy duplicate (same title words + company, different URL)
        if (fuzzySeen.has(fuzzyKey)) {
            const existing = fuzzySeen.get(fuzzyKey);
            if (calculateCompletenessScore(job) > calculateCompletenessScore(existing)) {
                // Remove old exact entry, add new one
                const oldExactKey = generateJobKey(existing);
                exactSeen.delete(oldExactKey);
                exactSeen.set(exactKey, job);
                fuzzySeen.set(fuzzyKey, job);
            }
            fuzzyDupes++;
            continue;
        }

        exactSeen.set(exactKey, job);
        fuzzySeen.set(fuzzyKey, job);
    }

    const uniqueJobs = Array.from(exactSeen.values());

    if (exactDupes > 0 || fuzzyDupes > 0) {
        log.info(`🔄 Deduplication: removed ${exactDupes} exact + ${fuzzyDupes} fuzzy duplicates (${jobs.length} → ${uniqueJobs.length})`);
    }

    return uniqueJobs;
}

/**
 * Calculate a completeness score for a job listing
 * Higher score = more complete / valuable information
 * @param {Object} job - Job object
 * @returns {number} - Completeness score
 */
function calculateCompletenessScore(job) {
    let score = 0;

    if (job.jobTitle && job.jobTitle !== 'Not specified') score += 2;
    if (job.company && job.company !== 'Not specified' && job.company !== 'Unknown') score += 2;
    if (job.location && job.location !== 'Not specified') score += 1;
    if (job.postedDate && job.postedDate !== new Date().toISOString().split('T')[0]) score += 1;
    if (job.jobUrl && job.jobUrl !== job.applyLink) score += 1;
    if (job.applyLink) score += 1;
    if (job.jobType && job.jobType !== 'onsite') score += 1; // Explicitly tagged remote/hybrid

    return score;
}
