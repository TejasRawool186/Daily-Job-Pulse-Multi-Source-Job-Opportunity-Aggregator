/**
 * Glassdoor Job Scraper
 */

import { log } from 'apify';
import { httpGetHtml, sleep, getProxyUrl } from '../utils/http.js';

const GLASSDOOR_BASE = 'https://www.glassdoor.com';

export async function scrapeGlassdoor({ roles, location, maxResults, maxDaysOld, proxyConfig }) {
    const jobs = [];
    const proxyUrl = await getProxyUrl(proxyConfig);

    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
            const searchUrl = `${GLASSDOOR_BASE}/Job/${roleSlug}-jobs-SRCH_KO0,${roleSlug.length}.htm`;

            log.debug(`Glassdoor: Searching for "${role}"...`);

            try {
                const { $ } = await httpGetHtml(searchUrl, {
                    proxyUrl,
                    sourceName: 'Glassdoor',
                });

                $('[data-test="jobListing"], .JobCard_jobCardContainer__arQlW, [data-brandviews="MODULE:n=jobs-search-card"]').each((i, el) => {
                    if (jobs.length >= maxResults) return false;

                    const $el = $(el);
                    const jobTitle = $el.find('[data-test="job-title"], .JobCard_jobTitle__GLyJ1, .job-title').text().trim();
                    const company = $el.find('[data-test="employer-name"], .EmployerProfile_employerName__twvMO, .employer-name').text().trim();
                    const jobLocation = $el.find('[data-test="emp-location"], .JobCard_location__Ds1fM, .location').text().trim();
                    const link = $el.find('a[href*="/job-listing/"], a[href*="/partner/"]').attr('href') || $el.find('a').attr('href');

                    if (jobTitle && company) {
                        jobs.push({
                            jobTitle,
                            company,
                            location: jobLocation || location || 'Not specified',
                            source: 'Glassdoor',
                            postedDate: new Date().toISOString(),
                            jobUrl: link?.startsWith('http') ? link : `${GLASSDOOR_BASE}${link || ''}`,
                            applyLink: link?.startsWith('http') ? link : `${GLASSDOOR_BASE}${link || ''}`,
                        });
                    }
                });
            } catch (error) {
                log.warning(`Glassdoor: Failed for role "${role}": ${error.message}`);
            }

            if (roles.indexOf(role) < roles.length - 1) {
                await sleep(1000);
            }
        }
        log.info(`Glassdoor: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Glassdoor: ${error.message}`);
        throw error;
    }

    return jobs;
}
