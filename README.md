# Daily Job Pulse - Multi-Source Job Opportunity Aggregator

Tired of manually checking dozens of job boards every day? **Daily Job Pulse** automatically scans **24+ job platforms** simultaneously and delivers fresh job opportunities directly to you with clickable apply links. Whether you're searching for remote work, tech jobs in the US, or opportunities in India, this Actor aggregates everything in one place—saving you hours of manual searching.

I built this Actor because job hunting is exhausting. Switching between Indeed, Glassdoor, Naukri, RemoteOK, and countless other sites wastes valuable time. Now you can run a single Actor and get all your opportunities consolidated with smart deduplication, an interactive dashboard, and direct apply links. No API keys required, no complicated setup—just enter your desired roles and start discovering jobs.

## Use Cases

- **Daily Job Monitoring**: Schedule this Actor to run daily and automatically receive fresh job listings matching your criteria without manually visiting multiple job sites.

- **Remote Work Discovery**: Finding remote positions often requires checking specialized boards like RemoteOK, WeWorkRemotely, FlexJobs, and Turing. This Actor scans all of them in one go.

- **Tech Career Search**: For developers and IT professionals, aggregate opportunities from StackOverflow Jobs, GitHub Jobs, Dice, and AngelList alongside general job boards.

- **India Job Market**: Access India's top job portals including Naukri, Shine, TimesJobs, Foundit, Instahyre, Hirist, and CutShort in a single search.

- **Multi-Role Search**: Searching for multiple positions like "Frontend Developer" AND "Full Stack Engineer"? Enter multiple roles and get combined results across all platforms.

- **Recruitment & HR Research**: Recruiters can quickly scan the job market to understand what roles are being posted, salary trends, and competitor hiring activity.

## Input

| Parameter | Description |
|-----------|-------------|
| **Job Roles** | List of job titles to search for (e.g., "Software Engineer", "Data Analyst"). At least one role is required. |
| **Location** | Filter jobs by location—enter a city, country, or "Remote" for remote positions. |
| **Job Sources** | Select which platforms to scan from 24 available options. Choose specific platforms or use the defaults for broad coverage. |
| **Max Results Per Source** | Limit how many jobs to fetch from each platform (5-100). Lower values = faster runs. |
| **Maximum Days Old** | Only include jobs posted within this many days (1-30). Keeps your results fresh. |

## Output

The Actor produces two outputs:

### 1. Interactive HTML Dashboard
A beautiful, filterable dashboard displayed directly in Apify's Output tab with:
- Real-time search across all job listings
- Filter by source platform and location
- One-click "Apply Now" buttons
- Statistics overview (total jobs, sources scanned, runtime)

### 2. Dataset (JSON)
Each job listing in the dataset contains:

```json
{
    "jobTitle": "Senior Backend Developer",
    "company": "TechCorp Inc",
    "location": "Remote, USA",
    "source": "RemoteOK",
    "postedDate": "2024-12-20",
    "jobUrl": "https://remoteok.com/jobs/12345",
    "applyLink": "https://apply.techcorp.com/backend-senior"
}
```

## Supported Job Platforms (24)

### Worldwide Platforms
| Platform | Focus |
|----------|-------|
| **Indeed** | World's largest job search engine |
| **Glassdoor** | Jobs with company reviews & salaries |
| **Monster** | Global career platform |
| **RemoteOK** | Remote-first tech jobs |
| **WeWorkRemotely** | Remote job board |
| **SimplyHired** | Job aggregator |
| **ZipRecruiter** | AI-powered job matching |
| **Dice** | Technology & IT jobs |
| **FlexJobs** | Flexible & remote positions |
| **StackOverflow** | Developer jobs |
| **GitHub** | Tech company careers |
| **CareerBuilder** | General job board |
| **AngelList/Wellfound** | Startup jobs |
| **Toptal** | Elite freelance network |
| **Turing** | Remote developer positions |
| **Arc** | Remote developer jobs |

### India Platforms
| Platform | Focus |
|----------|-------|
| **Naukri** | India's #1 job portal |
| **Shine** | HT Media job portal |
| **TimesJobs** | Times Group job portal |
| **Foundit** | Monster India |
| **Instahyre** | AI-powered hiring |
| **Hirist** | Tech jobs in India |
| **CutShort** | Startup jobs |

## Pricing

This Actor uses **pay-per-event** pricing:
- **1 credit** per successful run (daily-job-scan event)

## Notes

- **Graceful Failures**: If one job source is temporarily unavailable, the Actor continues with others and still delivers results.
- **Smart Deduplication**: The same job posted on multiple platforms is automatically detected and deduplicated.
- **No API Keys Required**: Works out of the box without any external API keys or authentication.
- **Rate Limiting**: The Actor respects platform rate limits to ensure reliable scraping.

## Resources

- [Apify Actor Documentation](https://docs.apify.com/actors)
- [How to Schedule Actors](https://docs.apify.com/platform/schedules)
- [Apify API Reference](https://docs.apify.com/api/v2)

---

**Made with ❤️ for job seekers everywhere**
