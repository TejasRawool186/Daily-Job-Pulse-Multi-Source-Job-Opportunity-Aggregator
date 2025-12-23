/**
 * LinkedIn Job Scraper
 * Scrapes jobs from LinkedIn Jobs
 */

import { log } from 'apify';
import * as cheerio from 'cheerio';

const LINKEDIN_BASE = 'https://www.linkedin.com/jobs/search';

export async function scrapeLinkedIn({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];

    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const params = new URLSearchParams({
                keywords: role,
                location: location || 'India',
                f_TPR: `r${maxDaysOld * 86400}`, // Time filter in seconds
                position: 1,
                pageNum: 0,
            });

            const searchUrl = `${LINKEDIN_BASE}?${params.toString()}`;
            log.debug(`LinkedIn: Searching for "${role}"...`);

            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                },
            });

            if (!response.ok) {
                log.warning(`LinkedIn: HTTP ${response.status}`);
                continue;
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            $('div.base-card, li.jobs-search-results__list-item').each((i, el) => {
                if (jobs.length >= maxResults) return false;

                const $el = $(el);
                const jobTitle = $el.find('h3.base-search-card__title, .job-card-list__title').text().trim();
                const company = $el.find('h4.base-search-card__subtitle, .job-card-container__company-name').text().trim();
                const jobLocation = $el.find('.job-search-card__location, .job-card-container__metadata-item').first().text().trim();
                const link = $el.find('a.base-card__full-link, a.job-card-list__title').attr('href');

                if (jobTitle && company && link) {
                    jobs.push({
                        jobTitle,
                        company,
                        location: jobLocation || location || 'Not specified',
                        source: 'LinkedIn',
                        postedDate: new Date().toISOString(),
                        jobUrl: link,
                        applyLink: link,
                    });
                }
            });

            await delay(1000);
        }
        log.info(`LinkedIn: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`LinkedIn scraper error: ${error.message}`);
    }

    return jobs;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
