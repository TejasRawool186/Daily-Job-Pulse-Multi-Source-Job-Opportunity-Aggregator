/**
 * Monster Job Scraper
 */

import { log } from 'apify';
import * as cheerio from 'cheerio';

export async function scrapeMonster({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];

    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `https://www.monster.com/jobs/search?q=${encodeURIComponent(role)}&where=${encodeURIComponent(location || 'Remote')}&page=1&so=m.h.sh`;

            log.debug(`Monster: Searching for "${role}"...`);

            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html',
                },
            });

            if (!response.ok) continue;

            const html = await response.text();
            const $ = cheerio.load(html);

            $('[data-testid="svx-job-card"], .job-cardstyle__JobCardComponent').each((i, el) => {
                if (jobs.length >= maxResults) return false;

                const $el = $(el);
                const jobTitle = $el.find('[data-testid="jobTitle"], .job-cardstyle__JobTitle').text().trim();
                const company = $el.find('[data-testid="company"], .job-cardstyle__CompanyName').text().trim();
                const jobLocation = $el.find('[data-testid="jobLocation"], .job-cardstyle__Location').text().trim();
                const link = $el.find('a[href*="/job/"]').attr('href');

                if (jobTitle && company) {
                    jobs.push({
                        jobTitle,
                        company,
                        location: jobLocation || location || 'Not specified',
                        source: 'Monster',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://www.monster.com${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://www.monster.com${link}`,
                    });
                }
            });

            await new Promise(r => setTimeout(r, 800));
        }
        log.info(`Monster: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Monster scraper error: ${error.message}`);
    }

    return jobs;
}
