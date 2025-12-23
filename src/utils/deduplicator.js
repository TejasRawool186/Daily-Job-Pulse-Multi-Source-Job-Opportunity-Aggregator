/**
 * Deduplication utilities for job listings
 */

/**
 * Generate a unique key for a job listing
 * Based on: job title + company + apply link
 * @param {Object} job - Normalized job object
 * @returns {string} - Unique key
 */
function generateJobKey(job) {
    const title = (job.jobTitle || '').toLowerCase().trim();
    const company = (job.company || '').toLowerCase().trim();
    const applyLink = (job.applyLink || '').toLowerCase().trim();

    return `${title}|${company}|${applyLink}`;
}

/**
 * Remove duplicate job listings
 * Prioritizes jobs with more complete information
 * @param {Array} jobs - Array of normalized job objects
 * @returns {Array} - Deduplicated array of jobs
 */
export function deduplicateJobs(jobs) {
    const seen = new Map();

    for (const job of jobs) {
        const key = generateJobKey(job);

        if (!seen.has(key)) {
            seen.set(key, job);
        } else {
            // Keep the job with more complete information
            const existing = seen.get(key);
            const existingScore = calculateCompletenessScore(existing);
            const newScore = calculateCompletenessScore(job);

            if (newScore > existingScore) {
                seen.set(key, job);
            }
        }
    }

    return Array.from(seen.values());
}

/**
 * Calculate a completeness score for a job listing
 * Higher score = more complete information
 * @param {Object} job - Job object
 * @returns {number} - Completeness score
 */
function calculateCompletenessScore(job) {
    let score = 0;

    if (job.jobTitle && job.jobTitle !== 'Not specified') score += 1;
    if (job.company && job.company !== 'Not specified') score += 1;
    if (job.location && job.location !== 'Not specified') score += 1;
    if (job.postedDate) score += 1;
    if (job.jobUrl && job.jobUrl !== job.applyLink) score += 1;
    if (job.applyLink) score += 1;

    return score;
}
