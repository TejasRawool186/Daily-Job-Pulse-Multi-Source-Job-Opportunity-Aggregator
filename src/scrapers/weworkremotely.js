/**
 * We Work Remotely Job Scraper
 * 
 * Scrapes remote job listings from weworkremotely.com.
 */

import { log } from 'apify';
import { httpGetHtml, sleep, getProxyUrl } from '../utils/http.js';

const WWR_BASE_URL = 'https://weworkremotely.com';

/**
 * Scrape jobs from We Work Remotely
 */
export async function scrapeWeWorkRemotely({ roles, location, maxResults, maxDaysOld, proxyConfig }) {
    const jobs = [];
    const proxyUrl = await getProxyUrl(proxyConfig);

    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `${WWR_BASE_URL}/remote-jobs/search?term=${encodeURIComponent(role)}`;
            log.debug(`WeWorkRemotely: Searching for "${role}"...`);

            try {
                const { $ } = await httpGetHtml(searchUrl, {
                    proxyUrl,
                    sourceName: 'WeWorkRemotely',
                });

                // Parse job listings
                $('li.feature, section.jobs li:not(.ad)').each((index, element) => {
                    if (jobs.length >= maxResults) return false;

                    const $el = $(element);
                    const $link = $el.find('a').first();
                    const href = $link.attr('href');

                    if (!href || !href.includes('/remote-jobs/')) return;

                    const jobTitle = $el.find('.title').text().trim();
                    const company = $el.find('.company').text().trim();
                    const jobLocation = $el.find('.region').text().trim() || 'Remote';

                    if (!jobTitle || !company) return;

                    // Location filter (WeWorkRemotely is primarily remote)
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
            } catch (error) {
                log.warning(`WeWorkRemotely: Failed for role "${role}": ${error.message}`);
            }

            if (roles.indexOf(role) < roles.length - 1) {
                await sleep(500);
            }
        }

        log.info(`WeWorkRemotely: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`WeWorkRemotely: ${error.message}`);
        throw error;
    }

    return jobs;
}
