/**
 * Wellfound (AngelList Talent) Job Scraper
 * 
 * Scrapes startup job listings from Wellfound.
 */

import { log } from 'apify';
import { httpGetHtml, sleep, getProxyUrl } from '../utils/http.js';

const WELLFOUND_BASE_URL = 'https://wellfound.com';

/**
 * Scrape jobs from Wellfound
 */
export async function scrapeWellfound({ roles, location, maxResults, maxDaysOld, proxyConfig }) {
    const jobs = [];
    const proxyUrl = await getProxyUrl(proxyConfig);

    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
            const locationParam = location?.toLowerCase() === 'remote' ? 'remote=true' : '';
            const searchUrl = `${WELLFOUND_BASE_URL}/role/${roleSlug}?${locationParam}`;

            log.debug(`Wellfound: Searching for "${role}"...`);

            try {
                const { $ } = await httpGetHtml(searchUrl, {
                    proxyUrl,
                    sourceName: 'Wellfound',
                });

                // Parse job listings from the role page
                $('div[class*="job-listing"], div[class*="styles_jobListing"], [data-test="startup-jobs"] > div').each((index, element) => {
                    if (jobs.length >= maxResults) return false;

                    const $el = $(element);
                    const $titleLink = $el.find('a[href*="/jobs/"]').first();
                    const jobTitle = $titleLink.text().trim() ||
                        $el.find('h2, h3, h4').first().text().trim();

                    const company = $el.find('[class*="company"], [class*="startup"]').first().text().trim() ||
                        $el.find('a[href*="/company/"]').text().trim();

                    const jobLocation = $el.find('[class*="location"]').text().trim() ||
                        (location || 'Not specified');

                    const href = $titleLink.attr('href') || '';

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

                // If role page yielded nothing, try search fallback
                if (jobs.length === 0) {
                    await scrapeWellfoundSearch(role, location, maxResults, jobs, proxyUrl);
                }
            } catch (error) {
                log.warning(`Wellfound: Failed for role "${role}": ${error.message}`);
                // Try fallback search
                await scrapeWellfoundSearch(role, location, maxResults, jobs, proxyUrl);
            }

            if (roles.indexOf(role) < roles.length - 1) {
                await sleep(800);
            }
        }

        log.info(`Wellfound: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Wellfound: ${error.message}`);
        throw error;
    }

    return jobs;
}

/**
 * Fallback: search using Wellfound's search page
 */
async function scrapeWellfoundSearch(role, location, maxResults, jobs, proxyUrl) {
    try {
        const searchUrl = `${WELLFOUND_BASE_URL}/jobs?q=${encodeURIComponent(role)}`;

        const { $ } = await httpGetHtml(searchUrl, {
            proxyUrl,
            sourceName: 'Wellfound (search)',
        });

        $('a[href*="/jobs/"]').each((index, element) => {
            if (jobs.length >= maxResults) return false;

            const $el = $(element);
            const href = $el.attr('href');
            const jobTitle = $el.text().trim();

            if (!jobTitle || jobTitle.length < 3) return;

            const jobUrl = href.startsWith('http') ? href : `${WELLFOUND_BASE_URL}${href}`;

            // Avoid duplicates within this run
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
        log.debug(`Wellfound search fallback: ${error.message}`);
    }
}
