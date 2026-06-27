/**
 * RemoteOK Job Scraper
 * 
 * Uses RemoteOK's public JSON API — the most reliable source.
 * https://remoteok.com/api
 */

import { log } from 'apify';
import { httpGetJson, getProxyUrl } from '../utils/http.js';
import { isJobFresh } from '../utils/normalizer.js';

const REMOTEOK_API = 'https://remoteok.com/api';

/**
 * Scrape jobs from RemoteOK via their public JSON API
 */
export async function scrapeRemoteOK({ roles, location, maxResults, maxDaysOld, proxyConfig }) {
    const jobs = [];
    const proxyUrl = await getProxyUrl(proxyConfig);

    try {
        const { data } = await httpGetJson(REMOTEOK_API, {
            proxyUrl,
            sourceName: 'RemoteOK',
            headers: { 'Accept': 'application/json' },
        });

        // First item is metadata, skip it
        const listings = Array.isArray(data) ? data.slice(1) : [];
        log.debug(`RemoteOK: Found ${listings.length} total listings`);

        for (const listing of listings) {
            if (jobs.length >= maxResults) break;

            // Skip if missing required fields
            if (!listing.position || !listing.company || !listing.url) continue;

            // Check if job matches any of the roles
            const jobTitle = listing.position.toLowerCase();
            const matchesRole = roles.some(role =>
                jobTitle.includes(role.toLowerCase()) ||
                listing.tags?.some(tag => tag.toLowerCase().includes(role.toLowerCase()))
            );

            if (!matchesRole) continue;

            // Check freshness
            if (!isJobFresh(listing.date, maxDaysOld)) continue;

            // Check location (RemoteOK is primarily remote jobs)
            const jobLocation = listing.location || 'Remote';
            if (location && location.toLowerCase() !== 'remote') {
                if (!jobLocation.toLowerCase().includes(location.toLowerCase())) {
                    continue;
                }
            }

            jobs.push({
                jobTitle: listing.position,
                company: listing.company,
                location: jobLocation,
                source: 'RemoteOK',
                postedDate: listing.date,
                jobUrl: `https://remoteok.com${listing.url}`,
                applyLink: listing.apply_url || `https://remoteok.com${listing.url}`,
            });
        }

        log.info(`RemoteOK: Found ${jobs.length} jobs matching roles: ${roles.join(', ')}`);
    } catch (error) {
        log.error(`RemoteOK: ${error.message}`);
        throw error;
    }

    return jobs;
}
