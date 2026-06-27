/**
 * Worldwide Job Platform Scrapers
 * 
 * Uses the scraper factory for standardized extraction.
 * Replaced dead scrapers (GitHub Jobs, StackOverflow Jobs) with
 * Jobicy (remote API) and LinkedIn (public listings).
 */

import { log } from 'apify';
import { createHtmlScraper } from '../utils/scraper-factory.js';
import { httpGetJson, getProxyUrl } from '../utils/http.js';

// ─── SimplyHired ───────────────────────────────────────────────
export const scrapeSimplyHired = createHtmlScraper({
    name: 'simplyhired',
    displayName: 'SimplyHired',
    baseUrl: 'https://www.simplyhired.com',
    buildSearchUrl: (role, location) =>
        `https://www.simplyhired.com/search?q=${encodeURIComponent(role)}&l=${encodeURIComponent(location || 'Remote')}`,
    selectors: {
        container: '[data-testid="searchSerpJob"], .SerpJob, article[data-testid]',
        title: '[data-testid="searchSerpJobTitle"], .jobTitle, h2',
        company: '[data-testid="companyName"], .companyName, .company',
        location: '[data-testid="searchSerpJobLocation"], .location, .loc',
        link: 'a[href*="/job/"], a[href*="/click"]',
    },
});

// ─── ZipRecruiter ──────────────────────────────────────────────
export const scrapeZipRecruiter = createHtmlScraper({
    name: 'ziprecruiter',
    displayName: 'ZipRecruiter',
    baseUrl: 'https://www.ziprecruiter.com',
    buildSearchUrl: (role, location, maxDaysOld) =>
        `https://www.ziprecruiter.com/jobs-search?search=${encodeURIComponent(role)}&location=${encodeURIComponent(location || 'Remote')}&days=${maxDaysOld}`,
    selectors: {
        container: '.job_result, article.job-listing, [data-testid="job-card"]',
        title: '.job_title, h2, .title',
        company: '.hiring_company, .company, .t_org_link',
        location: '.location, .job_location',
        link: 'a.job_link, a[href*="/jobs/"], a[href*="/c/"]',
    },
});

// ─── Dice (Tech Jobs) ──────────────────────────────────────────
export const scrapeDice = createHtmlScraper({
    name: 'dice',
    displayName: 'Dice',
    baseUrl: 'https://www.dice.com',
    buildSearchUrl: (role, location) =>
        `https://www.dice.com/jobs?q=${encodeURIComponent(role)}&location=${encodeURIComponent(location || 'Remote')}&countryCode=US&radius=30&radiusUnit=mi&page=1&pageSize=20&language=en`,
    selectors: {
        container: '[data-cy="search-result-job-card"], .search-card, dhi-search-card',
        title: '[data-cy="card-title"], .card-title, a.card-title-link',
        company: '[data-cy="search-result-company-name"], .company-name, .dhi-comp-name',
        location: '[data-cy="search-result-location"], .location, .dhi-location',
        link: 'a[href*="/job-detail/"], a[href*="/jobs/"]',
    },
});

// ─── FlexJobs ──────────────────────────────────────────────────
export const scrapeFlexJobs = createHtmlScraper({
    name: 'flexjobs',
    displayName: 'FlexJobs',
    baseUrl: 'https://www.flexjobs.com',
    buildSearchUrl: (role, location) =>
        `https://www.flexjobs.com/search?search=${encodeURIComponent(role)}&location=${encodeURIComponent(location || '')}`,
    selectors: {
        container: '.job-tile, .job-card, [data-testid="job-listing"]',
        title: '.job-title, h5, .title',
        company: '.company-name, .company',
        location: '.location, .job-location',
        link: 'a[href*="/jobs/"]',
    },
    defaultCompany: 'Flexible Employer',
    defaultLocation: 'Remote',
    requireCompany: false,
});

// ─── Jobicy (replaces dead GitHub Jobs) ────────────────────────
export async function scrapeJobicy({ roles, location, maxResults, maxDaysOld, proxyConfig }) {
    const jobs = [];
    const proxyUrl = await getProxyUrl(proxyConfig);

    try {
        // Jobicy provides a public REST API for remote jobs
        for (const role of roles) {
            if (jobs.length >= maxResults) break;

            const apiUrl = `https://jobicy.com/api/v2/remote-jobs?count=${maxResults}&tag=${encodeURIComponent(role)}`;
            log.debug(`Jobicy: Searching for "${role}"...`);

            try {
                const { data } = await httpGetJson(apiUrl, {
                    proxyUrl,
                    sourceName: 'Jobicy',
                });

                const listings = data?.jobs || [];

                for (const listing of listings) {
                    if (jobs.length >= maxResults) break;

                    if (!listing.jobTitle || !listing.companyName) continue;

                    // Location filter
                    const jobLocation = listing.jobGeo || 'Remote';
                    if (location && location.toLowerCase() !== 'remote') {
                        if (!jobLocation.toLowerCase().includes(location.toLowerCase())) {
                            continue;
                        }
                    }

                    jobs.push({
                        jobTitle: listing.jobTitle,
                        company: listing.companyName,
                        location: jobLocation,
                        source: 'Jobicy',
                        postedDate: listing.pubDate || new Date().toISOString(),
                        jobUrl: listing.url || 'https://jobicy.com',
                        applyLink: listing.url || 'https://jobicy.com',
                    });
                }
            } catch (error) {
                log.warning(`Jobicy: Failed for role "${role}": ${error.message}`);
            }
        }

        log.info(`Jobicy: Found ${jobs.length} jobs`);
    } catch (error) {
        log.error(`Jobicy: ${error.message}`);
        throw error;
    }

    return jobs;
}

