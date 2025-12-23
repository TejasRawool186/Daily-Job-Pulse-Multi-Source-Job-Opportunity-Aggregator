# 🚀 Daily Job Pulse

**Multi-Source Job Opportunity Aggregator**

Scans **25+ job platforms** daily and aggregates the latest job opportunities with direct apply links. No AI, no API keys required.

## ✨ Features

- **25+ Job Platforms**: Aggregates from worldwide and India-specific portals
- **Direct Apply Links**: Every job listing includes a clickable apply link
- **Beautiful Dashboard**: Interactive HTML dashboard with search & filters
- **Role-Based Search**: Search for multiple job roles simultaneously
- **Location Filtering**: Filter by country, city, or remote positions
- **Freshness Control**: Only get jobs posted within your specified timeframe
- **Zero API Keys**: Works without any external API keys
- **Graceful Failures**: If one source fails, others continue working
- **Deduplication**: Removes duplicate listings across platforms

## 🌐 Supported Job Platforms (25+)

### Worldwide Platforms
| Platform | Description |
|----------|-------------|
| **LinkedIn** | World's largest professional network |
| **Indeed** | Global job search engine |
| **Glassdoor** | Jobs with company reviews |
| **Monster** | Global career platform |
| **RemoteOK** | Remote-first jobs |
| **WeWorkRemotely** | Remote job board |
| **SimplyHired** | Job aggregator |
| **ZipRecruiter** | AI-powered job matching |
| **Dice** | Tech jobs |
| **FlexJobs** | Flexible & remote jobs |
| **StackOverflow** | Developer jobs |
| **GitHub** | Tech company jobs |
| **CareerBuilder** | Job board |
| **AngelList/Wellfound** | Startup jobs |
| **Toptal** | Elite freelance network |
| **Turing** | Remote developer jobs |
| **Arc** | Remote developer jobs |

### 🇮🇳 India Platforms
| Platform | Description |
|----------|-------------|
| **Naukri** | India's #1 job portal |
| **Shine** | HT Media job portal |
| **TimesJobs** | Times Group job portal |
| **Foundit** | Monster India |
| **Instahyre** | AI-powered hiring |
| **Hirist** | Tech jobs in India |
| **CutShort** | Startup jobs |

## 📊 Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `roles` | Array | ✅ Yes | - | Job roles to search (e.g., ["Backend Developer"]) |
| `location` | String | No | "Remote" | Location filter |
| `sources` | Array | No | ["remoteok", "linkedin", "naukri", "indeed"] | Platforms to scan (dropdown) |
| `maxResultsPerSource` | Number | No | 25 | Maximum jobs per platform |
| `maxDaysOld` | Number | No | 7 | Only include jobs posted within X days |

## 📤 Output

### Interactive Dashboard
Beautiful HTML dashboard displayed directly in Apify's Output tab with:
- 📊 Stats overview (total jobs, sources, runtime)
- 🔍 Real-time search across all jobs
- 🎛️ Filter by source and location
- 🚀 Apply Now buttons for each job

### Dataset Output
Each job listing contains:
```json
{
    "jobTitle": "Backend Developer",
    "company": "Acme Inc",
    "location": "Remote",
    "source": "LinkedIn",
    "postedDate": "2024-01-15",
    "jobUrl": "https://linkedin.com/...",
    "applyLink": "https://apply.company.com/..."
}
```

## 💰 Pricing

This actor uses pay-per-event pricing:
- **1 credit** per successful run (daily-job-scan event)

## 📝 Example Usage

### Search for Tech Jobs in India
```json
{
    "roles": ["Software Engineer", "Data Analyst"],
    "location": "Bangalore",
    "sources": ["naukri", "linkedin", "instahyre", "cutshort"],
    "maxResultsPerSource": 50,
    "maxDaysOld": 3
}
```

### Search for Remote Jobs Worldwide
```json
{
    "roles": ["Frontend Developer", "Full Stack Developer"],
    "location": "Remote",
    "sources": ["remoteok", "weworkremotely", "flexjobs", "turing", "arc"],
    "maxResultsPerSource": 30,
    "maxDaysOld": 7
}
```

## 🚀 Getting Started

1. Click "Try for free" to run the actor
2. Enter your desired job roles
3. Select job platforms from the dropdown
4. Configure location and preferences
5. Run and get fresh job opportunities!

## 📞 Support

For issues or feature requests, please open an issue in the repository.

---

**Made with ❤️ for job seekers everywhere**
