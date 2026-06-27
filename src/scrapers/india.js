/**
 * India Job Portal Scrapers
 * 
 * Uses the scraper factory for standardized extraction.
 * Covers: Shine, TimesJobs, Foundit, Instahyre, Hirist, CutShort
 */

import { createHtmlScraper } from '../utils/scraper-factory.js';

// ─── Shine.com ─────────────────────────────────────────────────
export const scrapeShine = createHtmlScraper({
    name: 'shine',
    displayName: 'Shine',
    baseUrl: 'https://www.shine.com',
    buildSearchUrl: (role, location) => {
        const rolePath = encodeURIComponent(role).replace(/%20/g, '-');
        const loc = (location || 'india').toLowerCase().replace(/\s+/g, '-');
        return `https://www.shine.com/job-search/${rolePath}-jobs-in-${loc}`;
    },
    selectors: {
        container: '.job_container, .jobCard, [data-type="job-card"]',
        title: '.job_title, .jobTitle, h3',
        company: '.company_name, .companyName, .comp-name',
        location: '.loc, .location, .job-location',
        link: 'a[href*="/job/"], a[href*="/job-search/"]',
    },
    defaultLocation: 'India',
});

// ─── TimesJobs ─────────────────────────────────────────────────
export const scrapeTimesJobs = createHtmlScraper({
    name: 'timesjobs',
    displayName: 'TimesJobs',
    baseUrl: 'https://www.timesjobs.com',
    buildSearchUrl: (role, location) =>
        `https://www.timesjobs.com/candidate/job-search.html?searchType=personalise&from=submit&txtKeywords=${encodeURIComponent(role)}&txtLocation=${encodeURIComponent(location || 'India')}`,
    selectors: {
        container: '.job-bx, .srp-jobtuple, .job-container',
        title: 'h2 a, .job-title, .posting-title',
        company: '.joblist-comp-name, .company-name, .comp-name',
        location: '.location-text, .loc, .location',
        link: 'h2 a, a.job-title, a[href*="/job-listing/"]',
    },
    defaultLocation: 'India',
});

// ─── Foundit (Monster India) ───────────────────────────────────
export const scrapeFoundit = createHtmlScraper({
    name: 'foundit',
    displayName: 'Foundit',
    baseUrl: 'https://www.foundit.in',
    buildSearchUrl: (role, location) =>
        `https://www.foundit.in/srp/results?query=${encodeURIComponent(role)}&locations=${encodeURIComponent(location || 'India')}`,
    selectors: {
        container: '.card-apply-content, .jobCard, [data-type="job"]',
        title: '.job-title, .jobTitle, h3',
        company: '.company-name, .companyName, .comp-name',
        location: '.loc, .location, .job-location',
        link: 'a[href*="/job/"], a[href*="/middleware/"]',
    },
    defaultLocation: 'India',
});

// ─── Instahyre ─────────────────────────────────────────────────
export const scrapeInstahyre = createHtmlScraper({
    name: 'instahyre',
    displayName: 'Instahyre',
    baseUrl: 'https://www.instahyre.com',
    buildSearchUrl: (role, location) =>
        `https://www.instahyre.com/search-jobs/?designation=${encodeURIComponent(role)}&location=${encodeURIComponent(location || 'India')}`,
    selectors: {
        container: '.job-card, .opportunity-card, [data-opportunity-id]',
        title: '.job-title, h3, .opp-title',
        company: '.company-name, .company, .comp-name',
        location: '.location, .loc',
        link: 'a[href*="/job/"], a[href*="/opportunity/"]',
    },
    defaultLocation: 'India',
});

// ─── Hirist ────────────────────────────────────────────────────
export const scrapeHirist = createHtmlScraper({
    name: 'hirist',
    displayName: 'Hirist',
    baseUrl: 'https://www.hirist.tech',
    buildSearchUrl: (role, location) =>
        `https://www.hirist.tech/jobs?q=${encodeURIComponent(role)}&loc=${encodeURIComponent(location || '')}`,
    selectors: {
        container: '.job-bx, .job-listing, [data-job-id]',
        title: '.job-title, h3, .title',
        company: '.company, .company-name, .comp-name',
        location: '.location, .loc',
        link: 'a[href*="/job/"], a[href*="/jobs/"]',
    },
    defaultCompany: 'Tech Company',
    defaultLocation: 'India',
    requireCompany: false,
});

// ─── CutShort ──────────────────────────────────────────────────
export const scrapeCutshort = createHtmlScraper({
    name: 'cutshort',
    displayName: 'CutShort',
    baseUrl: 'https://cutshort.io',
    buildSearchUrl: (role) => {
        const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
        return `https://cutshort.io/jobs/${roleSlug}`;
    },
    selectors: {
        container: '.job-card, [class*="JobCard"], [data-job-id]',
        title: '.job-title, h3, h4',
        company: '.company-name, .company, .comp-name',
        location: '.location, .loc',
        link: 'a[href*="/job/"], a[href*="/jobs/"]',
    },
    defaultCompany: 'Startup',
    defaultLocation: 'India',
    requireCompany: false,
});
