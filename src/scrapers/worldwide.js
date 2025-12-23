/**
 * Tech & Remote Job Platform Scrapers
 * SimplyHired, ZipRecruiter, Dice, FlexJobs, StackOverflow, GitHub, CareerBuilder
 * AngelList, Toptal, Turing, Arc
 */

import { log } from 'apify';
import * as cheerio from 'cheerio';

// ============== SIMPLYHIRED ==============
export async function scrapeSimplyHired({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `https://www.simplyhired.com/search?q=${encodeURIComponent(role)}&l=${encodeURIComponent(location || 'Remote')}`;

            const response = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });

            if (!response.ok) continue;
            const html = await response.text();
            const $ = cheerio.load(html);

            $('[data-testid="searchSerpJob"], .SerpJob').each((i, el) => {
                if (jobs.length >= maxResults) return false;
                const $el = $(el);
                const jobTitle = $el.find('[data-testid="searchSerpJobTitle"], .jobTitle').text().trim();
                const company = $el.find('[data-testid="companyName"], .companyName').text().trim();
                const jobLocation = $el.find('[data-testid="searchSerpJobLocation"], .location').text().trim();
                const link = $el.find('a').attr('href');

                if (jobTitle && company) {
                    jobs.push({
                        jobTitle, company,
                        location: jobLocation || location || 'Not specified',
                        source: 'SimplyHired',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://www.simplyhired.com${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://www.simplyhired.com${link}`,
                    });
                }
            });
            await new Promise(r => setTimeout(r, 600));
        }
        log.info(`SimplyHired: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`SimplyHired scraper error: ${error.message}`);
    }
    return jobs;
}

// ============== ZIPRECRUITER ==============
export async function scrapeZipRecruiter({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `https://www.ziprecruiter.com/jobs-search?search=${encodeURIComponent(role)}&location=${encodeURIComponent(location || 'Remote')}&days=${maxDaysOld}`;

            const response = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });

            if (!response.ok) continue;
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.job_result, article.job-listing').each((i, el) => {
                if (jobs.length >= maxResults) return false;
                const $el = $(el);
                const jobTitle = $el.find('.job_title, h2').text().trim();
                const company = $el.find('.hiring_company, .company').text().trim();
                const jobLocation = $el.find('.location').text().trim();
                const link = $el.find('a.job_link, a[href*="/jobs/"]').attr('href');

                if (jobTitle && company) {
                    jobs.push({
                        jobTitle, company,
                        location: jobLocation || location || 'Not specified',
                        source: 'ZipRecruiter',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://www.ziprecruiter.com${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://www.ziprecruiter.com${link}`,
                    });
                }
            });
            await new Promise(r => setTimeout(r, 600));
        }
        log.info(`ZipRecruiter: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`ZipRecruiter scraper error: ${error.message}`);
    }
    return jobs;
}

// ============== DICE (Tech Jobs) ==============
export async function scrapeDice({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `https://www.dice.com/jobs?q=${encodeURIComponent(role)}&location=${encodeURIComponent(location || 'Remote')}&countryCode=US&radius=30&radiusUnit=mi&page=1&pageSize=20&language=en`;

            const response = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });

            if (!response.ok) continue;
            const html = await response.text();
            const $ = cheerio.load(html);

            $('[data-cy="search-result-job-card"], .search-card').each((i, el) => {
                if (jobs.length >= maxResults) return false;
                const $el = $(el);
                const jobTitle = $el.find('[data-cy="card-title"], .card-title').text().trim();
                const company = $el.find('[data-cy="search-result-company-name"], .company-name').text().trim();
                const jobLocation = $el.find('[data-cy="search-result-location"], .location').text().trim();
                const link = $el.find('a[href*="/job-detail/"]').attr('href');

                if (jobTitle && company) {
                    jobs.push({
                        jobTitle, company,
                        location: jobLocation || location || 'Not specified',
                        source: 'Dice',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://www.dice.com${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://www.dice.com${link}`,
                    });
                }
            });
            await new Promise(r => setTimeout(r, 600));
        }
        log.info(`Dice: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Dice scraper error: ${error.message}`);
    }
    return jobs;
}

