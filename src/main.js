/**
 * Daily Job Pulse - Multi-Source Job Opportunity Aggregator
 * 
 * v2.0.0 — Modernized with centralized HTTP client, retry logic,
 * proxy support, concurrency control, and progress reporting.
 * 
 * Scans 24+ job platforms and aggregates job opportunities
 * with direct apply links. No AI, no API keys required.
 */

import { Actor, log } from 'apify';

// Scrapers
import { scrapeRemoteOK } from './scrapers/remoteok.js';
import { scrapeIndeed } from './scrapers/indeed.js';
import { scrapeWellfound } from './scrapers/wellfound.js';
import { scrapeWeWorkRemotely } from './scrapers/weworkremotely.js';
import { scrapeGlassdoor } from './scrapers/glassdoor.js';
import { scrapeMonster } from './scrapers/monster.js';
import {
    scrapeSimplyHired,
    scrapeZipRecruiter,
    scrapeDice,
    scrapeFlexJobs,
    scrapeJobicy,
    scrapeLinkedIn,
    scrapeCareerBuilder,
    scrapeAngelList,
    scrapeToptal,
    scrapeTuring,
    scrapeArc,
} from './scrapers/worldwide.js';
import { scrapeNaukri } from './scrapers/naukri.js';
import {
    scrapeShine,
    scrapeTimesJobs,
    scrapeFoundit,
    scrapeInstahyre,
    scrapeHirist,
    scrapeCutshort,
} from './scrapers/india.js';

// Utilities
import { normalizeJob } from './utils/normalizer.js';
import { deduplicateJobs } from './utils/deduplicator.js';
import { generateDashboard } from './utils/dashboard.js';

// Config
import { getSourceDisplayName, CONCURRENCY } from './config/constants.js';

// ─── Scraper Registry ──────────────────────────────────────────
const SCRAPERS = {
    remoteok: scrapeRemoteOK,
    indeed: scrapeIndeed,
    wellfound: scrapeWellfound,
    weworkremotely: scrapeWeWorkRemotely,
    glassdoor: scrapeGlassdoor,
    monster: scrapeMonster,
    simplyhired: scrapeSimplyHired,
    ziprecruiter: scrapeZipRecruiter,
    dice: scrapeDice,
    flexjobs: scrapeFlexJobs,
    jobicy: scrapeJobicy,
    linkedin: scrapeLinkedIn,
    careerbuilder: scrapeCareerBuilder,
    angellist: scrapeAngelList,
    toptal: scrapeToptal,
    turing: scrapeTuring,
    arc: scrapeArc,
    naukri: scrapeNaukri,
    shine: scrapeShine,
    timesjobs: scrapeTimesJobs,
    foundit: scrapeFoundit,
    instahyre: scrapeInstahyre,
    hirist: scrapeHirist,
    cutshort: scrapeCutshort,
};

// ─── Main Entry Point ──────────────────────────────────────────
await Actor.init();

const startTime = Date.now();

