/**
 * Naukri.com Job Scraper (India's #1 Job Portal)
 */

import { log } from 'apify';
import { httpGetHtml, sleep, getProxyUrl } from '../utils/http.js';

const NAUKRI_BASE = 'https://www.naukri.com';

export async function scrapeNaukri({ roles, location, maxResults, maxDaysOld, proxyConfig }) {
    const jobs = [];
    const proxyUrl = await getProxyUrl(proxyConfig);

    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
            const locationSlug = (location || 'india').toLowerCase().replace(/\s+/g, '-');
            const searchUrl = `${NAUKRI_BASE}/${roleSlug}-jobs-in-${locationSlug}?jobAge=${maxDaysOld}`;

            log.debug(`Naukri: Searching for "${role}" in "${location}"...`);

            try {
                const { $ } = await httpGetHtml(searchUrl, {
                    proxyUrl,
                    sourceName: 'Naukri',
                });

                $('article.jobTuple, div.srp-jobtuple-wrapper, div.cust-job-tuple, [data-job-id]').each((i, el) => {
                    if (jobs.length >= maxResults) return false;

                    const $el = $(el);
                    const jobTitle = $el.find('a.title, .title, .job-title, .designation').first().text().trim();
                    const company = $el.find('.comp-name, .company-name, a.subTitle, .comp-dtls-wrap a').first().text().trim();
                    const jobLocation = $el.find('.loc, .location, .locWdth, .loc-wrap').first().text().trim();
                    const link = $el.find('a.title, a[href*="/job-listings"], a[href*="/job/"]').attr('href');

                    if (jobTitle && company) {
                        jobs.push({
                            jobTitle,
                            company,
                            location: jobLocation || location || 'India',
                            source: 'Naukri',
                            postedDate: new Date().toISOString(),
                            jobUrl: link?.startsWith('http') ? link : `${NAUKRI_BASE}${link || ''}`,
                            applyLink: link?.startsWith('http') ? link : `${NAUKRI_BASE}${link || ''}`,
                        });
                    }
                });
            } catch (error) {
                log.warning(`Naukri: Failed for role "${role}": ${error.message}`);
            }

            if (roles.indexOf(role) < roles.length - 1) {
                await sleep(800);
            }
        }
        log.info(`Naukri: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Naukri: ${error.message}`);
        throw error;
    }

    return jobs;
}
