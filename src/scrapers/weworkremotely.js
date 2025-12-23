/**
 * We Work Remotely Job Scraper
 * 
 * Scrapes job listings from We Work Remotely
 * https://weworkremotely.com
 */

import { log } from 'apify';
import * as cheerio from 'cheerio';

const WWR_BASE_URL = 'https://weworkremotely.com';
const WWR_CATEGORIES = [
    '/remote-jobs/search?term=',
];

/**
 * Scrape jobs from We Work Remotely
 * @param {Object} options - Scraper options
 * @param {string[]} options.roles - Job roles to search
 * @param {string} options.location - Location filter
 * @param {number} options.maxResults - Max results to return
 * @param {number} options.maxDaysOld - Max age of jobs in days
 * @returns {Promise<Array>} - Array of job listings
 */
export async function scrapeWeWorkRemotely({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];

    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `${WWR_BASE_URL}/remote-jobs/search?term=${encodeURIComponent(role)}`;

            log.debug(`WeWorkRemotely: Searching for "${role}"...`);

            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                },
            });

            if (!response.ok) {
                log.warning(`WeWorkRemotely: HTTP ${response.status} for role "${role}"`);
                continue;
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            // Parse job listings
            $('li.feature, li:not(.ad)').each((index, element) => {
                if (jobs.length >= maxResults) return false;

                const $el = $(element);

                // Find the job link
                const $link = $el.find('a').first();
                const href = $link.attr('href');

                if (!href || !href.includes('/remote-jobs/')) return;

                // Extract job details
                const $title = $el.find('.title');
                const $company = $el.find('.company');
                const $region = $el.find('.region');

                const jobTitle = $title.text().trim();
                const company = $company.text().trim();
                const jobLocation = $region.text().trim() || 'Remote';

                // Skip if no title or company
                if (!jobTitle || !company) return;

                // Skip if location doesn't match (WeWorkRemotely is primarily remote)
                if (location && location.toLowerCase() !== 'remote') {
                    if (!jobLocation.toLowerCase().includes(location.toLowerCase())) {
                        return;
                    }
                }

                const jobUrl = href.startsWith('http') ? href : `${WWR_BASE_URL}${href}`;

                jobs.push({
                    jobTitle,
                    company,
                    location: jobLocation,
                    source: 'WeWorkRemotely',
                    postedDate: new Date().toISOString(),
                    jobUrl,
                    applyLink: jobUrl,
                });
            });

            // Small delay between searches
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        log.info(`WeWorkRemotely: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`WeWorkRemotely scraper error: ${error.message}`);
        throw error;
    }

    return jobs;
}
