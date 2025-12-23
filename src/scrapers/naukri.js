/**
 * Naukri.com Job Scraper (India's #1 Job Portal)
 */

import { log } from 'apify';
import * as cheerio from 'cheerio';

const NAUKRI_BASE = 'https://www.naukri.com';

export async function scrapeNaukri({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];

    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
            const locationSlug = (location || 'india').toLowerCase().replace(/\s+/g, '-');
            const searchUrl = `${NAUKRI_BASE}/${roleSlug}-jobs-in-${locationSlug}?jobAge=${maxDaysOld}`;

            log.debug(`Naukri: Searching for "${role}" in "${location}"...`);

            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
            });

            if (!response.ok) {
                log.warning(`Naukri: HTTP ${response.status}`);
                continue;
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            $('article.jobTuple, div.srp-jobtuple-wrapper, div.cust-job-tuple').each((i, el) => {
                if (jobs.length >= maxResults) return false;

                const $el = $(el);
                const jobTitle = $el.find('a.title, .title, .job-title').first().text().trim();
                const company = $el.find('.comp-name, .company-name, a.subTitle').first().text().trim();
                const jobLocation = $el.find('.loc, .location, .locWdth').first().text().trim();
                const link = $el.find('a.title, a[href*="/job-listings"]').attr('href');

                if (jobTitle && company) {
                    jobs.push({
                        jobTitle,
                        company,
                        location: jobLocation || location || 'India',
                        source: 'Naukri',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `${NAUKRI_BASE}${link}`,
                        applyLink: link?.startsWith('http') ? link : `${NAUKRI_BASE}${link}`,
                    });
                }
            });

            await new Promise(r => setTimeout(r, 800));
        }
        log.info(`Naukri: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Naukri scraper error: ${error.message}`);
    }

    return jobs;
}
