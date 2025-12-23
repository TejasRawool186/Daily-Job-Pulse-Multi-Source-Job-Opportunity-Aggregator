/**
 * Data normalization utilities for job listings
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

    return {
        jobTitle: cleanString(job.jobTitle),
        company: cleanString(job.company),
        location: cleanString(job.location) || 'Not specified',
        source: job.source || 'Unknown',
        postedDate: formatDate(job.postedDate),
        jobUrl: job.jobUrl || job.applyLink,
        applyLink: job.applyLink,
    };
}

/**
 * Clean and trim a string
 * @param {string} str - Input string
 * @returns {string} - Cleaned string
 */
function cleanString(str) {
    if (!str) return '';
    return str.toString().trim().replace(/\s+/g, ' ');
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
