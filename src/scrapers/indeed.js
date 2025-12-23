/**
 * Indeed Job Scraper
 * 
 * Scrapes job listings from Indeed
 * https://www.indeed.com
 */

import { log } from 'apify';
import * as cheerio from 'cheerio';

const INDEED_BASE_URL = 'https://www.indeed.com';

/**
 * Scrape jobs from Indeed
 * @param {Object} options - Scraper options
 * @param {string[]} options.roles - Job roles to search
 * @param {string} options.location - Location filter
 * @param {number} options.maxResults - Max results to return
 * @param {number} options.maxDaysOld - Max age of jobs in days
 * @returns {Promise<Array>} - Array of job listings
 */
export async function scrapeIndeed({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];

    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            // Build search URL
            const params = new URLSearchParams({
                q: role,
                l: location || 'Remote',
                fromage: maxDaysOld || 7, // Days filter
                sort: 'date',
            });

            const searchUrl = `${INDEED_BASE_URL}/jobs?${params.toString()}`;

            log.debug(`Indeed: Searching for "${role}" in "${location || 'Remote'}"...`);

            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                },
            });

            if (!response.ok) {
                log.warning(`Indeed: HTTP ${response.status} for role "${role}"`);
                continue;
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            // Parse job cards
            $('div.job_seen_beacon, div.jobsearch-ResultsList > div').each((index, element) => {
                if (jobs.length >= maxResults) return false;

                const $el = $(element);

                // Extract job title
                const $titleLink = $el.find('h2.jobTitle a, a[data-jk]').first();
                const jobTitle = $titleLink.find('span[title]').attr('title') ||
                    $titleLink.text().trim();

                // Extract company
                const company = $el.find('span[data-testid="company-name"], .companyName').text().trim();

                // Extract location
                const jobLocation = $el.find('div[data-testid="text-location"], .companyLocation').text().trim();

                // Extract job ID for URL
                const jobKey = $titleLink.attr('data-jk') ||
                    $el.find('a[data-jk]').attr('data-jk');

                // Skip if missing required fields
                if (!jobTitle || !company) return;

                const jobUrl = jobKey
                    ? `${INDEED_BASE_URL}/viewjob?jk=${jobKey}`
                    : `${INDEED_BASE_URL}/jobs?q=${encodeURIComponent(jobTitle)}`;

                jobs.push({
                    jobTitle,
                    company,
                    location: jobLocation || location || 'Not specified',
                    source: 'Indeed',
                    postedDate: new Date().toISOString(),
                    jobUrl,
                    applyLink: jobUrl,
                });
            });

            // Small delay between searches
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        log.info(`Indeed: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Indeed scraper error: ${error.message}`);
        throw error;
    }

    return jobs;
}
