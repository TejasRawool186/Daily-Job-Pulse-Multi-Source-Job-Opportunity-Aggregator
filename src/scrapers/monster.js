/**
 * Monster Job Scraper
 */

import { log } from 'apify';
import { httpGetHtml, sleep, getProxyUrl } from '../utils/http.js';

export async function scrapeMonster({ roles, location, maxResults, maxDaysOld, proxyConfig }) {
    const jobs = [];
    const proxyUrl = await getProxyUrl(proxyConfig);

    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `https://www.monster.com/jobs/search?q=${encodeURIComponent(role)}&where=${encodeURIComponent(location || 'Remote')}&page=1&so=m.h.sh`;

            log.debug(`Monster: Searching for "${role}"...`);

            try {
                const { $ } = await httpGetHtml(searchUrl, {
                    proxyUrl,
                    sourceName: 'Monster',
                });

                $('[data-testid="svx-job-card"], .job-cardstyle__JobCardComponent, [data-testid="svx_jobCard"]').each((i, el) => {
                    if (jobs.length >= maxResults) return false;

                    const $el = $(el);
                    const jobTitle = $el.find('[data-testid="jobTitle"], .job-cardstyle__JobTitle, .title').text().trim();
                    const company = $el.find('[data-testid="company"], .job-cardstyle__CompanyName, .company').text().trim();
                    const jobLocation = $el.find('[data-testid="jobLocation"], .job-cardstyle__Location, .location').text().trim();
                    const link = $el.find('a[href*="/job/"], a[href*="/job-openings/"]').attr('href');

                    if (jobTitle && company) {
                        jobs.push({
                            jobTitle,
                            company,
                            location: jobLocation || location || 'Not specified',
                            source: 'Monster',
                            postedDate: new Date().toISOString(),
                            jobUrl: link?.startsWith('http') ? link : `https://www.monster.com${link || ''}`,
                            applyLink: link?.startsWith('http') ? link : `https://www.monster.com${link || ''}`,
                        });
                    }
                });
            } catch (error) {
                log.warning(`Monster: Failed for role "${role}": ${error.message}`);
            }

            if (roles.indexOf(role) < roles.length - 1) {
                await sleep(800);
            }
        }
        log.info(`Monster: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Monster: ${error.message}`);
        throw error;
    }

    return jobs;
}
