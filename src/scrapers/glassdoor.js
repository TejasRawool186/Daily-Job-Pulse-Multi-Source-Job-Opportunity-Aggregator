/**
 * Glassdoor Job Scraper
 */

import { log } from 'apify';
import * as cheerio from 'cheerio';

const GLASSDOOR_BASE = 'https://www.glassdoor.com/Job';

export async function scrapeGlassdoor({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];

    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
            const searchUrl = `${GLASSDOOR_BASE}/${roleSlug}-jobs-SRCH_KO0,${roleSlug.length}.htm`;

            log.debug(`Glassdoor: Searching for "${role}"...`);

            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html',
                },
            });

            if (!response.ok) continue;

            const html = await response.text();
            const $ = cheerio.load(html);

            $('[data-test="jobListing"], .JobCard_jobCardContainer__arQlW').each((i, el) => {
                if (jobs.length >= maxResults) return false;

                const $el = $(el);
                const jobTitle = $el.find('[data-test="job-title"], .JobCard_jobTitle__GLyJ1').text().trim();
                const company = $el.find('[data-test="employer-name"], .EmployerProfile_employerName__twvMO').text().trim();
                const jobLocation = $el.find('[data-test="emp-location"], .JobCard_location__Ds1fM').text().trim();
                const link = $el.find('a').attr('href');

                if (jobTitle && company) {
                    jobs.push({
                        jobTitle,
                        company,
                        location: jobLocation || location || 'Not specified',
                        source: 'Glassdoor',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://www.glassdoor.com${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://www.glassdoor.com${link}`,
                    });
                }
            });

            await new Promise(r => setTimeout(r, 1000));
        }
        log.info(`Glassdoor: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Glassdoor scraper error: ${error.message}`);
    }

    return jobs;
}