// ─── LinkedIn (replaces dead StackOverflow Jobs) ───────────────
export const scrapeLinkedIn = createHtmlScraper({
    name: 'linkedin',
    displayName: 'LinkedIn',
    baseUrl: 'https://www.linkedin.com',
    buildSearchUrl: (role, location) =>
        `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(role)}&location=${encodeURIComponent(location || 'Remote')}&f_TPR=r604800`,
    selectors: {
        container: '.base-card, .job-search-card, [data-entity-urn]',
        title: '.base-search-card__title, h3.base-search-card__title, .job-title',
        company: '.base-search-card__subtitle, h4.base-search-card__subtitle, .company-name',
        location: '.job-search-card__location, .base-search-card__metadata, .location',
        link: 'a.base-card__full-link, a[href*="/jobs/view/"]',
    },
    defaultCompany: 'Company',
    requireCompany: false,
});

// ─── CareerBuilder ─────────────────────────────────────────────
export const scrapeCareerBuilder = createHtmlScraper({
    name: 'careerbuilder',
    displayName: 'CareerBuilder',
    baseUrl: 'https://www.careerbuilder.com',
    buildSearchUrl: (role, location) =>
        `https://www.careerbuilder.com/jobs?keywords=${encodeURIComponent(role)}&location=${encodeURIComponent(location || 'Remote')}`,
    selectors: {
        container: '[data-job-id], .job-listing-item, .data-results-content-parent',
        title: '.job-title, h2, .data-results-title',
        company: '.company-name, .employer, .data-details',
        location: '.location, .job-location, .data-details .location',
        link: 'a[href*="/job/"]',
    },
});

// ─── AngelList ─────────────────────────────────────────────────
export const scrapeAngelList = createHtmlScraper({
    name: 'angellist',
    displayName: 'AngelList',
    baseUrl: 'https://angel.co',
    buildSearchUrl: (role) => {
        const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
        return `https://angel.co/role/${roleSlug}`;
    },
    selectors: {
        container: '[class*="jobListing"], .job-card, [data-test="startup-list-item"]',
        title: '[class*="title"], h3, .job-title',
        company: '[class*="company"], .startup-name, .company-name',
        location: '[class*="location"], .location',
        link: 'a[href*="/jobs/"], a[href*="/l/"]',
    },
    defaultCompany: 'Startup',
    defaultLocation: 'Remote',
    requireCompany: false,
});

// ─── Toptal ────────────────────────────────────────────────────
export const scrapeToptal = createHtmlScraper({
    name: 'toptal',
    displayName: 'Toptal',
    baseUrl: 'https://www.toptal.com',
    buildSearchUrl: () => 'https://www.toptal.com/careers',
    selectors: {
        container: '.job-listing, .position-card, article, [data-test="job-card"]',
        title: 'h3, h4, .title, .position-title',
        company: '.company',
        location: '.location',
        link: 'a[href*="/careers/"], a[href*="/positions/"]',
    },
    defaultCompany: 'Toptal',
    defaultLocation: 'Remote',
    requireCompany: false,
});

// ─── Turing ────────────────────────────────────────────────────
export const scrapeTuring = createHtmlScraper({
    name: 'turing',
    displayName: 'Turing',
    baseUrl: 'https://www.turing.com',
    buildSearchUrl: (role) => {
        const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
        return `https://www.turing.com/remote-developer-jobs/${roleSlug}`;
    },
    selectors: {
        container: '.job-card, [class*="JobCard"], [data-testid="job-listing"]',
        title: '.job-title, h3, h4',
        company: '.company-name, .company',
        location: '.location',
        link: 'a[href*="/remote-developer-jobs/"], a[href*="/jobs/"]',
    },
    defaultCompany: 'Turing Client',
    defaultLocation: 'Remote',
    requireCompany: false,
});

// ─── Arc.dev ───────────────────────────────────────────────────
export const scrapeArc = createHtmlScraper({
    name: 'arc',
    displayName: 'Arc',
    baseUrl: 'https://arc.dev',
    buildSearchUrl: (role) =>
        `https://arc.dev/remote-jobs?search=${encodeURIComponent(role)}`,
    selectors: {
        container: '.job-card, [class*="JobCard"], article, [data-testid="job-card"]',
        title: '.job-title, h3, h4',
        company: '.company-name, .company',
        location: '.location',
        link: 'a[href*="/remote-jobs/"], a[href*="/jobs/"]',
    },
    defaultCompany: 'Arc Client',
    defaultLocation: 'Remote',
    requireCompany: false,
});
