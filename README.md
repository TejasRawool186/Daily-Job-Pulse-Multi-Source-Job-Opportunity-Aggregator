# Daily Job Pulse — Multi-Source Job Opportunity Aggregator

Tired of manually checking dozens of job boards every day? **Daily Job Pulse** automatically scans **24 job platforms** simultaneously and delivers fresh job opportunities with clickable apply links. Whether you're searching for remote work, tech jobs, or opportunities in India — this Actor aggregates everything in one place.

## Quick Start

1. Click **Start** with the prefilled input to run immediately
2. View results in the **Dataset** tab or open the **Interactive Dashboard**
3. Download results as **CSV** or **Excel** from the Output tab

No API keys, no complicated setup — just enter your desired roles and go.

## Use Cases

- **Daily Job Monitoring** — Schedule to run daily and receive fresh listings automatically
- **Remote Work Discovery** — Scan RemoteOK, WeWorkRemotely, FlexJobs, Jobicy, Turing, and more in one go
- **Tech Career Search** — Aggregate from Dice, LinkedIn, AngelList, and Arc alongside general boards
- **India Job Market** — Access Naukri, Shine, TimesJobs, Foundit, Instahyre, Hirist, and CutShort
- **Multi-Role Search** — Search for "Frontend Developer" AND "Full Stack Engineer" simultaneously
- **Recruitment Research** — Quickly scan the market for competitor hiring activity and salary trends

## Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| **Job Roles** | Job titles to search for (at least one required) | Software Engineer, Frontend Developer |
| **Location** | City, country, or "Remote" | Remote |
| **Job Sources** | Platforms to scan (select from 24 options) | RemoteOK, Naukri, Indeed, Glassdoor |
| **Max Results Per Source** | Jobs per platform (5–100) | 25 |
| **Max Days Old** | Only jobs posted within N days (1–30) | 7 |
| **Max Total Results** | Cap total output size (10–2000) | 500 |
| **Max Concurrency** | Parallel scanners (1–10) | 5 |
| **Proxy Configuration** | Optional Apify Proxy for reliability | Disabled |

## Output

### Interactive Dashboard
A beautiful, filterable dashboard with:
- Real-time search across all listings
- Filter by source, location, and job type
- Sort by date, company, source, or title
- Dark/light theme toggle
- One-click CSV export
- Keyboard navigation (press `/` to search)

### Dataset
Each job contains:

```json
{
    "jobTitle": "Senior Backend Developer",
    "company": "TechCorp Inc",
    "location": "Remote, USA",
    "source": "RemoteOK",
    "postedDate": "2026-06-27",
    "jobUrl": "https://remoteok.com/jobs/12345",
    "applyLink": "https://apply.techcorp.com/backend",
    "jobType": "remote",
    "scrapedAt": "2026-06-27T10:30:00.000Z"
}
```

### Run Summary
Machine-readable JSON with per-source statistics, timing metrics, and success/failure counts — perfect for monitoring and automation.

## Supported Platforms (24)

### Worldwide
| Platform | Focus |
|----------|-------|
| Indeed | World's largest job search engine |
| Glassdoor | Jobs with company reviews & salaries |
| Monster | Global career platform |
| SimplyHired | Job aggregator |
| ZipRecruiter | AI-powered job matching |
| LinkedIn | Professional network jobs |
| CareerBuilder | General job board |

### Remote & Tech
| Platform | Focus |
|----------|-------|
| RemoteOK | Remote-first tech jobs |
| WeWorkRemotely | Premium remote job board |
| FlexJobs | Flexible & remote positions |
| Jobicy | Remote job API |
| Dice | Technology & IT jobs |
| Wellfound | Startup jobs |
| AngelList | Startup ecosystem |
| Toptal | Elite freelance network |
| Turing | Remote developer positions |
| Arc | Remote developer jobs |

### India
| Platform | Focus |
|----------|-------|
| Naukri | India's #1 job portal |
| Shine | HT Media job portal |
| TimesJobs | Times Group job portal |
| Foundit | Monster India |
| Instahyre | AI-powered hiring |
| Hirist | Tech jobs in India |
| CutShort | Startup jobs |

## Scheduling

Set up daily automated scans:
1. Go to **Schedules** in your Apify Console
2. Create a new schedule with your desired frequency (e.g., daily at 8 AM)
3. Select this Actor and configure your input
4. Receive fresh jobs automatically

## Integration

### API Access
```bash
curl "https://api.apify.com/v2/datasets/YOUR_DATASET_ID/items?format=json&token=YOUR_TOKEN"
```

### Webhooks
Configure webhooks in the Actor settings to receive notifications when new jobs are found. Works with Zapier, Make, Slack, and email.

## Pricing

**Pay-per-event**: 1 credit per successful run (`daily-job-scan` event)

## Technical Details

- **Architecture**: Modular scraper system with centralized HTTP client
- **Reliability**: Automatic retries (3x with exponential backoff), per-source timeouts (30s), graceful failure isolation
- **Performance**: Configurable concurrency, batch processing, smart deduplication
- **Proxy**: Optional Apify Proxy support for improved reliability
- **Security**: No credentials stored, public data only, input validation

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No results found | Try broader roles (e.g., "Developer" instead of "Senior React Developer") |
| Source returns 0 jobs | The platform may be blocking requests — enable Proxy Configuration |
| Run takes too long | Reduce Max Results Per Source or select fewer sources |
| Missing apply links | Some platforms don't expose direct apply URLs; the job listing URL is used instead |

## Changelog

### v2.0.0 (2026-06-27)
- Upgraded all dependencies (apify 3.7.2, crawlee 3.17, cheerio 1.0)
- Added centralized HTTP client with retries, timeouts, and proxy support
- Added concurrency control for parallel scraping
- Added `Actor.setStatusMessage()` progress reporting
- Added job type detection (remote/hybrid/onsite)
- Added fuzzy deduplication
- Added dashboard: dark/light theme, sorting, pagination, CSV export
- Replaced dead scrapers (GitHub Jobs → Jobicy, StackOverflow Jobs → LinkedIn)
- Added proxy configuration support
- Added run summary JSON output
- Upgraded Docker image to Node.js 22 LTS

### v1.0.0
- Initial release with 23 job sources

## Resources

- [Apify Actor Documentation](https://docs.apify.com/actors)
- [How to Schedule Actors](https://docs.apify.com/platform/schedules)
- [Apify Proxy](https://docs.apify.com/platform/proxy)
- [Apify API Reference](https://docs.apify.com/api/v2)

---

**Made with ❤️ for job seekers everywhere**
