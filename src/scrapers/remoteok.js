/**
 * RemoteOK Job Scraper
 * 
 * Scrapes job listings from RemoteOK using their public API
 * https://remoteok.com/api
 */

import { log } from 'apify';
import { isJobFresh } from '../utils/normalizer.js';

const REMOTEOK_API = 'https://remoteok.com/api';

/**
 * Scrape jobs from RemoteOK
 * @param {Object} options - Scraper options
 * @param {string[]} options.roles - Job roles to search
 * @param {string} options.location - Location filter
 * @param {number} options.maxResults - Max results to return
 * @param {number} options.maxDaysOld - Max age of jobs in days
 * @returns {Promise<Array>} - Array of job listings
 */
export async function scrapeRemoteOK({ roles, location, maxResults, maxDaysOld }) {
    const jobs = [];

    try {
        const response = await fetch(REMOTEOK_API, {
            headers: {
                'User-Agent': 'DailyJobPulse/1.0 (Apify Actor)',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // First item is metadata, skip it
        const listings = Array.isArray(data) ? data.slice(1) : [];

        log.debug(`RemoteOK: Found ${listings.length} total listings`);

        for (const listing of listings) {
            // Stop if we have enough results
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

        log.info(`RemoteOK: Matched ${jobs.length} jobs for roles: ${roles.join(', ')}`);
    } catch (error) {
        log.error(`RemoteOK scraper error: ${error.message}`);
        throw error;
    }

    return jobs;
}