try {
    // ── 1. Parse & validate input ──────────────────────────────
    const input = await Actor.getInput() ?? {};

    const {
        roles = ['Software Engineer'],
        location = 'Remote',
        sources = ['remoteok', 'naukri', 'indeed', 'glassdoor'],
        maxResultsPerSource = 25,
        maxDaysOld = 7,
        maxConcurrency = CONCURRENCY.defaultMaxConcurrency,
        maxTotalResults = 500,
        proxyConfiguration: proxyInput,
    } = input;

    // Validate required input
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
        throw new Error('At least one job role is required. Example: ["Software Engineer"]');
    }

    if (!sources || !Array.isArray(sources) || sources.length === 0) {
        throw new Error('At least one job source must be selected.');
    }

    // Filter out invalid sources
    const validSources = sources.filter(s => {
        if (!SCRAPERS[s]) {
            log.warning(`Unknown source "${s}", skipping. Valid sources: ${Object.keys(SCRAPERS).join(', ')}`);
            return false;
        }
        return true;
    });

    if (validSources.length === 0) {
        throw new Error('No valid job sources selected.');
    }

    // Set up proxy (optional)
    let proxyConfig = null;
    if (proxyInput) {
        try {
            proxyConfig = await Actor.createProxyConfiguration(proxyInput);
            log.info('🔒 Proxy configuration enabled');
        } catch (error) {
            log.warning(`Proxy setup failed: ${error.message}. Continuing without proxy.`);
        }
    }

    // ── 2. Status: Starting ────────────────────────────────────
    const sourceNames = validSources.map(s => getSourceDisplayName(s));
    await Actor.setStatusMessage(`Starting scan: ${roles.join(', ')} across ${validSources.length} platforms`);

    log.info('🚀 Starting Daily Job Pulse v2.0', {
        roles,
        location,
        sources: `${validSources.length} platforms`,
        maxResultsPerSource,
        maxDaysOld,
        maxConcurrency,
    });

    log.info(`📡 Selected sources: ${sourceNames.join(', ')}`);

    // ── 3. Run scrapers with concurrency control ───────────────
    const allJobs = [];
    const sourceStats = {};
    const concurrency = Math.max(1, Math.min(maxConcurrency, CONCURRENCY.maxConcurrency));

    // Process scrapers in batches to control concurrency
    const batches = [];
    for (let i = 0; i < validSources.length; i += concurrency) {
        batches.push(validSources.slice(i, i + concurrency));
    }

    let completedSources = 0;
    let successfulSources = 0;

    for (const batch of batches) {
        const batchResults = await Promise.allSettled(
            batch.map(async (source) => {
                const scraper = SCRAPERS[source];
                const displayName = getSourceDisplayName(source);
                const sourceStartTime = Date.now();

                try {
                    log.info(`📡 Scanning ${displayName}...`);
                    const jobs = await scraper({
                        roles,
                        location,
                        maxResults: maxResultsPerSource,
                        maxDaysOld,
                        proxyConfig,
                    });

                    const elapsed = ((Date.now() - sourceStartTime) / 1000).toFixed(1);
                    log.info(`✅ ${displayName}: ${jobs.length} jobs (${elapsed}s)`);

                    sourceStats[displayName] = {
                        jobs: jobs.length,
                        timeSeconds: parseFloat(elapsed),
                        status: 'success',
                    };

                    return { source, jobs, error: null };
                } catch (error) {
                    const elapsed = ((Date.now() - sourceStartTime) / 1000).toFixed(1);
                    log.warning(`⚠️ ${displayName}: ${error.message} (${elapsed}s)`);

                    sourceStats[displayName] = {
                        jobs: 0,
                        timeSeconds: parseFloat(elapsed),
                        status: 'failed',
                        error: error.message,
                    };

                    return { source, jobs: [], error: error.message };
                }
            })
        );

        // Collect results from this batch
        for (const result of batchResults) {
            completedSources++;
            if (result.status === 'fulfilled' && result.value.jobs.length > 0) {
                allJobs.push(...result.value.jobs);
                successfulSources++;
            }
        }

        // Update progress
        const progress = Math.round((completedSources / validSources.length) * 100);
        await Actor.setStatusMessage(
            `Scanning: ${completedSources}/${validSources.length} sources complete (${progress}%) — ${allJobs.length} jobs found`
        );
    }

    // ── 4. Process results ─────────────────────────────────────
    await Actor.setStatusMessage(`Processing ${allJobs.length} jobs...`);
    log.info(`📊 Total jobs before processing: ${allJobs.length}`);

    // Normalize
    const normalizedJobs = allJobs
        .map(job => normalizeJob(job))
        .filter(job => job !== null);

    log.info(`📊 Jobs after normalization: ${normalizedJobs.length}`);

    // Deduplicate
    const uniqueJobs = deduplicateJobs(normalizedJobs);
    log.info(`📊 Unique jobs after deduplication: ${uniqueJobs.length}`);

    // Apply total results limit
    const finalJobs = uniqueJobs.slice(0, maxTotalResults);
    if (uniqueJobs.length > maxTotalResults) {
        log.info(`📊 Trimmed to ${maxTotalResults} results (maxTotalResults limit)`);
    }

    // ── 5. Calculate stats ─────────────────────────────────────
    const runtime = Math.round((Date.now() - startTime) / 1000);
    const stats = {
        totalJobs: finalJobs.length,
        sourcesScanned: validSources.length,
        successfulSources,
        failedSources: validSources.length - successfulSources,
        roles,
        location,
        runtime,
        sourceStats,
        scannedAt: new Date().toISOString(),
    };

    // ── 6. Generate & save dashboard ───────────────────────────
    await Actor.setStatusMessage(`Generating dashboard for ${finalJobs.length} jobs...`);
    log.info('🎨 Generating interactive dashboard...');

    const dashboardHtml = generateDashboard(finalJobs, stats);
    await Actor.setValue('dashboard.html', dashboardHtml, { contentType: 'text/html' });
    log.info('✅ Dashboard saved to key-value store');

    // Save run summary as JSON (machine-readable)
    await Actor.setValue('run-summary', stats, { contentType: 'application/json' });

    // ── 7. Push to dataset ─────────────────────────────────────
    if (finalJobs.length > 0) {
        await Actor.pushData(finalJobs);
        log.info(`✅ Pushed ${finalJobs.length} jobs to dataset`);
    } else {
        log.warning('⚠️ No jobs found matching the criteria');
        await Actor.setStatusMessage('Completed: No jobs found matching criteria. Try broadening your search.');
    }

    // ── 8. Billing ─────────────────────────────────────────────
    try {
        await Actor.triggerCharge({ eventName: 'daily-job-scan' });
        log.info('💰 Billing event triggered: daily-job-scan');
    } catch (chargeError) {
        log.debug(`Billing event skipped: ${chargeError.message}`);
    }

    // ── 9. Final status ────────────────────────────────────────
    const statusMsg = `✅ Found ${finalJobs.length} jobs from ${successfulSources}/${validSources.length} sources in ${runtime}s`;
    await Actor.setStatusMessage(statusMsg);

    log.info('🎉 Daily Job Pulse completed!', {
        totalJobsFound: finalJobs.length,
        sourcesScanned: validSources.length,
        successfulSources,
        roles,
        location,
        runtime: `${runtime}s`,
    });

} catch (error) {
    await Actor.setStatusMessage(`❌ Error: ${error.message}`);
    log.error(`Fatal error: ${error.message}`);
    throw error;
} finally {
    await Actor.exit();
}
