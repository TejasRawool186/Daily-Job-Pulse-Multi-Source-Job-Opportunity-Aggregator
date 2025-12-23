/**
 * Wellfound (AngelList Talent) Job Scraper
 * 
 * Scrapes job listings from Wellfound
 * https://wellfound.com
 */

import { log } from 'apify';
import * as cheerio from 'cheerio';

const WELLFOUND_BASE_URL = 'https://wellfound.com';

/**
 * Scrape jobs from Wellfound
 * @param {Object} options - Scraper options
 * @param {string[]} options.roles - Job roles to search
 * @param {string} options.location - Location filter
 * @param {number} options.maxResults - Max results to return
 * @param {number} options.maxDaysOld - Max age of jobs in days
 * @returns {Promise<Array>} - Array of job listings
 */
export async function scrapeWellfound({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];

    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            // Build search URL - Wellfound uses slug-style URLs
            const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
            const locationParam = location?.toLowerCase() === 'remote'
                ? 'remote=true'
                : '';

            const searchUrl = `${WELLFOUND_BASE_URL}/role/${roleSlug}?${locationParam}`;

            log.debug(`Wellfound: Searching for "${role}"...`);

            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                },
            });

            if (!response.ok) {
                log.warning(`Wellfound: HTTP ${response.status} for role "${role}"`);
                // Try alternative search URL
                await scrapeWellfoundSearch(role, location, maxResults, jobs);
                continue;
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            // Parse job listings from the role page
            $('div[class*="job-listing"], div[class*="styles_jobListing"]').each((index, element) => {
                if (jobs.length >= maxResults) return false;

                const $el = $(element);

                // Extract job details
                const $titleLink = $el.find('a[href*="/jobs/"]').first();
                const jobTitle = $titleLink.text().trim() ||
                    $el.find('h2, h3, h4').first().text().trim();

                const company = $el.find('[class*="company"], [class*="startup"]').first().text().trim() ||
                    $el.find('a[href*="/company/"]').text().trim();

                const jobLocation = $el.find('[class*="location"]').text().trim() ||
                    (location || 'Not specified');

                const href = $titleLink.attr('href') || '';

                // Skip if missing required fields
                if (!jobTitle || !company) return;

                const jobUrl = href.startsWith('http') ? href : `${WELLFOUND_BASE_URL}${href}`;

                jobs.push({
                    jobTitle,
                    company,
                    location: jobLocation,
                    source: 'Wellfound',
                    postedDate: new Date().toISOString(),
                    jobUrl: jobUrl || `${WELLFOUND_BASE_URL}/role/${roleSlug}`,
                    applyLink: jobUrl || `${WELLFOUND_BASE_URL}/role/${roleSlug}`,
                });
            });

            // Small delay between searches
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        log.info(`Wellfound: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Wellfound scraper error: ${error.message}`);
        throw error;
    }

    return jobs;
}

/**
 * Alternative search using Wellfound's search page
 */
async function scrapeWellfoundSearch(role, location, maxResults, jobs) {
    try {
        const searchUrl = `${WELLFOUND_BASE_URL}/jobs?q=${encodeURIComponent(role)}`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
            },
        });

        if (!response.ok) return;

        const html = await response.text();
        const $ = cheerio.load(html);

        $('a[href*="/jobs/"]').each((index, element) => {
            if (jobs.length >= maxResults) return false;

            const $el = $(element);
            const href = $el.attr('href');
            const jobTitle = $el.text().trim();

            if (!jobTitle || jobTitle.length < 3) return;

            const jobUrl = href.startsWith('http') ? href : `${WELLFOUND_BASE_URL}${href}`;

            // Avoid duplicates
            if (jobs.some(j => j.jobUrl === jobUrl)) return;

            jobs.push({
                jobTitle,
                company: 'Startup (via Wellfound)',
                location: location || 'Not specified',
                source: 'Wellfound',
                postedDate: new Date().toISOString(),
                jobUrl,
                applyLink: jobUrl,
            });
        });
    } catch (error) {
        log.debug(`Wellfound search fallback error: ${error.message}`);
    }
}
