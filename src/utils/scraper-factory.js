/**
 * Scraper Factory
 * 
 * Creates standardized scrapers from configuration objects.
 * Eliminates duplicated boilerplate across 20+ scraper files.
 */

import { log } from 'apify';
import { httpGetHtml, sleep, getProxyUrl } from './http.js';
import { HTTP_DEFAULTS } from '../config/constants.js';

/**
 * Create a generic HTML scraper from a configuration object.
 * 
 * @param {Object} config - Scraper configuration
 * @param {string} config.name - Source identifier (e.g., 'monster')
 * @param {string} config.displayName - Human-readable name (e.g., 'Monster')
 * @param {Function} config.buildSearchUrl - (role, location, maxDaysOld) => url
 * @param {Object} config.selectors - CSS selectors for extraction
 * @param {string} config.selectors.container - Job card container selector
 * @param {string} config.selectors.title - Job title selector
 * @param {string} config.selectors.company - Company name selector
 * @param {string} config.selectors.location - Location selector
 * @param {string} config.selectors.link - Apply/job URL selector
 * @param {string} [config.selectors.linkAttr='href'] - Attribute for link extraction
 * @param {Function} [config.buildJobUrl] - (href, baseUrl) => full URL
 * @param {string} [config.defaultLocation] - Fallback location value
 * @param {string} [config.defaultCompany] - Fallback company value
 * @param {boolean} [config.requireCompany=true] - Skip jobs without company
 * @returns {Function} Async scraper function
 */
export function createHtmlScraper(config) {
    const {
        name,
        displayName,
        buildSearchUrl,
        selectors,
        buildJobUrl,
        defaultLocation = 'Not specified',
        defaultCompany,
        requireCompany = true,
    } = config;

    return async function scrape({ roles, location, maxResults, maxDaysOld, proxyConfig }) {
        const jobs = [];
        const proxyUrl = await getProxyUrl(proxyConfig);

        try {
            for (const role of roles) {
                if (jobs.length >= maxResults) break;

                const searchUrl = buildSearchUrl(role, location, maxDaysOld);
                log.debug(`${displayName}: Searching for "${role}"...`);

                try {
                    const { $ } = await httpGetHtml(searchUrl, {
                        proxyUrl,
                        sourceName: displayName,
                    });

                    $(selectors.container).each((i, el) => {
                        if (jobs.length >= maxResults) return false;

                        const $el = $(el);
                        const jobTitle = $el.find(selectors.title).first().text().trim();
                        const company = $el.find(selectors.company).first().text().trim();
                        const jobLocation = $el.find(selectors.location).first().text().trim();
                        const linkAttr = selectors.linkAttr || 'href';
                        const href = $el.find(selectors.link).attr(linkAttr);

                        // Skip if missing required fields
                        if (!jobTitle) return;
                        if (requireCompany && !company && !defaultCompany) return;

                        const jobUrl = buildJobUrl
                            ? buildJobUrl(href, searchUrl)
                            : resolveUrl(href, config.baseUrl || '');

                        jobs.push({
                            jobTitle,
                            company: company || defaultCompany || 'Unknown',
                            location: jobLocation || location || defaultLocation,
                            source: displayName,
                            postedDate: new Date().toISOString(),
                            jobUrl: jobUrl || searchUrl,
                            applyLink: jobUrl || searchUrl,
                        });
                    });
                } catch (error) {
                    log.warning(`${displayName}: Failed for role "${role}": ${error.message}`);
                }

                // Rate limiting between role searches
                if (roles.indexOf(role) < roles.length - 1) {
                    await sleep(HTTP_DEFAULTS.delayBetweenRequestsMs);
                }
            }

            log.info(`${displayName}: Found ${jobs.length} jobs`);
        } catch (error) {
            log.error(`${displayName}: Scraper error: ${error.message}`);
            throw error;
        }

        return jobs;
    };
}

/**
 * Resolve a potentially relative URL against a base URL
 * @param {string|undefined} href - URL or path
 * @param {string} baseUrl - Base URL for resolution
 * @returns {string|undefined}
 */
function resolveUrl(href, baseUrl) {
    if (!href) return undefined;
    if (href.startsWith('http')) return href;
    return `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
}
