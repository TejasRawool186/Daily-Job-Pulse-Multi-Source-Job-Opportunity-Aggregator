# 🚀 Daily Job Pulse

**Multi-Source Job Opportunity Aggregator**

Scans multiple job platforms daily and aggregates the latest job opportunities with direct apply links. No AI, no API keys required.

## ✨ Features

- **Multi-Platform Scanning**: Aggregates jobs from RemoteOK, Indeed, Wellfound, and We Work Remotely
- **Direct Apply Links**: Every job listing includes a clickable apply link
- **Role-Based Search**: Search for multiple job roles simultaneously
- **Location Filtering**: Filter by country, city, or remote positions
- **Freshness Control**: Only get jobs posted within your specified timeframe
- **Zero API Keys**: Works without any external API keys
- **Graceful Failures**: If one source fails, others continue working
- **Deduplication**: Removes duplicate listings across platforms

## 📊 Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `roles` | Array | ✅ Yes | - | Job roles to search (e.g., ["Backend Developer", "Data Analyst"]) |
| `location` | String | No | "Remote" | Location filter (country, city, or "Remote") |
| `sources` | Array | No | ["remoteok", "weworkremotely"] | Platforms to scan |
| `maxResultsPerSource` | Number | No | 25 | Maximum jobs per platform |
| `maxDaysOld` | Number | No | 7 | Only include jobs posted within X days |

### Available Sources

- `remoteok` - RemoteOK (remote jobs)
- `indeed` - Indeed (all job types)
- `wellfound` - Wellfound/AngelList (startup jobs)
- `weworkremotely` - We Work Remotely (remote jobs)

## 📤 Output

Each job listing in the dataset contains:

```json
{
    "jobTitle": "Backend Developer",
    "company": "Acme Inc",
    "location": "Remote",
    "source": "RemoteOK",
    "postedDate": "2024-01-15",
    "jobUrl": "https://remoteok.com/...",
    "applyLink": "https://apply.company.com/..."
}
```

## 💡 Use Cases

- **Daily Job Search**: Run daily to get fresh job opportunities
- **Automation**: Connect to Zapier/Make for email alerts
- **Research**: Track job market trends
- **Recruiting**: Find candidates posting resumes on job boards

## 💰 Pricing

This actor uses pay-per-event pricing:
- **1 credit** per successful run (daily-job-scan event)

## 🔧 Technical Details

- Built with Apify SDK & Crawlee
- Uses Cheerio for HTML parsing
- Modular scraper architecture for easy extension
- Graceful error handling - partial failures don't crash the actor

## 📝 Example Usage

### Basic Search
```json
{
    "roles": ["Software Engineer", "Frontend Developer"],
    "location": "Remote"
}
```

### Advanced Search
```json
{
    "roles": ["Data Scientist", "ML Engineer", "AI Engineer"],
    "location": "United States",
    "sources": ["remoteok", "indeed", "wellfound", "weworkremotely"],
    "maxResultsPerSource": 50,
    "maxDaysOld": 3
}
```

## 🚀 Getting Started

1. Click "Try for free" to run the actor
2. Enter your desired job roles
3. Configure location and source preferences
4. Run and get fresh job opportunities!

## 📞 Support

For issues or feature requests, please open an issue in the repository.

---

**Made with ❤️ for job seekers everywhere**