// ============== FLEXJOBS ==============
export async function scrapeFlexJobs({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `https://www.flexjobs.com/search?search=${encodeURIComponent(role)}&location=${encodeURIComponent(location || '')}`;

            const response = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });

            if (!response.ok) continue;
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.job-tile, .job-card').each((i, el) => {
                if (jobs.length >= maxResults) return false;
                const $el = $(el);
                const jobTitle = $el.find('.job-title, h5').text().trim();
                const company = $el.find('.company-name').text().trim();
                const jobLocation = $el.find('.location, .job-location').text().trim();
                const link = $el.find('a[href*="/jobs/"]').attr('href');

                if (jobTitle) {
                    jobs.push({
                        jobTitle,
                        company: company || 'Flexible Employer',
                        location: jobLocation || 'Remote',
                        source: 'FlexJobs',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://www.flexjobs.com${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://www.flexjobs.com${link}`,
                    });
                }
            });
            await new Promise(r => setTimeout(r, 600));
        }
        log.info(`FlexJobs: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`FlexJobs scraper error: ${error.message}`);
    }
    return jobs;
}

// ============== STACKOVERFLOW JOBS ==============
export async function scrapeStackOverflow({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        // StackOverflow Jobs redirects to a different platform now
        const searchUrl = `https://stackoverflow.jobs/search?q=${encodeURIComponent(roles[0] || 'developer')}`;

        const response = await fetch(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        });

        if (!response.ok) {
            log.info('StackOverflow: Jobs section not available');
            return jobs;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        $('.job-card, .listResults .job').each((i, el) => {
            if (jobs.length >= maxResults) return false;
            const $el = $(el);
            const jobTitle = $el.find('.job-title, h2').text().trim();
            const company = $el.find('.company-name, .employer').text().trim();
            const jobLocation = $el.find('.location').text().trim();
            const link = $el.find('a').attr('href');

            if (jobTitle) {
                jobs.push({
                    jobTitle,
                    company: company || 'Tech Company',
                    location: jobLocation || location || 'Remote',
                    source: 'StackOverflow',
                    postedDate: new Date().toISOString(),
                    jobUrl: link?.startsWith('http') ? link : `https://stackoverflow.jobs${link}`,
                    applyLink: link?.startsWith('http') ? link : `https://stackoverflow.jobs${link}`,
                });
            }
        });
        log.info(`StackOverflow: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`StackOverflow scraper error: ${error.message}`);
    }
    return jobs;
}

// ============== GITHUB JOBS ==============
export async function scrapeGitHub({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        // GitHub Jobs was deprecated, redirecting to similar platforms
        const searchUrl = `https://jobs.github.com/positions?description=${encodeURIComponent(roles[0] || 'developer')}&location=${encodeURIComponent(location || '')}`;

        const response = await fetch(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        });

        if (!response.ok) {
            log.info('GitHub Jobs: Service redirected or unavailable');
            return jobs;
        }

        log.info(`GitHub: Found ${jobs.length} jobs`);
    } catch (error) {
        log.debug(`GitHub scraper: ${error.message}`);
    }
    return jobs;
}

