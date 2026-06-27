/**
 * Centralized HTTP Client
 * 
 * Wraps got-scraping with retry logic, timeout handling,
 * random UA rotation, and optional proxy support.
 * Replaces all raw fetch() calls across scrapers.
 */

import { gotScraping } from 'got-scraping';
import { log } from 'apify';
import { getRandomUserAgent, HTTP_DEFAULTS } from '../config/constants.js';

/**
 * Make an HTTP GET request with retries, timeout, and anti-detection.
 * 
 * @param {string} url - URL to fetch
 * @param {Object} [options] - Request options
 * @param {Object} [options.proxyUrl] - Proxy URL string
 * @param {number} [options.timeoutMs] - Request timeout in ms
 * @param {number} [options.maxRetries] - Maximum retry attempts
 * @param {Object} [options.headers] - Additional headers
 * @param {boolean} [options.json] - Parse response as JSON
 * @param {string} [options.sourceName] - Source name for logging
 * @returns {Promise<{body: string|Object, statusCode: number}>}
 */
export async function httpGet(url, options = {}) {
    const {
        proxyUrl,
        timeoutMs = HTTP_DEFAULTS.timeoutMs,
        maxRetries = HTTP_DEFAULTS.maxRetries,
        headers = {},
        json = false,
        sourceName = 'HTTP',
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const requestOptions = {
                url,
                timeout: { request: timeoutMs },
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': json
                        ? 'application/json'
                        : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Cache-Control': 'no-cache',
                    ...headers,
                },
                responseType: json ? 'json' : 'text',
                retry: { limit: 0 }, // We handle retries ourselves
                throwHttpErrors: false,
            };

            if (proxyUrl) {
                requestOptions.proxyUrl = proxyUrl;
            }

            const response = await gotScraping(requestOptions);

            if (response.statusCode >= 200 && response.statusCode < 300) {
                return {
                    body: response.body,
                    statusCode: response.statusCode,
                };
            }

            // 429 = rate limited, 503 = service unavailable → retry
            if (response.statusCode === 429 || response.statusCode >= 500) {
                lastError = new Error(`HTTP ${response.statusCode} from ${sourceName}`);
                log.debug(`${sourceName}: HTTP ${response.statusCode}, attempt ${attempt}/${maxRetries}`);

                if (attempt < maxRetries) {
                    const delay = HTTP_DEFAULTS.retryDelayMs * Math.pow(2, attempt - 1);
                    await sleep(delay);
                    continue;
                }
            }

            // 403, 404, etc. → don't retry
            throw new Error(`HTTP ${response.statusCode} from ${sourceName}: ${url}`);

        } catch (error) {
            lastError = error;

            if (error.code === 'ETIMEDOUT' || error.code === 'ERR_GOT_REQUEST_ERROR') {
                log.debug(`${sourceName}: Timeout on attempt ${attempt}/${maxRetries}`);
                if (attempt < maxRetries) {
                    const delay = HTTP_DEFAULTS.retryDelayMs * Math.pow(2, attempt - 1);
                    await sleep(delay);
                    continue;
                }
            }

            // For non-retryable errors, throw immediately
            if (attempt >= maxRetries) {
                throw lastError;
            }
        }
    }

    throw lastError || new Error(`${sourceName}: All ${maxRetries} attempts failed`);
}

/**
 * Make an HTTP GET request and parse HTML with Cheerio
 * 
 * @param {string} url - URL to fetch
 * @param {Object} [options] - Same as httpGet options
 * @returns {Promise<{$: import('cheerio').CheerioAPI, statusCode: number}>}
 */
export async function httpGetHtml(url, options = {}) {
    const { load } = await import('cheerio');
    const { body, statusCode } = await httpGet(url, { ...options, json: false });
    const $ = load(body);
    return { $, statusCode };
}

/**
 * Make an HTTP GET request and parse JSON
 * 
 * @param {string} url - URL to fetch
 * @param {Object} [options] - Same as httpGet options
 * @returns {Promise<{data: any, statusCode: number}>}
 */
export async function httpGetJson(url, options = {}) {
    const { body, statusCode } = await httpGet(url, { ...options, json: true });
    return { data: body, statusCode };
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get proxy URL from Apify proxy configuration
 * @param {Object|null} proxyConfig - Proxy configuration from Actor.createProxyConfiguration()
 * @returns {Promise<string|undefined>}
 */
export async function getProxyUrl(proxyConfig) {
    if (!proxyConfig) return undefined;
    try {
        return await proxyConfig.newUrl();
    } catch {
        return undefined;
    }
}
