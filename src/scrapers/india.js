/**
 * India Job Portals Scrapers
 * Shine, TimesJobs, Foundit (Monster India), Instahyre, Hirist, CutShort
 */

import { log } from 'apify';
import * as cheerio from 'cheerio';

// ============== SHINE.COM ==============
export async function scrapeShine({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `https://www.shine.com/job-search/${encodeURIComponent(role).replace(/%20/g, '-')}-jobs-in-${(location || 'india').toLowerCase().replace(/\s+/g, '-')}`;

            const response = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });

            if (!response.ok) continue;
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.job_container, .jobCard').each((i, el) => {
                if (jobs.length >= maxResults) return false;
                const $el = $(el);
                const jobTitle = $el.find('.job_title, .jobTitle').text().trim();
                const company = $el.find('.company_name, .companyName').text().trim();
                const jobLocation = $el.find('.loc, .location').text().trim();
                const link = $el.find('a[href*="/job/"]').attr('href');

                if (jobTitle && company) {
                    jobs.push({
                        jobTitle, company,
                        location: jobLocation || location || 'India',
                        source: 'Shine',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://www.shine.com${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://www.shine.com${link}`,
                    });
                }
            });
            await new Promise(r => setTimeout(r, 500));
        }
        log.info(`Shine: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Shine scraper error: ${error.message}`);
    }
    return jobs;
}

// ============== TIMESJOBS ==============
export async function scrapeTimesJobs({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `https://www.timesjobs.com/candidate/job-search.html?searchType=personal498&from=submit&txtKeywords=${encodeURIComponent(role)}&txtLocation=${encodeURIComponent(location || 'India')}`;

            const response = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });

            if (!response.ok) continue;
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.job-bx, .srp-jobtuple').each((i, el) => {
                if (jobs.length >= maxResults) return false;
                const $el = $(el);
                const jobTitle = $el.find('h2 a, .job-title').text().trim();
                const company = $el.find('.joblist-comp-name, .company-name').text().trim();
                const jobLocation = $el.find('.location-text, .loc').text().trim();
                const link = $el.find('h2 a, a.job-title').attr('href');

                if (jobTitle && company) {
                    jobs.push({
                        jobTitle, company: company.replace(/\s+/g, ' '),
                        location: jobLocation || location || 'India',
                        source: 'TimesJobs',
                        postedDate: new Date().toISOString(),
                        jobUrl: link || 'https://www.timesjobs.com',
                        applyLink: link || 'https://www.timesjobs.com',
                    });
                }
            });
            await new Promise(r => setTimeout(r, 500));
        }
        log.info(`TimesJobs: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`TimesJobs scraper error: ${error.message}`);
    }
    return jobs;
}

// ============== FOUNDIT (MONSTER INDIA) ==============
export async function scrapeFoundit({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `https://www.foundit.in/srp/results?query=${encodeURIComponent(role)}&locations=${encodeURIComponent(location || 'India')}`;

            const response = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });

            if (!response.ok) continue;
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.card-apply-content, .jobCard').each((i, el) => {
                if (jobs.length >= maxResults) return false;
                const $el = $(el);
                const jobTitle = $el.find('.job-title, .jobTitle').text().trim();
                const company = $el.find('.company-name, .companyName').text().trim();
                const jobLocation = $el.find('.loc, .location').text().trim();
                const link = $el.find('a[href*="/job/"]').attr('href');

                if (jobTitle && company) {
                    jobs.push({
                        jobTitle, company,
                        location: jobLocation || location || 'India',
                        source: 'Foundit',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://www.foundit.in${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://www.foundit.in${link}`,
                    });
                }
            });
            await new Promise(r => setTimeout(r, 500));
        }
        log.info(`Foundit: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Foundit scraper error: ${error.message}`);
    }
    return jobs;
}

// ============== INSTAHYRE ==============
export async function scrapeInstahyre({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `https://www.instahyre.com/search-jobs/?designation=${encodeURIComponent(role)}&location=${encodeURIComponent(location || 'India')}`;

            const response = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });

            if (!response.ok) continue;
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.job-card, .opportunity-card').each((i, el) => {
                if (jobs.length >= maxResults) return false;
                const $el = $(el);
                const jobTitle = $el.find('.job-title, h3').text().trim();
                const company = $el.find('.company-name, .company').text().trim();
                const jobLocation = $el.find('.location').text().trim();
                const link = $el.find('a').attr('href');

                if (jobTitle && company) {
                    jobs.push({
                        jobTitle, company,
                        location: jobLocation || location || 'India',
                        source: 'Instahyre',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://www.instahyre.com${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://www.instahyre.com${link}`,
                    });
                }
            });
            await new Promise(r => setTimeout(r, 500));
        }
        log.info(`Instahyre: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Instahyre scraper error: ${error.message}`);
    }
    return jobs;
}

// ============== HIRIST ==============
export async function scrapeHirist({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const searchUrl = `https://www.hirist.tech/jobs?q=${encodeURIComponent(role)}&loc=${encodeURIComponent(location || '')}`;

            const response = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });

            if (!response.ok) continue;
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.job-bx, .job-listing').each((i, el) => {
                if (jobs.length >= maxResults) return false;
                const $el = $(el);
                const jobTitle = $el.find('.job-title, h3').text().trim();
                const company = $el.find('.company, .company-name').text().trim();
                const jobLocation = $el.find('.location').text().trim();
                const link = $el.find('a').attr('href');

                if (jobTitle) {
                    jobs.push({
                        jobTitle,
                        company: company || 'Tech Company',
                        location: jobLocation || location || 'India',
                        source: 'Hirist',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://www.hirist.tech${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://www.hirist.tech${link}`,
                    });
                }
            });
            await new Promise(r => setTimeout(r, 500));
        }
        log.info(`Hirist: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Hirist scraper error: ${error.message}`);
    }
    return jobs;
}

// ============== CUTSHORT ==============
export async function scrapeCutshort({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];
    try {
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
            const searchUrl = `https://cutshort.io/jobs/${roleSlug}`;

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
                const company = $el.find('.company-name, .company').text().trim();
                const jobLocation = $el.find('.location').text().trim();
                const link = $el.find('a').attr('href');

                if (jobTitle) {
                    jobs.push({
                        jobTitle,
                        company: company || 'Startup',
                        location: jobLocation || location || 'India',
                        source: 'CutShort',
                        postedDate: new Date().toISOString(),
                        jobUrl: link?.startsWith('http') ? link : `https://cutshort.io${link}`,
                        applyLink: link?.startsWith('http') ? link : `https://cutshort.io${link}`,
                    });
                }
            });
            await new Promise(r => setTimeout(r, 500));
        }
        log.info(`CutShort: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`CutShort scraper error: ${error.message}`);
    }
    return jobs;
}
