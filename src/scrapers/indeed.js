/**
 * Indeed Job Scraper
 * 
 * Scrapes job listings from Indeed using HTML parsing.
 * Includes multiple selector fallbacks for resilience.
 */

import { log } from 'apify';
import { httpGetHtml, sleep, getProxyUrl } from '../utils/http.js';

const INDEED_BASE_URL = 'https://www.indeed.com';

/**
 * Scrape jobs from Indeed
 */
export async function scrapeIndeed({ roles, location, maxResults, maxDaysOld, proxyConfig }) {
    const jobs = [];
    const proxyUrl = await getProxyUrl(proxyConfig);

    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const params = new URLSearchParams({
                q: role,
                l: location || 'Remote',
                fromage: String(maxDaysOld || 7),
                sort: 'date',
            });

            const searchUrl = `${INDEED_BASE_URL}/jobs?${params.toString()}`;
            log.debug(`Indeed: Searching for "${role}" in "${location || 'Remote'}"...`);

            try {
                const { $ } = await httpGetHtml(searchUrl, {
                    proxyUrl,
                    sourceName: 'Indeed',
                });

                // Try multiple selector strategies for resilience
                const jobCards = $('div.job_seen_beacon, div.jobsearch-ResultsList > div, [data-testid="slider_item"]');

                jobCards.each((index, element) => {
                    if (jobs.length >= maxResults) return false;

                    const $el = $(element);

                    // Extract job title (multiple fallback selectors)
                    const $titleLink = $el.find('h2.jobTitle a, a[data-jk], [data-testid="jobTitle"]').first();
                    const jobTitle = $titleLink.find('span[title]').attr('title') ||
                        $titleLink.find('span').text().trim() ||
                        $titleLink.text().trim();

                    // Extract company
                    const company = $el.find('span[data-testid="company-name"], .companyName, [data-testid="company-name"]').text().trim();

                    // Extract location
                    const jobLocation = $el.find('div[data-testid="text-location"], .companyLocation, [data-testid="text-location"]').text().trim();

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
            } catch (error) {
                log.warning(`Indeed: Failed for role "${role}": ${error.message}`);
            }

            // Rate limiting between role searches
            if (roles.indexOf(role) < roles.length - 1) {
                await sleep(1000);
            }
        }

        log.info(`Indeed: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Indeed: ${error.message}`);
        throw error;
    }

    return jobs;
}
