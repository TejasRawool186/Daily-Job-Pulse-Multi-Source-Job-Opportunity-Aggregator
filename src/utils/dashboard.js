/**
 * Dashboard Generator
 * 
 * Generates a beautiful, interactive HTML dashboard
 * to display all scraped job listings
 */

/**
 * Generate an interactive HTML dashboard
 * @param {Array} jobs - Array of job listings
 * @param {Object} stats - Scraping statistics
 * @returns {string} - HTML content
 */
export function generateDashboard(jobs, stats) {
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Job Pulse - Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --primary-light: #818cf8;
            --secondary: #10b981;
            --accent: #f59e0b;
            --danger: #ef4444;
            --dark: #0f172a;
            --dark-card: #1e293b;
            --dark-border: #334155;
            --text-primary: #f1f5f9;
            --text-secondary: #94a3b8;
            --text-muted: #64748b;
            --gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --gradient-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --gradient-3: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --gradient-hero: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--dark);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.6;
        }

        /* Animated Background */
        .bg-animation {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: -1;
        }

        .bg-animation::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.08) 0%, transparent 50%);
            animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(2%, 2%) rotate(1deg); }
            50% { transform: translate(0, 4%) rotate(0deg); }
            75% { transform: translate(-2%, 2%) rotate(-1deg); }
        }

        /* Header */
        .header {
            background: var(--gradient-hero);
            padding: 3rem 2rem;
            text-align: center;
            border-bottom: 1px solid var(--dark-border);
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .logo-icon {
            width: 60px;
            height: 60px;
            background: var(--gradient-1);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #fff 0%, #c7d2fe 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header p {
            color: var(--text-secondary);
            font-size: 1.1rem;
            margin-top: 0.5rem;
        }

        .date-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(99, 102, 241, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 50px;
            margin-top: 1rem;
            font-size: 0.9rem;
            color: var(--primary-light);
            border: 1px solid rgba(99, 102, 241, 0.3);
        }

        /* Stats Grid */
        .stats-container {
            max-width: 1400px;
            margin: -2rem auto 2rem;
            padding: 0 2rem;
            position: relative;
            z-index: 10;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
        }

        .stat-card {
            background: var(--dark-card);
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid var(--dark-border);
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
        }

        .stat-card:nth-child(1)::before { background: var(--gradient-1); }
        .stat-card:nth-child(2)::before { background: var(--gradient-3); }
        .stat-card:nth-child(3)::before { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); }
        .stat-card:nth-child(4)::before { background: var(--gradient-2); }

        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }

        .stat-card:nth-child(1) .stat-icon { background: rgba(99, 102, 241, 0.2); }
        .stat-card:nth-child(2) .stat-icon { background: rgba(79, 172, 254, 0.2); }
        .stat-card:nth-child(3) .stat-icon { background: rgba(16, 185, 129, 0.2); }
        .stat-card:nth-child(4) .stat-icon { background: rgba(245, 87, 108, 0.2); }

        .stat-value {
            font-size: 2.2rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .stat-label {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-top: 0.25rem;
        }

        /* Main Content */
        .main-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 2rem 4rem;
        }

        /* Filter Bar */
        .filter-bar {
            background: var(--dark-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border: 1px solid var(--dark-border);
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: center;
        }

        .search-box {
            flex: 1;
            min-width: 250px;
            position: relative;
        }

        .search-box input {
            width: 100%;
            padding: 0.875rem 1rem 0.875rem 3rem;
            background: var(--dark);
            border: 1px solid var(--dark-border);
            border-radius: 12px;
            color: var(--text-primary);
            font-size: 0.95rem;
            transition: all 0.3s ease;
        }

        .search-box input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .search-box::before {
            content: '🔍';
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            font-size: 1rem;
        }

        .filter-select {
            padding: 0.875rem 2.5rem 0.875rem 1rem;
            background: var(--dark);
            border: 1px solid var(--dark-border);
            border-radius: 12px;
            color: var(--text-primary);
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.3s ease;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1rem center;
        }

        .filter-select:focus {
            outline: none;
            border-color: var(--primary);
        }

        /* Jobs Grid */
        .jobs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
            gap: 1.5rem;
        }

        /* Job Card */
        .job-card {
            background: var(--dark-card);
            border-radius: 16px;
            padding: 1.75rem;
            border: 1px solid var(--dark-border);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
        }

        .job-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border-color: var(--primary);
        }

        .job-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--gradient-1);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .job-card:hover::before {
            opacity: 1;
        }

        .job-header {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .company-avatar {
            width: 50px;
            height: 50px;
            background: var(--gradient-1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.2rem;
            color: white;
            flex-shrink: 0;
        }

        .job-title-section {
            flex: 1;
            min-width: 0;
        }

        .job-title {
            font-size: 1.15rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
            line-height: 1.4;
        }

        .company-name {
            color: var(--text-secondary);
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .job-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
        }

        .meta-tag {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.4rem 0.75rem;
            background: rgba(99, 102, 241, 0.1);
            border-radius: 8px;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        .meta-tag.location {
            background: rgba(16, 185, 129, 0.1);
            color: #6ee7b7;
        }

        .meta-tag.source {
            background: rgba(245, 158, 11, 0.1);
            color: #fcd34d;
        }

        .meta-tag.date {
            background: rgba(79, 172, 254, 0.1);
            color: #7dd3fc;
        }

        .job-actions {
            margin-top: auto;
            display: flex;
            gap: 0.75rem;
        }

        .apply-btn {
            flex: 1;
            padding: 0.875rem 1.5rem;
            background: var(--gradient-1);
            border: none;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .apply-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
        }

        .view-btn {
            padding: 0.875rem 1rem;
            background: transparent;
            border: 1px solid var(--dark-border);
            border-radius: 12px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .view-btn:hover {
            border-color: var(--primary);
            color: var(--primary);
            background: rgba(99, 102, 241, 0.1);
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            background: var(--dark-card);
            border-radius: 16px;
            border: 1px solid var(--dark-border);
        }

        .empty-state .icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
        }

        .empty-state h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .empty-state p {
            color: var(--text-secondary);
        }

        /* Footer */
        .footer {
            text-align: center;
            padding: 2rem;
            border-top: 1px solid var(--dark-border);
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .footer a {
            color: var(--primary-light);
            text-decoration: none;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8rem;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .jobs-grid {
                grid-template-columns: 1fr;
            }

            .filter-bar {
                flex-direction: column;
            }

            .search-box {
                width: 100%;
            }

            .filter-select {
                width: 100%;
            }
        }

        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .job-card {
            animation: fadeInUp 0.5s ease forwards;
        }

        .job-card:nth-child(1) { animation-delay: 0.05s; }
        .job-card:nth-child(2) { animation-delay: 0.1s; }
        .job-card:nth-child(3) { animation-delay: 0.15s; }
        .job-card:nth-child(4) { animation-delay: 0.2s; }
        .job-card:nth-child(5) { animation-delay: 0.25s; }
        .job-card:nth-child(6) { animation-delay: 0.3s; }

        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 10px;
        }

        ::-webkit-scrollbar-track {
            background: var(--dark);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--dark-border);
            border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--text-muted);
        }
    </style>
</head>
<body>
    <div class="bg-animation"></div>

    <header class="header">
        <div class="logo">
            <div class="logo-icon">💼</div>
            <h1>Daily Job Pulse</h1>
        </div>
        <p>Your daily dose of job opportunities from across the web</p>
        <div class="date-badge">
            📅 ${currentDate}
        </div>
    </header>

    <div class="stats-container">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-value">${jobs.length}</div>
                <div class="stat-label">Total Jobs Found</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🌐</div>
                <div class="stat-value">${stats.sourcesScanned || 0}</div>
                <div class="stat-label">Sources Scanned</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-value">${stats.roles?.length || 0}</div>
                <div class="stat-label">Roles Searched</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⚡</div>
                <div class="stat-value">${stats.runtime || '< 1'}s</div>
                <div class="stat-label">Scan Duration</div>
            </div>
        </div>
    </div>

    <main class="main-content">
        <div class="filter-bar">
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="Search jobs, companies, or locations..." autocomplete="off">
            </div>
            <select class="filter-select" id="sourceFilter">
                <option value="">All Sources</option>
                ${getUniqueSourcesOptions(jobs)}
            </select>
            <select class="filter-select" id="locationFilter">
                <option value="">All Locations</option>
                ${getUniqueLocationsOptions(jobs)}
            </select>
        </div>

        <div class="jobs-grid" id="jobsGrid">
            ${jobs.length > 0 ? jobs.map(job => generateJobCard(job)).join('') : `
                <div class="empty-state">
                    <div class="icon">🔍</div>
                    <h3>No jobs found</h3>
                    <p>Try adjusting your search criteria or check back later.</p>
                </div>
            `}
        </div>
    </main>

    <footer class="footer">
        <p>Powered by <a href="https://apify.com" target="_blank">Apify</a> • Daily Job Pulse © ${new Date().getFullYear()}</p>
    </footer>

    <script>
        // Store all jobs for filtering
        const allJobs = ${JSON.stringify(jobs)};

        // Search and filter functionality
        const searchInput = document.getElementById('searchInput');
        const sourceFilter = document.getElementById('sourceFilter');
        const locationFilter = document.getElementById('locationFilter');
        const jobsGrid = document.getElementById('jobsGrid');

        function filterJobs() {
            const searchTerm = searchInput.value.toLowerCase();
            const selectedSource = sourceFilter.value;
            const selectedLocation = locationFilter.value;

            const filteredJobs = allJobs.filter(job => {
                const matchesSearch = !searchTerm || 
                    job.jobTitle.toLowerCase().includes(searchTerm) ||
                    job.company.toLowerCase().includes(searchTerm) ||
                    job.location.toLowerCase().includes(searchTerm);

                const matchesSource = !selectedSource || job.source === selectedSource;
                const matchesLocation = !selectedLocation || job.location === selectedLocation;

                return matchesSearch && matchesSource && matchesLocation;
            });

            renderJobs(filteredJobs);
        }

        function renderJobs(jobs) {
            if (jobs.length === 0) {
                jobsGrid.innerHTML = \`
                    <div class="empty-state">
                        <div class="icon">🔍</div>
                        <h3>No jobs found</h3>
                        <p>Try adjusting your search criteria.</p>
                    </div>
                \`;
                return;
            }

            jobsGrid.innerHTML = jobs.map(job => \`
                <div class="job-card">
                    <div class="job-header">
                        <div class="company-avatar">\${job.company.charAt(0).toUpperCase()}</div>
                        <div class="job-title-section">
                            <h3 class="job-title">\${escapeHtml(job.jobTitle)}</h3>
                            <div class="company-name">🏢 \${escapeHtml(job.company)}</div>
                        </div>
                    </div>
                    <div class="job-meta">
                        <span class="meta-tag location">📍 \${escapeHtml(job.location)}</span>
                        <span class="meta-tag source">🌐 \${escapeHtml(job.source)}</span>
                        <span class="meta-tag date">📅 \${job.postedDate || 'Recent'}</span>
                    </div>
                    <div class="job-actions">
                        <a href="\${job.applyLink}" target="_blank" rel="noopener" class="apply-btn">
                            🚀 Apply Now
                        </a>
                        <a href="\${job.jobUrl || job.applyLink}" target="_blank" rel="noopener" class="view-btn" title="View Details">
                            👁️
                        </a>
                    </div>
                </div>
            \`).join('');
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        searchInput.addEventListener('input', filterJobs);
        sourceFilter.addEventListener('change', filterJobs);
        locationFilter.addEventListener('change', filterJobs);
    </script>
</body>
</html>`;
}

/**
 * Generate a single job card HTML
 */
function generateJobCard(job) {
    const companyInitial = (job.company || 'J').charAt(0).toUpperCase();

    return `
        <div class="job-card">
            <div class="job-header">
                <div class="company-avatar">${companyInitial}</div>
                <div class="job-title-section">
                    <h3 class="job-title">${escapeHtml(job.jobTitle)}</h3>
                    <div class="company-name">🏢 ${escapeHtml(job.company)}</div>
                </div>
            </div>
            <div class="job-meta">
                <span class="meta-tag location">📍 ${escapeHtml(job.location)}</span>
                <span class="meta-tag source">🌐 ${escapeHtml(job.source)}</span>
                <span class="meta-tag date">📅 ${job.postedDate || 'Recent'}</span>
            </div>
            <div class="job-actions">
                <a href="${job.applyLink}" target="_blank" rel="noopener" class="apply-btn">
                    🚀 Apply Now
                </a>
                <a href="${job.jobUrl || job.applyLink}" target="_blank" rel="noopener" class="view-btn" title="View Details">
                    👁️
                </a>
            </div>
        </div>
    `;
}

/**
 * Get unique sources as option elements
 */
function getUniqueSourcesOptions(jobs) {
    const sources = [...new Set(jobs.map(j => j.source).filter(Boolean))];
    return sources.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
}

/**
 * Get unique locations as option elements
 */
function getUniqueLocationsOptions(jobs) {
    const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))];
    return locations.slice(0, 20).map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join('');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
