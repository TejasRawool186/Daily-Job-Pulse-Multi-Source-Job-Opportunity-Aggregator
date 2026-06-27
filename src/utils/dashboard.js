/**
 * Dashboard Generator — v2.0
 * Enhanced with sorting, dark/light toggle, source chart, pagination, and keyboard nav.
 */

export function generateDashboard(jobs, stats) {
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // Build source breakdown for chart
    const sourceCounts = {};
    jobs.forEach(j => { sourceCounts[j.source] = (sourceCounts[j.source] || 0) + 1; });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Job Pulse — Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #6366f1; --primary-dark: #4f46e5; --primary-light: #818cf8;
            --secondary: #10b981; --accent: #f59e0b; --danger: #ef4444;
            --bg: #0f172a; --card: #1e293b; --border: #334155;
            --text: #f1f5f9; --text-sec: #94a3b8; --text-muted: #64748b;
            --grad1: linear-gradient(135deg, #667eea, #764ba2);
            --grad2: linear-gradient(135deg, #4facfe, #00f2fe);
        }
        [data-theme="light"] {
            --bg: #f8fafc; --card: #ffffff; --border: #e2e8f0;
            --text: #0f172a; --text-sec: #475569; --text-muted: #94a3b8;
        }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Inter',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; line-height:1.6; }
        .bg-anim { position:fixed; inset:0; z-index:-1; overflow:hidden; }
        .bg-anim::before { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%;
            background: radial-gradient(circle at 20% 80%, rgba(99,102,241,.12) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(139,92,246,.08) 0%, transparent 50%);
            animation: drift 25s ease-in-out infinite; }
        @keyframes drift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(2%,3%)} }
        .header { background:linear-gradient(135deg,#1e293b,#0f172a 50%,#1e1b4b); padding:2.5rem 2rem; text-align:center; border-bottom:1px solid var(--border); position:relative; }
        .logo { display:flex; align-items:center; justify-content:center; gap:.75rem; margin-bottom:.75rem; }
        .logo-icon { width:52px; height:52px; background:var(--grad1); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.6rem; box-shadow:0 8px 30px rgba(99,102,241,.3); }
        .header h1 { font-size:2.2rem; font-weight:700; background:linear-gradient(135deg,#fff,#c7d2fe); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .header p { color:var(--text-sec); font-size:1rem; margin-top:.25rem; }
        .date-badge { display:inline-flex; align-items:center; gap:.5rem; background:rgba(99,102,241,.15); padding:.4rem .9rem; border-radius:50px; margin-top:.75rem; font-size:.85rem; color:var(--primary-light); border:1px solid rgba(99,102,241,.25); }
        .toolbar { position:absolute; top:1rem; right:1rem; display:flex; gap:.5rem; }
        .toolbar button { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15); color:#fff; padding:.4rem .7rem; border-radius:8px; cursor:pointer; font-size:.85rem; transition:.2s; }
        .toolbar button:hover { background:rgba(255,255,255,.2); }
        .stats-container { max-width:1400px; margin:-1.5rem auto 1.5rem; padding:0 2rem; position:relative; z-index:10; }
        .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1.25rem; }
        .stat-card { background:var(--card); border-radius:14px; padding:1.25rem; border:1px solid var(--border); position:relative; overflow:hidden; transition:transform .3s,box-shadow .3s; }
        .stat-card:hover { transform:translateY(-3px); box-shadow:0 15px 35px rgba(0,0,0,.2); }
        .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; }
        .stat-card:nth-child(1)::before{background:var(--grad1)} .stat-card:nth-child(2)::before{background:var(--grad2)}
        .stat-card:nth-child(3)::before{background:linear-gradient(135deg,#10b981,#34d399)} .stat-card:nth-child(4)::before{background:linear-gradient(135deg,#f093fb,#f5576c)}
        .stat-card:nth-child(5)::before{background:linear-gradient(135deg,#f59e0b,#fbbf24)}
        .stat-icon { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; margin-bottom:.75rem; }
        .stat-card:nth-child(1) .stat-icon{background:rgba(99,102,241,.15)} .stat-card:nth-child(2) .stat-icon{background:rgba(79,172,254,.15)}
        .stat-card:nth-child(3) .stat-icon{background:rgba(16,185,129,.15)} .stat-card:nth-child(4) .stat-icon{background:rgba(245,87,108,.15)}
        .stat-card:nth-child(5) .stat-icon{background:rgba(245,158,11,.15)}
        .stat-value { font-size:1.9rem; font-weight:700; } .stat-label { color:var(--text-sec); font-size:.85rem; margin-top:.15rem; }
        .main { max-width:1400px; margin:0 auto; padding:0 2rem 3rem; }
        .source-chart { background:var(--card); border-radius:14px; padding:1.25rem; border:1px solid var(--border); margin-bottom:1.5rem; }
        .source-chart h3 { font-size:1rem; margin-bottom:.75rem; color:var(--text-sec); }
        .chart-bars { display:flex; flex-wrap:wrap; gap:.5rem; }
        .chart-bar { display:flex; align-items:center; gap:.5rem; padding:.35rem .7rem; background:rgba(99,102,241,.08); border-radius:8px; font-size:.8rem; }
        .chart-bar .count { font-weight:600; color:var(--primary-light); min-width:20px; }
        .filter-bar { background:var(--card); border-radius:14px; padding:1.25rem; margin-bottom:1.5rem; border:1px solid var(--border); display:flex; flex-wrap:wrap; gap:.75rem; align-items:center; }
        .search-box { flex:1; min-width:220px; position:relative; }
        .search-box input { width:100%; padding:.75rem .9rem .75rem 2.5rem; background:var(--bg); border:1px solid var(--border); border-radius:10px; color:var(--text); font-size:.9rem; transition:.3s; }
        .search-box input:focus { outline:none; border-color:var(--primary); box-shadow:0 0 0 3px rgba(99,102,241,.15); }
        .search-box::before { content:'🔍'; position:absolute; left:.8rem; top:50%; transform:translateY(-50%); font-size:.9rem; }
        .filter-select { padding:.75rem 2rem .75rem .9rem; background:var(--bg); border:1px solid var(--border); border-radius:10px; color:var(--text); font-size:.9rem; cursor:pointer; appearance:none;
            background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
            background-repeat:no-repeat; background-position:right .8rem center; }
        .filter-select:focus { outline:none; border-color:var(--primary); }
        .results-info { color:var(--text-sec); font-size:.85rem; padding:.25rem 0; }
        .jobs-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(360px,1fr)); gap:1.25rem; }
        .job-card { background:var(--card); border-radius:14px; padding:1.5rem; border:1px solid var(--border); transition:.3s; display:flex; flex-direction:column; position:relative; overflow:hidden; opacity:0; animation:fadeUp .4s ease forwards; }
        .job-card:hover { transform:translateY(-3px); box-shadow:0 15px 35px rgba(0,0,0,.25); border-color:var(--primary); }
        .job-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--grad1); opacity:0; transition:.3s; }
        .job-card:hover::before { opacity:1; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }
        .job-header { display:flex; align-items:flex-start; gap:.75rem; margin-bottom:.75rem; }
        .company-avatar { width:44px; height:44px; background:var(--grad1); border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.1rem; color:#fff; flex-shrink:0; }
        .job-title-section { flex:1; min-width:0; }
        .job-title { font-size:1.05rem; font-weight:600; line-height:1.35; margin-bottom:.15rem; }
        .company-name { color:var(--text-sec); font-size:.9rem; }
        .job-meta { display:flex; flex-wrap:wrap; gap:.5rem; margin-bottom:1rem; }
        .meta-tag { display:inline-flex; align-items:center; gap:.3rem; padding:.3rem .6rem; border-radius:6px; font-size:.78rem; color:var(--text-sec); }
        .meta-tag.loc { background:rgba(16,185,129,.1); color:#6ee7b7; }
        .meta-tag.src { background:rgba(245,158,11,.1); color:#fcd34d; }
        .meta-tag.date { background:rgba(79,172,254,.1); color:#7dd3fc; }
        .meta-tag.type { background:rgba(139,92,246,.1); color:#c4b5fd; }
        .job-actions { margin-top:auto; display:flex; gap:.6rem; }
        .apply-btn { flex:1; padding:.75rem 1rem; background:var(--grad1); border:none; border-radius:10px; color:#fff; font-weight:600; font-size:.9rem; cursor:pointer; transition:.3s; text-decoration:none; text-align:center; display:flex; align-items:center; justify-content:center; gap:.4rem; }
        .apply-btn:hover { transform:scale(1.02); box-shadow:0 8px 25px rgba(99,102,241,.35); }
        .view-btn { padding:.75rem .85rem; background:transparent; border:1px solid var(--border); border-radius:10px; color:var(--text-sec); cursor:pointer; transition:.3s; text-decoration:none; display:flex; align-items:center; justify-content:center; }
        .view-btn:hover { border-color:var(--primary); color:var(--primary); background:rgba(99,102,241,.08); }
        .empty-state { text-align:center; padding:3rem 2rem; background:var(--card); border-radius:14px; border:1px solid var(--border); grid-column:1/-1; }
        .empty-state .icon { font-size:3rem; margin-bottom:1rem; } .empty-state h3 { font-size:1.3rem; margin-bottom:.4rem; } .empty-state p { color:var(--text-sec); }
        .load-more { display:block; margin:1.5rem auto 0; padding:.8rem 2rem; background:var(--card); border:1px solid var(--border); border-radius:10px; color:var(--text); font-size:.9rem; cursor:pointer; transition:.3s; }
        .load-more:hover { border-color:var(--primary); background:rgba(99,102,241,.08); }
        .footer { text-align:center; padding:1.5rem; border-top:1px solid var(--border); color:var(--text-muted); font-size:.85rem; }
        .footer a { color:var(--primary-light); text-decoration:none; }
        @media(max-width:768px) {
            .header h1{font-size:1.6rem} .stats-grid{grid-template-columns:repeat(2,1fr)} .jobs-grid{grid-template-columns:1fr}
            .filter-bar{flex-direction:column} .search-box,.filter-select{width:100%}
        }
        ::-webkit-scrollbar{width:8px} ::-webkit-scrollbar-track{background:var(--bg)} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}
    </style>
</head>
<body>
    <div class="bg-anim"></div>
    <header class="header">
        <div class="toolbar">
            <button onclick="toggleTheme()" title="Toggle theme">🌓</button>
            <button onclick="exportCSV()" title="Export CSV">📥 CSV</button>
        </div>
        <div class="logo"><div class="logo-icon">💼</div><h1>Daily Job Pulse</h1></div>
        <p>Your daily dose of job opportunities from across the web</p>
        <div class="date-badge">📅 ${currentDate}</div>
    </header>
    <div class="stats-container"><div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-value">${jobs.length}</div><div class="stat-label">Jobs Found</div></div>
        <div class="stat-card"><div class="stat-icon">🌐</div><div class="stat-value">${stats.sourcesScanned||0}</div><div class="stat-label">Sources Scanned</div></div>
        <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-value">${stats.successfulSources||0}</div><div class="stat-label">Successful</div></div>
        <div class="stat-card"><div class="stat-icon">🎯</div><div class="stat-value">${stats.roles?.length||0}</div><div class="stat-label">Roles Searched</div></div>
        <div class="stat-card"><div class="stat-icon">⚡</div><div class="stat-value">${stats.runtime||'<1'}s</div><div class="stat-label">Duration</div></div>
    </div></div>
    <main class="main">
        <div class="source-chart"><h3>Jobs by Source</h3><div class="chart-bars">
            ${Object.entries(sourceCounts).sort((a,b)=>b[1]-a[1]).map(([s,c])=>`<div class="chart-bar"><span class="count">${c}</span>${esc(s)}</div>`).join('')}
        </div></div>
        <div class="filter-bar">
            <div class="search-box"><input type="text" id="searchInput" placeholder="Search jobs, companies, locations..." autocomplete="off"></div>
            <select class="filter-select" id="sourceFilter"><option value="">All Sources</option>${getOpts(jobs,'source')}</select>
            <select class="filter-select" id="locationFilter"><option value="">All Locations</option>${getOpts(jobs,'location',20)}</select>
            <select class="filter-select" id="sortSelect">
                <option value="date">Sort: Newest</option><option value="company">Sort: Company</option><option value="source">Sort: Source</option><option value="title">Sort: Title</option>
            </select>
        </div>
        <div class="results-info" id="resultsInfo"></div>
        <div class="jobs-grid" id="jobsGrid"></div>
        <button class="load-more" id="loadMore" style="display:none" onclick="loadMoreJobs()">Load More</button>
    </main>
    <footer class="footer"><p>Powered by <a href="https://apify.com" target="_blank">Apify</a> · Daily Job Pulse v2.0 © ${new Date().getFullYear()}</p></footer>
    <script>
    const ALL=${JSON.stringify(jobs)};
    const PAGE_SIZE=30;
    let filtered=[],page=1;
    const $=id=>document.getElementById(id);
    function esc(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML}
    function filterJobs(){
        const q=$('searchInput').value.toLowerCase(),src=$('sourceFilter').value,loc=$('locationFilter').value,sort=$('sortSelect').value;
        filtered=ALL.filter(j=>{
            const mq=!q||j.jobTitle.toLowerCase().includes(q)||j.company.toLowerCase().includes(q)||j.location.toLowerCase().includes(q);
            return mq&&(!src||j.source===src)&&(!loc||j.location===loc);
        });
        filtered.sort((a,b)=>{
            if(sort==='company')return(a.company||'').localeCompare(b.company||'');
            if(sort==='source')return(a.source||'').localeCompare(b.source||'');
            if(sort==='title')return(a.jobTitle||'').localeCompare(b.jobTitle||'');
            return(b.postedDate||'').localeCompare(a.postedDate||'');
        });
        page=1;renderJobs();
    }
    function renderJobs(){
        const show=filtered.slice(0,page*PAGE_SIZE);
        $('resultsInfo').textContent=filtered.length+' job'+(filtered.length!==1?'s':'')+' found';
        if(!show.length){$('jobsGrid').innerHTML='<div class="empty-state"><div class="icon">🔍</div><h3>No jobs found</h3><p>Try adjusting your search.</p></div>';$('loadMore').style.display='none';return;}
        $('jobsGrid').innerHTML=show.map((j,i)=>'<div class="job-card" style="animation-delay:'+(Math.min(i,8)*0.04)+'s">'
            +'<div class="job-header"><div class="company-avatar">'+esc((j.company||'J')[0].toUpperCase())+'</div>'
            +'<div class="job-title-section"><h3 class="job-title">'+esc(j.jobTitle)+'</h3><div class="company-name">🏢 '+esc(j.company)+'</div></div></div>'
            +'<div class="job-meta"><span class="meta-tag loc">📍 '+esc(j.location)+'</span><span class="meta-tag src">🌐 '+esc(j.source)+'</span>'
            +'<span class="meta-tag date">📅 '+(j.postedDate||'Recent')+'</span>'
            +(j.jobType&&j.jobType!=='onsite'?'<span class="meta-tag type">'+(j.jobType==='remote'?'🏠':'🔀')+' '+j.jobType+'</span>':'')
            +'</div><div class="job-actions"><a href="'+esc(j.applyLink)+'" target="_blank" rel="noopener" class="apply-btn">🚀 Apply Now</a>'
            +'<a href="'+(j.jobUrl||j.applyLink)+'" target="_blank" rel="noopener" class="view-btn" title="View Details">👁️</a></div></div>').join('');
        $('loadMore').style.display=show.length<filtered.length?'block':'none';
    }
    function loadMoreJobs(){page++;renderJobs();}
    function toggleTheme(){document.documentElement.dataset.theme=document.documentElement.dataset.theme==='light'?'':'light';}
    function exportCSV(){
        const h=['Job Title','Company','Location','Source','Posted Date','Apply Link','Job Type'];
        const rows=filtered.map(j=>[j.jobTitle,j.company,j.location,j.source,j.postedDate,j.applyLink,j.jobType||''].map(v=>'"'+(v||'').replace(/"/g,'""')+'"').join(','));
        const blob=new Blob([h.join(',')+String.fromCharCode(10)+rows.join(String.fromCharCode(10))],{type:'text/csv'});
        const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='jobs-'+new Date().toISOString().split('T')[0]+'.csv';a.click();
    }
    $('searchInput').addEventListener('input',filterJobs);
    $('sourceFilter').addEventListener('change',filterJobs);
    $('locationFilter').addEventListener('change',filterJobs);
    $('sortSelect').addEventListener('change',filterJobs);
    document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();$('searchInput').focus();}});
    filterJobs();
    </script>
</body></html>`;
}

function getOpts(jobs, field, max) {
    const vals = [...new Set(jobs.map(j => j[field]).filter(Boolean))].sort();
    return (max ? vals.slice(0, max) : vals).map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
}

function esc(t) {
    if (!t) return '';
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
