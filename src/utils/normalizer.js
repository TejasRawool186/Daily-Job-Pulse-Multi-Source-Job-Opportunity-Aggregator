/**
 * Data Normalization Utilities
 * 
 * Normalizes job listings to a consistent output format
 * with validation, sanitization, and enrichment.
 */

/**
 * Normalize a job listing to the standard output format
 * @param {Object} job - Raw job data from scraper
 * @returns {Object|null} - Normalized job or null if invalid
 */
export function normalizeJob(job) {
    // Validate required fields
    if (!job.jobTitle || !job.company || !job.applyLink) {
        return null;
    }

    // Validate URL
    const applyLink = sanitizeUrl(job.applyLink);
    const jobUrl = sanitizeUrl(job.jobUrl) || applyLink;

    if (!applyLink) return null;

    // Detect job type from location/title
    const jobType = detectJobType(job.location, job.jobTitle);

    return {
        jobTitle: cleanString(job.jobTitle),
        company: cleanString(job.company),
        location: cleanString(job.location) || 'Not specified',
        source: job.source || 'Unknown',
        postedDate: formatDate(job.postedDate),
        jobUrl,
        applyLink,
        jobType,
        scrapedAt: new Date().toISOString(),
    };
}

/**
 * Clean and trim a string, removing HTML entities and excess whitespace
 * @param {string} str - Input string
 * @returns {string} - Cleaned string
 */
function cleanString(str) {
    if (!str) return '';
    return str
        .toString()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

/**
 * Sanitize and validate a URL
 * @param {string|undefined} url - Input URL
 * @returns {string|null} - Valid URL or null
 */
function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();

    // Must start with http:// or https://
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return null;
    }

    try {
        const parsed = new URL(trimmed);
        // Strip common tracking parameters
        const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'fbclid', 'gclid'];
        trackingParams.forEach(param => parsed.searchParams.delete(param));
        return parsed.toString();
    } catch {
        return null;
    }
}

/**
 * Detect job type (remote, hybrid, onsite) from text signals
 * @param {string} location - Job location
 * @param {string} title - Job title
 * @returns {string} - 'remote', 'hybrid', or 'onsite'
 */
function detectJobType(location, title) {
    const text = `${location || ''} ${title || ''}`.toLowerCase();

    if (text.includes('remote') || text.includes('work from home') || text.includes('wfh') || text.includes('anywhere')) {
        if (text.includes('hybrid')) return 'hybrid';
        return 'remote';
    }
    if (text.includes('hybrid') || text.includes('flexible')) return 'hybrid';
    return 'onsite';
}

/**
 * Format a date to YYYY-MM-DD format
 * @param {string|Date|number} date - Input date
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    if (!date) {
        return new Date().toISOString().split('T')[0];
    }

    try {
        // Handle Unix timestamp (seconds)
        if (typeof date === 'number') {
            const d = new Date(date * 1000);
            return d.toISOString().split('T')[0];
        }

        // Handle Date object or string
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            return new Date().toISOString().split('T')[0];
        }
        return d.toISOString().split('T')[0];
    } catch {
        return new Date().toISOString().split('T')[0];
    }
}

/**
 * Check if a job is within the allowed age
 * @param {string|Date|number} postedDate - Job posting date
 * @param {number} maxDaysOld - Maximum age in days
 * @returns {boolean} - True if job is fresh enough
 */
export function isJobFresh(postedDate, maxDaysOld) {
    if (!postedDate || !maxDaysOld) return true;

    try {
        let jobDate;

        if (typeof postedDate === 'number') {
            jobDate = new Date(postedDate * 1000);
        } else {
            jobDate = new Date(postedDate);
        }

        if (isNaN(jobDate.getTime())) return true;

        const now = new Date();
        const diffTime = Math.abs(now - jobDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays <= maxDaysOld;
    } catch {
        return true;
    }
}