// ============== CAREERBUILDER ==============
export async function scrapeCareerBuilder({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `https://www.careerbuilder.com/jobs?keywords=${encodeURIComponent(role)}&location=${encodeURIComponent(location || 'Remote')}`;

            const response = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });

            if (!response.ok) continue;
            const html = await response.text();
            const $ = cheerio.load(html);

            $('[data-job-id], .job-listing-item').each((i, el) => {
                if (jobs.length >= maxResults) return false;
                const $el = $(el);
                const jobTitle = $el.find('.job-title, h2').text().trim();
                const company = $el.find('.company-name, .employer').text().trim();
                const jobLocation = $el.find('.location, .job-location').text().trim();
                const link = $el.find('a[href*="/job/"]').attr('href');

                if (jobTitle && company) {
                    jobs.push({
                        jobTitle, company,
                        location: jobLocation || location || 'Not specified',
                        source: 'CareerBuilder',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://www.careerbuilder.com${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://www.careerbuilder.com${link}`,
                    });
                }
            });
            await new Promise(r => setTimeout(r, 600));
        }
        log.info(`CareerBuilder: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`CareerBuilder scraper error: ${error.message}`);
    }
    return jobs;
}

// ============== ANGELLIST ==============
export async function scrapeAngelList({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
            const searchUrl = `https://angel.co/role/${roleSlug}`;

            const response = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });

            if (!response.ok) continue;
            const html = await response.text();
            const $ = cheerio.load(html);

            $('[class*="jobListing"], .job-card').each((i, el) => {
                if (jobs.length >= maxResults) return false;
                const $el = $(el);
                const jobTitle = $el.find('[class*="title"], h3').text().trim();
                const company = $el.find('[class*="company"], .startup-name').text().trim();
                const jobLocation = $el.find('[class*="location"]').text().trim();
                const link = $el.find('a[href*="/jobs/"]').attr('href');

                if (jobTitle) {
                    jobs.push({
                        jobTitle,
                        company: company || 'Startup',
                        location: jobLocation || location || 'Remote',
                        source: 'AngelList',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://angel.co${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://angel.co${link}`,
                    });
                }
            });
            await new Promise(r => setTimeout(r, 600));
        }
        log.info(`AngelList: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`AngelList scraper error: ${error.message}`);
    }
    return jobs;
}

// ============== TOPTAL ==============
export async function scrapeToptal({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        const searchUrl = `https://www.toptal.com/careers`;

        const response = await fetch(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        });

        if (!response.ok) {
            log.info('Toptal: Careers page not accessible');
            return jobs;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        $('.job-listing, .position-card, article').each((i, el) => {
            if (jobs.length >= maxResults) return false;
            const $el = $(el);
            const jobTitle = $el.find('h3, h4, .title').text().trim();
            const link = $el.find('a').attr('href');

            // Filter by role
            const matchesRole = roles.some(r => jobTitle.toLowerCase().includes(r.toLowerCase()));

            if (jobTitle && matchesRole) {
                jobs.push({
                    jobTitle,
                    company: 'Toptal',
                    location: 'Remote',
                    source: 'Toptal',
                    postedDate: new Date().toISOString(),
                    jobUrl: link?.startsWith('http') ? link : `https://www.toptal.com${link}`,
                    applyLink: link?.startsWith('http') ? link : `https://www.toptal.com${link}`,
                });
            }
        });
        log.info(`Toptal: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Toptal scraper error: ${error.message}`);
    }
    return jobs;
}

// ============== TURING ==============
export async function scrapeTuring({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
            const searchUrl = `https://www.turing.com/remote-developer-jobs/${roleSlug}`;

            const response = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });

            if (!response.ok) continue;
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.job-card, [class*="JobCard"]').each((i, el) => {
                if (jobs.length >= maxResults) return false;
                const $el = $(el);
                const jobTitle = $el.find('.job-title, h3, h4').first().text().trim();
                const company = $el.find('.company-name').text().trim();
                const link = $el.find('a').attr('href');

                if (jobTitle) {
                    jobs.push({
                        jobTitle,
                        company: company || 'Turing Client',
                        location: 'Remote',
                        source: 'Turing',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://www.turing.com${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://www.turing.com${link}`,
                    });
                }
            });
            await new Promise(r => setTimeout(r, 500));
        }
        log.info(`Turing: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Turing scraper error: ${error.message}`);
    }
    return jobs;
}

// ============== ARC.DEV ==============
export async function scrapeArc({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `https://arc.dev/remote-jobs?search=${encodeURIComponent(role)}`;

            const response = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });

            if (!response.ok) continue;
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.job-card, [class*="JobCard"], article').each((i, el) => {
                if (jobs.length >= maxResults) return false;
                const $el = $(el);
                const jobTitle = $el.find('.job-title, h3, h4').first().text().trim();
                const company = $el.find('.company-name, .company').text().trim();
                const jobLocation = $el.find('.location').text().trim();
                const link = $el.find('a').attr('href');

                if (jobTitle) {
                    jobs.push({
                        jobTitle,
                        company: company || 'Arc Client',
                        location: jobLocation || 'Remote',
                        source: 'Arc',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://arc.dev${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://arc.dev${link}`,
                    });
                }
            });
            await new Promise(r => setTimeout(r, 500));
        }
        log.info(`Arc: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Arc scraper error: ${error.message}`);
    }
    return jobs;
}
