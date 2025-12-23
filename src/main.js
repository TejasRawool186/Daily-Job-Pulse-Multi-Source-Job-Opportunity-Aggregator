/**
 * Daily Job Pulse - Multi-Source Job Opportunity Aggregator
 * 
 * Scans multiple job platforms and aggregates job opportunities
 * with direct apply links. No AI, no API keys required.
 */

import { Actor, log } from 'apify';
import { scrapeRemoteOK } from './scrapers/remoteok.js';
import { scrapeIndeed } from './scrapers/indeed.js';
import { scrapeWellfound } from './scrapers/wellfound.js';
import { scrapeWeWorkRemotely } from './scrapers/weworkremotely.js';
import { normalizeJob } from './utils/normalizer.js';
import { deduplicateJobs } from './utils/deduplicator.js';
import { generateDashboard } from './utils/dashboard.js';

// Map source names to scraper functions
const SCRAPERS = {
    remoteok: scrapeRemoteOK,
    indeed: scrapeIndeed,
    wellfound: scrapeWellfound,
    weworkremotely: scrapeWeWorkRemotely,
};

await Actor.init();

const startTime = Date.now();

try {
    // Get input configuration
    const input = await Actor.getInput() ?? {};

    const {
        roles = ['Software Engineer'],
        location = 'Remote',
        sources = ['remoteok', 'weworkremotely'],
        maxResultsPerSource = 25,
        maxDaysOld = 7,
    } = input;

    log.info('🚀 Starting Daily Job Pulse', {
        roles,
        location,
        sources,
        maxResultsPerSource,
        maxDaysOld,
    });

    // Validate input
    if (!roles || roles.length === 0) {
        throw new Error('At least one job role is required');
    }

    // Run scrapers for selected sources
    const allJobs = [];
    const scraperResults = await Promise.allSettled(
        sources.map(async (source) => {
            const scraper = SCRAPERS[source];
            if (!scraper) {
                log.warning(`Unknown source: ${source}, skipping...`);
                return { source, jobs: [], error: null };
            }

            try {
                log.info(`📡 Scanning ${source}...`);
                const jobs = await scraper({
                    roles,
                    location,
                    maxResults: maxResultsPerSource,
                    maxDaysOld,
                });
                log.info(`✅ Found ${jobs.length} jobs from ${source}`);
                return { source, jobs, error: null };
            } catch (error) {
                log.error(`❌ Failed to scrape ${source}: ${error.message}`);
                return { source, jobs: [], error: error.message };
            }
        })
    );

    // Collect all jobs and handle failures gracefully
    for (const result of scraperResults) {
        if (result.status === 'fulfilled' && result.value.jobs.length > 0) {
            allJobs.push(...result.value.jobs);
        }
    }

    log.info(`📊 Total jobs collected before normalization: ${allJobs.length}`);

    // Normalize all jobs
    const normalizedJobs = allJobs
        .map(job => normalizeJob(job))
        .filter(job => job !== null);

    log.info(`📊 Jobs after normalization: ${normalizedJobs.length}`);

    // Deduplicate jobs
    const uniqueJobs = deduplicateJobs(normalizedJobs);

    log.info(`📊 Unique jobs after deduplication: ${uniqueJobs.length}`);

    // Calculate runtime
    const runtime = Math.round((Date.now() - startTime) / 1000);

    // Generate statistics for dashboard
    const stats = {
        totalJobs: uniqueJobs.length,
        sourcesScanned: sources.length,
        roles: roles,
        location: location,
        runtime: runtime,
    };

    // Generate and save the HTML dashboard
    log.info('🎨 Generating interactive dashboard...');
    const dashboardHtml = generateDashboard(uniqueJobs, stats);

    // Save dashboard to key-value store
    await Actor.setValue('dashboard.html', dashboardHtml, { contentType: 'text/html' });
    log.info('✅ Dashboard saved to key-value store');

    // Push results to dataset
    if (uniqueJobs.length > 0) {
        await Actor.pushData(uniqueJobs);
        log.info(`✅ Pushed ${uniqueJobs.length} jobs to dataset`);
    } else {
        log.warning('⚠️ No jobs found matching the criteria');
    }

    // Trigger billing event for monetization
    try {
        await Actor.triggerCharge({ eventName: 'daily-job-scan' });
        log.info('💰 Billing event triggered: daily-job-scan');
    } catch (chargeError) {
        // Billing might fail in development/testing - that's OK
        log.debug(`Billing event skipped: ${chargeError.message}`);
    }

    // Log summary
    log.info('🎉 Daily Job Pulse completed successfully!', {
        totalJobsFound: uniqueJobs.length,
        sourcesScanned: sources.length,
        roles,
        location,
        runtime: `${runtime}s`,
    });

} catch (error) {
    log.error(`Fatal error: ${error.message}`);
    throw error;
} finally {
    await Actor.exit();
}
