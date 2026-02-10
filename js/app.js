/**
 * InsightHub Main Application v2
 * Author: Zul Suriya | Premium B2B UI
 */
class InsightHubApp {
  constructor(){this.page='dashboard';this.search='';this.fISme='';this.fMSme='';this.fTag='';}

  async init(){
    document.body.innerHTML='<div class="loading"><div class="loading-inner"><div class="spinner"></div><p style="margin-top:12px;color:var(--text-2)">Connecting to database...</p></div></div>';
    const ok=await db.init();
    if(!ok){document.body.innerHTML='<div class="loading"><div class="loading-inner"><p style="font-size:24px;margin-bottom:12px">⚠️</p><h2 style="margin-bottom:8px">Connection Error</h2><p style="color:var(--text-2);margin-bottom:16px">Could not connect to Google Sheets.</p><button class="btn btn-p" onclick="location.reload()">Retry</button></div></div>';return;}
    this.render();this.bind();this.nav('dashboard');
    document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();this.goSearch();}});
  }

  goSearch(){const s=document.getElementById('topSearch');if(s){s.focus();s.select();}}
  liveSearch(q){const sr=document.getElementById('searchResults');if(!q||q.length<2){sr.innerHTML='';return;}const s=q.toLowerCase();const emps=db.getEmployees().filter(e=>e.name.toLowerCase().includes(s)||(e.email||'').toLowerCase().includes(s)||(e.job_title||'').toLowerCase().includes(s)).slice(0,8);if(!emps.length){sr.innerHTML='<div class="sr-empty">No results</div>';return;}sr.innerHTML=emps.map(e=>'<a class="sr-item" href="#" onclick="app.viewEmp('+e.id+');document.getElementById(\'searchResults\').innerHTML=\'\';document.getElementById(\'topSearch\').value=\'\';return false"><strong>'+this.esc(e.name)+'</strong><span class="text-xs">'+this.esc(e.job_title||'')+' · '+this.esc((e.industry_sme||'')+(e.module_sme?', '+e.module_sme:''))+'</span></a>').join('');}

  render(){
    document.body.innerHTML=`
    <div class="app">
      <div class="overlay" id="ov"></div>
      <aside class="sidebar" id="sb">
        <div class="logo"><svg width="24" height="24" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#6366f1"/><path d="M14 34V20h5v14h-5zm7.5-20V34h5V14h-5zM29 24v10h5V24h-5z" fill="white"/></svg> InsightHub</div>
        <nav class="nav">
          <a href="#" class="active" data-p="dashboard"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>Dashboard</a>
          <a href="#" data-p="employees"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>Employees</a>
          <a href="#" data-p="training"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>Training</a>
          <a href="#" data-p="surveys"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>Surveys</a>
        </nav>
        <div class="sidebar-ft">
          <button class="btn btn-g btn-sm" id="backupBtn">💾 Backup</button>
          <button class="btn btn-g btn-sm" id="restoreBtn">📂 Restore</button>
          <button class="btn btn-g btn-sm" id="resetBtn">↻ Reset Demo</button>
        </div>
      </aside>
      <main class="main">
        <div class="topbar">
          <button class="menu-btn" id="menuBtn"><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg></button>
          <h2 id="pageTitle">Dashboard</h2>
          <div class="topbar-actions">
            <button class="search-global" id="searchBtn">🔍 Search <kbd>⌘K</kbd></button>
            <button class="btn btn-s btn-sm" id="exportBtn">📥 Export</button>
          </div>
        </div>
        <div class="content" id="cw"></div>
      </main>
    </div>
    <div id="mc"></div>
    <input type="file" id="restoreFile" accept=".json" style="display:none">`;
  }

  bind(){
    document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();this.nav(a.dataset.p);this.closeMenu();}));
    document.getElementById('menuBtn').addEventListener('click',()=>this.toggleMenu());
    document.getElementById('ov').addEventListener('click',()=>this.closeMenu());
    document.getElementById('topSearch').addEventListener('input',(ev)=>{this.liveSearch(ev.target.value);});
    document.getElementById('topSearch').addEventListener('focus',(ev)=>{if(ev.target.value)this.liveSearch(ev.target.value);});
    document.addEventListener('click',(ev)=>{if(!ev.target.closest('.search-wrap'))document.getElementById('searchResults').innerHTML='';});
    document.getElementById('exportBtn').addEventListener('click',()=>this.exportCSV());
    document.getElementById('resetBtn').addEventListener('click',async()=>{if(confirm('Reset all data to demo defaults?')){this.loading('Resetting...');await db.resetDatabase();this.nav(this.page);this.notify('Database reset','ok');}});
    document.getElementById('backupBtn').addEventListener('click',()=>{const b=db.createBackup();const bl=new Blob([JSON.stringify(b,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='insighthub-backup-'+new Date().toISOString().split('T')[0]+'.json';a.click();URL.revokeObjectURL(a.href);this.notify('Backup downloaded','ok');});
    document.getElementById('restoreBtn').addEventListener('click',()=>document.getElementById('restoreFile').click());
    document.getElementById('restoreFile').addEventListener('change',async ev=>{const file=ev.target.files[0];if(!file)return;try{const txt=await file.text();const b=JSON.parse(txt);this.loading('Restoring...');await db.restoreBackup(b);this.nav(this.page);this.notify('Backup restored','ok');}catch(er){this.notify('Restore failed: '+er.message,'err');}ev.target.value='';});
  }

  toggleMenu(){document.getElementById('sb').classList.toggle('open');document.getElementById('ov').classList.toggle('active');}
  closeMenu(){document.getElementById('sb').classList.remove('open');document.getElementById('ov').classList.remove('active');}
  nav(p){this.page=p;this.search='';this.fISme='';this.fMSme='';this.fTag='';document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('active',a.dataset.p===p));const t={dashboard:'Dashboard',employees:'Employees',training:'Training & Courses',surveys:'Surveys'};document.getElementById('pageTitle').textContent=t[p]||'InsightHub';const cw=document.getElementById('cw');cw.innerHTML='<div class="page-load"><div class="spinner"></div></div>';switch(p){case 'dashboard':this.dashPage(cw);break;case 'employees':this.empPage(cw);break;case 'training':this.trainPage(cw);break;case 'surveys':this.surveyPage(cw);break;}}
  loading(m){document.getElementById('cw').innerHTML='<div class="page-load"><div class="spinner"></div><p style="margin-top:12px;color:var(--text-2)">'+this.esc(m)+'</p></div>';}

  // ─── DASHBOARD ─────────────────────────────────────────────
  async dashPage(cw){
    try{
      const a=db.getAnalytics(),acts=db.getActivityLog(10),emps=db.getEmployees(),courses=db.getCourses();
      const today=new Date().toISOString().split('T')[0];
      const reviews=emps.filter(e=>e.next_review_date).map(e=>({name:e.name,id:e.id,date:e.next_review_date,over:e.next_review_date<today})).sort((x,y)=>x.date.localeCompare(y.date)).slice(0,6);
      const iSme=db.getSmeCategories('industry'),mSme=db.getSmeCategories('module');
      const smeCov={};iSme.forEach(s=>{smeCov[s.sme_value]=emps.filter(e=>(e.industry_sme||'').split(',').map(x=>x.trim()).includes(s.sme_value)).length;});
      const spof=[];
      iSme.forEach(s=>{if(emps.filter(e=>(e.industry_sme||'').split(',').map(x=>x.trim()).includes(s.sme_value)).length===1)spof.push(s.sme_value);});
      mSme.forEach(s=>{if(emps.filter(e=>(e.module_sme||'').split(',').map(x=>x.trim()).includes(s.sme_value)).length===1)spof.push(s.sme_value);});
      const compRate=a.totalCourses>0?Math.round(a.coursesComplete/a.totalCourses*100):0;
      const ipRate=a.totalCourses>0?Math.round(a.coursesInProgress/a.totalCourses*100):0;
      const odRate=a.totalCourses>0?Math.round(a.coursesOverdue/a.totalCourses*100):0;

      cw.innerHTML=`
        <div class="stats">
          <div class="stat"><div class="stat-label">Total Employees</div><div class="stat-val">${a.totalEmployees}</div></div>
          <div class="stat"><div class="stat-label">Industry SMEs</div><div class="stat-val">${a.industryCovered}<span class="stat-sub"> / ${a.industrySmeTotal} covered</span></div></div>
          <div class="stat"><div class="stat-label">Module SMEs</div><div class="stat-val">${a.moduleCovered}<span class="stat-sub"> / ${a.moduleSmeTotal} covered</span></div></div>
          <div class="stat"><div class="stat-label">Upcoming Reviews</div><div class="stat-val">${a.upcomingReviews}</div></div>
        </div>
        <div class="g2 mb-lg">
          <div class="card"><div class="card-hd"><h3>SME Coverage</h3></div><div style="height:220px;position:relative"><canvas id="smeChart"></canvas></div></div>
          <div class="card"><div class="card-hd"><h3>Training Status</h3></div><div style="height:220px;position:relative"><canvas id="trainChart"></canvas></div>
            <div style="margin-top:16px">
              <div class="progress-row"><label>Completed</label><div class="progress-wrap"><div class="progress-fill pf-success" style="width:${compRate}%"></div></div><span>${compRate}%</span></div>
              <div class="progress-row"><label>In Progress</label><div class="progress-wrap"><div class="progress-fill pf-warning" style="width:${ipRate}%"></div></div><span>${a.coursesInProgress}</span></div>
              <div class="progress-row"><label>Overdue</label><div class="progress-wrap"><div class="progress-fill pf-danger" style="width:${odRate}%"></div></div><span class="text-danger">${a.coursesOverdue}</span></div>
            </div>
          </div>
        </div>
        ${spof.length?`<div class="card mb" style="border-left:3px solid var(--warning)"><strong>⚠️ Single Point of Failure:</strong> <span class="text-sm">${spof.join(', ')} — only 1 expert each</span></div>`:''}
        <div class="g2 mb-lg">
          <div class="card"><div class="card-hd"><h3>Upcoming Reviews</h3></div>
            ${reviews.length?reviews.map(r=>`<div class="review-row"><a href="#" onclick="app.viewEmp(${r.id});return false" style="text-decoration:none;color:var(--text)">${this.esc(r.name)}</a><span class="text-sm ${r.over?'text-danger':''}">${r.over?'⚠️ ':''}${this.fmtDate(r.date)}</span></div>`).join(''):'<p class="empty">No upcoming reviews</p>'}
          </div>
          <div class="card"><div class="card-hd"><h3>Recent Activity</h3></div>
            <div class="activity">${acts.length?acts.map(x=>`<div class="act-item"><div class="act-dot"></div><div><span class="fw-600">${this.esc(x.action)}</span>${x.details?' — <span class="text-muted">'+this.esc(x.details)+'</span>':''}<div class="act-time">${this.timeAgo(x.created_at)}</div></div></div>`).join(''):'<p class="empty">No activity</p>'}</div>
          </div>
        </div>`;
      if(typeof Chart!=='undefined'){
        const sl=Object.keys(smeCov),sd=Object.values(smeCov);
        if(sl.length)new Chart(document.getElementById('smeChart'),{type:'bar',data:{labels:sl,datasets:[{label:'Experts',data:sd,backgroundColor:'#6366f1',borderRadius:4,barThickness:24}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}},x:{grid:{display:false}}}}});
        new Chart(document.getElementById('trainChart'),{type:'doughnut',data:{labels:['Completed','In Progress','Not Started'],datasets:[{data:[a.coursesComplete,a.coursesInProgress,a.totalCourses-a.coursesComplete-a.coursesInProgress],backgroundColor:['#10b981','#f59e0b','#6366f1'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'right',labels:{usePointStyle:true,pointStyle:'circle',padding:12,font:{size:12}}}}}});
      }
    }catch(e){cw.innerHTML=`<div class="empty"><p>Error: ${e.message}</p><button class="btn btn-p" onclick="app.nav('dashboard')">Retry</button></div>`;}
  }

  // ─── EMPLOYEES PAGE ────────────────────────────────────────
  async empPage(cw){
    try{
      const emps=db.getEmployees(),tags=db.getAllTags(),skills=db.getAllSkills();
      const tagMap={};tags.forEach(t=>{if(!tagMap[t.employee_id])tagMap[t.employee_id]=[];tagMap[t.employee_id].push(t);});
      const iSme=[...new Set(emps.flatMap(e=>(e.industry_sme||'').split(',').map(x=>x.trim()).filter(Boolean)))].sort();
      const mSme=[...new Set(emps.flatMap(e=>(e.module_sme||'').split(',').map(x=>x.trim()).filter(Boolean)))].sort();
      const tagNames=[...new Set(tags.map(t=>t.tag_name))].sort();
      cw.innerHTML=`
        <div class="toolbar">
          <div class="filters">
            <input type="text" class="inp" id="empSearch" placeholder="Search by name, email, title..." style="max-width:280px" value="${this.escAttr(this.search)}">
            <select class="sel" id="fISme"><option value="">All Industry SMEs</option>${iSme.map(s=>`<option value="${this.escAttr(s)}">${this.esc(s)}</option>`).join('')}</select>
            <select class="sel" id="fMSme"><option value="">All Module SMEs</option>${mSme.map(s=>`<option value="${this.escAttr(s)}">${this.esc(s)}</option>`).join('')}</select>
            <select class="sel" id="fTag"><option value="">All Tags</option>${tagNames.map(t=>`<option value="${this.escAttr(t)}">${this.esc(t)}</option>`).join('')}</select>
          </div>
          <button class="btn btn-p" id="addEmpBtn">+ Add Employee</button>
        </div>
        <div class="card"><div class="tbl-wrap" id="empTbl">${this.empTbl(emps,tagMap)}</div></div>`;
      document.getElementById('addEmpBtn').addEventListener('click',()=>this.empModal());
      const doFilter=()=>{this.search=document.getElementById('empSearch').value;this.fISme=document.getElementById('fISme').value;this.fMSme=document.getElementById('fMSme').value;this.fTag=document.getElementById('fTag').value;document.getElementById('empTbl').innerHTML=this.empTbl(emps,tagMap);};
      document.getElementById('empSearch').addEventListener('input',doFilter);
      ['fISme','fMSme','fTag'].forEach(id=>document.getElementById(id).addEventListener('change',doFilter));
    }catch(e){cw.innerHTML=`<div class="empty"><p>${e.message}</p></div>`;}
  }

  empTbl(emps,tagMap){
    let f=emps;
    if(this.search){const s=this.search.toLowerCase();f=f.filter(e=>e.name.toLowerCase().includes(s)||(e.email||'').toLowerCase().includes(s)||(e.job_title||'').toLowerCase().includes(s));}
    if(this.fISme)f=f.filter(e=>(e.industry_sme||'').split(',').map(x=>x.trim()).includes(this.fISme));
    if(this.fMSme)f=f.filter(e=>(e.module_sme||'').split(',').map(x=>x.trim()).includes(this.fMSme));
    if(this.fTag)f=f.filter(e=>(tagMap[e.id]||[]).some(t=>t.tag_name===this.fTag));
    if(!f.length)return`<div class="empty"><h3>No employees found</h3><p>${this.search||this.fISme||this.fTag?'Adjust your filters':'Add your first employee'}</p></div>`;
    return`<table><thead><tr><th>Name</th><th class="hide-m">Title</th><th class="hide-t">SMEs</th><th class="hide-m">Tags</th><th></th></tr></thead><tbody>${f.map(e=>{
      const ts=tagMap[e.id]||[];
      const iSmeStr=e.industry_sme||'';const mSmeStr=e.module_sme||'';
      return`<tr><td><a href="#" onclick="app.viewEmp(${e.id});return false" style="color:var(--text);text-decoration:none"><strong>${this.esc(e.name)}</strong></a><div class="text-xs">${this.esc(e.email||'')}</div></td><td class="hide-m">${this.esc(e.job_title||'')}</td><td class="hide-t text-sm">${iSmeStr?`<div><span class="badge badge-p" style="margin-right:3px;font-size:10px">Ind</span>${this.esc(iSmeStr)}</div>`:''} ${mSmeStr?`<div style="margin-top:2px"><span class="badge badge-s" style="margin-right:3px;font-size:10px">Mod</span>${this.esc(mSmeStr)}</div>`:''}</td><td class="hide-m">${ts.map(t=>`<span class="tag" style="background:${t.tag_color}18;color:${t.tag_color};border:1px solid ${t.tag_color}30">${this.esc(t.tag_name)}</span>`).join(' ')}</td><td><div class="act-btns"><button class="btn btn-g btn-sm" onclick="app.viewEmp(${e.id})">View</button><button class="btn btn-g btn-sm btn-d" onclick="app.delEmp(${e.id})">✕</button></div></td></tr>`;
    }).join('')}</tbody></table>`;
  }

  // ─── EMPLOYEE MODAL ────────────────────────────────────────
  async empModal(id=null){
    const e=id?db.getEmployee(id):null,edit=!!e;
    const iSme=db.getSmeCategories('industry').map(s=>s.sme_value);
    const mSme=db.getSmeCategories('module').map(s=>s.sme_value);
    const curI=(e?.industry_sme||'').split(',').map(x=>x.trim()).filter(Boolean);
    const curM=(e?.module_sme||'').split(',').map(x=>x.trim()).filter(Boolean);
    document.getElementById('mc').innerHTML=`
      <div class="modal-bg" id="empMod">
        <div class="modal modal-lg">
          <div class="modal-hd"><h3>${edit?'Edit':'Add'} Employee</h3><button class="modal-x" onclick="app.closeM('empMod')">×</button></div>
          <div class="modal-body">
            <form id="empForm">
              <div class="fg"><label class="fl">Name *</label><input class="inp" name="name" value="${this.escAttr(e?.name||'')}" required></div>
              <div class="form-row"><div class="fg"><label class="fl">Email</label><input class="inp" name="email" type="email" value="${this.escAttr(e?.email||'')}"></div><div class="fg"><label class="fl">Job Title</label><input class="inp" name="job_title" value="${this.escAttr(e?.job_title||'')}"></div></div>
              <div class="form-row">
                <div class="fg"><label class="fl">Industry SME</label><div class="chips" id="iChips">${curI.map(s=>`<span class="chip">${this.esc(s)} <button type="button" class="x" onclick="this.parentElement.remove();app.updSmeHidden()">×</button></span>`).join('')}</div><select class="sel inp-sm" id="addI" style="margin-top:6px"><option value="">+ Add industry...</option>${iSme.filter(s=>!curI.includes(s)).map(s=>`<option>${this.esc(s)}</option>`).join('')}<option value="__new">+ New...</option></select><input type="hidden" name="industry_sme" value="${this.escAttr(e?.industry_sme||'')}"></div>
                <div class="fg"><label class="fl">Module SME</label><div class="chips" id="mChips">${curM.map(s=>`<span class="chip">${this.esc(s)} <button type="button" class="x" onclick="this.parentElement.remove();app.updSmeHidden()">×</button></span>`).join('')}</div><select class="sel inp-sm" id="addM" style="margin-top:6px"><option value="">+ Add module...</option>${mSme.filter(s=>!curM.includes(s)).map(s=>`<option>${this.esc(s)}</option>`).join('')}<option value="__new">+ New...</option></select><input type="hidden" name="module_sme" value="${this.escAttr(e?.module_sme||'')}"></div>
              </div>
              <div class="form-row"><div class="fg"><label class="fl">Start Date</label><input class="inp" name="start_date" type="date" value="${e?.start_date||''}"></div><div class="fg"><label class="fl">Next Review</label><input class="inp" name="next_review_date" type="date" value="${e?.next_review_date||''}"></div></div>
              <div class="fg"><label class="fl">Qualifications</label><textarea class="inp" name="qualifications">${this.esc(e?.qualifications||'')}</textarea></div>
            </form>
          </div>
          <div class="save-bar"><button class="btn btn-s" onclick="app.closeM('empMod')">Cancel</button><button class="btn btn-p" id="saveEmpBtn" style="min-width:200px">${edit?'Save Changes':'Save Employee'}</button></div>
        </div>
      </div>`;
    const addSmeChip=(sel,cont)=>{sel.addEventListener('change',async function(){let v=this.value;if(v==='__new'){v=prompt('Enter new value:');if(v)await db.addSmeCategory(cont==='iChips'?'industry':'module',v);}if(!v||v==='__new'){this.value='';return;}document.getElementById(cont).insertAdjacentHTML('beforeend',`<span class="chip">${v} <button type="button" class="x" onclick="this.parentElement.remove();app.updSmeHidden()">×</button></span>`);app.updSmeHidden();this.value='';});};
    addSmeChip(document.getElementById('addI'),'iChips');
    addSmeChip(document.getElementById('addM'),'mChips');
    document.getElementById('saveEmpBtn').addEventListener('click',async()=>{const form=document.getElementById('empForm');if(!form.checkValidity()){form.reportValidity();return;}const btn=document.getElementById('saveEmpBtn');btn.disabled=true;btn.textContent='Saving...';this.updSmeHidden();const d=Object.fromEntries(new FormData(form).entries());try{if(id)await db.updateEmployee(id,d);else await db.addEmployee(d);this.closeM('empMod');this.nav('employees');this.notify(d.name+' saved','ok');}catch(er){this.notify(er.message,'err');btn.disabled=false;btn.textContent=edit?'Save Changes':'Save Employee';}});
  }

  updSmeHidden(){const gi=el=>el?[...el.querySelectorAll('.chip')].map(c=>c.textContent.replace('×','').trim()).filter(Boolean).join(','):'';const f=document.querySelector('[name=industry_sme]');const m=document.querySelector('[name=module_sme]');if(f)f.value=gi(document.getElementById('iChips'));if(m)m.value=gi(document.getElementById('mChips'));}
  async delEmp(id){if(!confirm('Delete this employee and all related data?'))return;try{await db.deleteEmployee(id);this.nav('employees');this.notify('Deleted','ok');}catch(e){this.notify(e.message,'err');}}

  // ─── VIEW EMPLOYEE (FULL PAGE) ─────────────────────────────
  async viewEmp(id){
    const e=db.getEmployee(id);if(!e)return;
    const[skills,tags,links,notes,courses]=[ db.getSkills(id),db.getTags(id),db.getLinks('employee',id),db.getNotes('employee',id),db.getCourses(id) ];
    const resps=db.getData('survey_responses').filter(r=>r.employee_id===id);
    const today=new Date().toISOString().split('T')[0];
    const over=e.next_review_date&&e.next_review_date<today;
    const init=e.name.split(' ').map(n=>n[0]).join('').slice(0,2);
    const smes=[(e.industry_sme||''),(e.module_sme||'')].filter(Boolean).join(', ');
    const profW={Beginner:30,Intermediate:60,Expert:100};

    // Count unique survey participations
    const surveyIds=[...new Set(resps.map(r=>r.survey_id))];
    const surveyInfo=surveyIds.map(sid=>{const s=db.getSurvey(sid);const qs=db.getSurveyQuestions(sid);const sr=resps.filter(r=>r.survey_id===sid);const scaleR=sr.filter(r=>{const q=qs.find(x=>x.id===r.question_id);return q&&q.question_type==='scale';});const avg=scaleR.length?(scaleR.reduce((a,r)=>a+parseFloat(r.response_value||0),0)/scaleR.length).toFixed(1):null;return{id:sid,title:s?s.title:'Survey #'+sid,avg};});

    const cw=document.getElementById('cw');
    cw.innerHTML=`
      <div style="margin-bottom:16px"><button class="btn btn-s btn-sm" onclick="app.nav('employees')">← Back to Employees</button></div>
      <div class="g2 mb-lg" style="grid-template-columns:1fr 320px">
        <div>
          <div class="card mb">
            <div class="profile-hd">
              <div class="av">${init}</div>
              <div style="flex:1">
                <div class="profile-name">${this.esc(e.name)}</div>
                <div class="profile-role">${this.esc(e.job_title||'No title')}</div>
                ${e.industry_sme?`<div class="text-sm" style="margin-top:4px"><span class="badge badge-p" style="margin-right:6px">Industry SME</span>${this.esc(e.industry_sme)}</div>`:''}
                ${e.module_sme?`<div class="text-sm" style="margin-top:4px"><span class="badge badge-s" style="margin-right:6px">Module SME</span>${this.esc(e.module_sme)}</div>`:''}
                ${e.email?`<div class="profile-email">${this.esc(e.email)}</div>`:''}
              </div>
              <div class="act-btns"><button class="btn btn-s btn-sm" onclick="app.empModal(${id})">Edit Profile</button></div>
            </div>
            ${e.next_review_date?`<div class="text-sm ${over?'text-danger':'text-muted'}" style="margin-top:4px">${over?'⚠️ Review overdue: ':'Next review: '}${this.fmtDate(e.next_review_date)}</div>`:''}
            ${e.qualifications?`<div class="text-sm text-muted" style="margin-top:8px"><strong>Qualifications:</strong> ${this.esc(e.qualifications)}</div>`:''}
            ${e.start_date?`<div class="text-sm text-muted" style="margin-top:4px"><strong>Started:</strong> ${this.fmtDate(e.start_date)}</div>`:''}

            <div class="section"><h4>Tags</h4>
              <div class="chips" id="empTags">${tags.map(t=>`<span class="tag" style="background:${t.tag_color}18;color:${t.tag_color};border:1px solid ${t.tag_color}30">${this.esc(t.tag_name)} <button class="x" onclick="app.rmTag(${t.id},${id})">×</button></span>`).join(' ')}</div>
              <div class="add-row"><input class="inp inp-sm" id="newTagName" placeholder="Tag name" style="width:120px"><input type="color" id="newTagColor" value="#6366f1" style="width:36px;height:30px;border:1px solid var(--border);border-radius:4px;cursor:pointer"><button class="btn btn-s btn-sm" onclick="app.addTag(${id})">Add</button></div>
            </div>

            <div class="section"><h4>Skills</h4>
              ${skills.map(s=>`<div class="skill-row"><span class="name">${this.esc(s.skill_name)}</span><div class="bar"><div class="bar-fill" style="width:${profW[s.proficiency]||30}%"></div></div><span class="lvl">${s.proficiency}</span><button class="btn btn-g btn-icon btn-d" onclick="app.rmSkill(${s.id},${id})">✕</button></div>`).join('')}
              <div class="add-row"><input class="inp inp-sm" id="newSkillName" placeholder="Skill" style="width:140px"><select class="sel inp-sm" id="newSkillProf"><option>Beginner</option><option>Intermediate</option><option>Expert</option></select><button class="btn btn-s btn-sm" onclick="app.addSkill(${id})">Add</button></div>
            </div>

            <div class="section"><h4>Courses</h4>
              ${courses.map(c=>`<div class="course-row"><div>${c.course_url?`<a href="${this.escAttr(c.course_url)}" target="_blank" rel="noopener">${this.esc(c.course_name)}</a>`:`<span>${this.esc(c.course_name)}</span>`}${c.due_date?` <span class="text-xs">Due: ${this.fmtDate(c.due_date)}</span>`:''}</div><div class="act-btns"><span class="badge badge-${c.status==='complete'?'ok':c.status==='in progress'?'warn':'s'}">${c.status}</span><select class="sel inp-sm" onchange="app.updCourseStatus(${c.id},this.value,${id})" style="width:auto;margin-left:6px"><option value="not started" ${c.status==='not started'?'selected':''}>Not Started</option><option value="in progress" ${c.status==='in progress'?'selected':''}>In Progress</option><option value="complete" ${c.status==='complete'?'selected':''}>Complete</option></select><button class="btn btn-g btn-icon btn-d" onclick="app.rmCourse(${c.id},${id})">✕</button></div></div>`).join('')}
              <div class="add-row"><input class="inp inp-sm" id="newCourseName" placeholder="Course name" style="width:160px"><input class="inp inp-sm" id="newCourseUrl" placeholder="URL (optional)" style="width:160px"><input class="inp inp-sm" id="newCourseDue" type="date" style="width:130px"><button class="btn btn-s btn-sm" onclick="app.addCourseForEmp(${id})">Add</button></div>
            </div>
          </div>
        </div>

        <div>
          <div class="card mb">
            <div class="card-hd"><h3>Resources</h3></div>
            ${links.map(l=>`<div class="link-row"><a href="${this.escAttr(l.url)}" target="_blank" rel="noopener">${this.esc(l.link_name||l.url)}</a><button class="btn btn-g btn-icon btn-d" onclick="app.rmLink(${l.id},${id})">✕</button></div>`).join('')}
            ${!links.length?'<p class="text-sm text-muted" style="margin-bottom:8px">No resources yet</p>':''}
            <div class="add-row"><input class="inp inp-sm" id="newLinkName" placeholder="Name" style="width:100px"><input class="inp inp-sm" id="newLinkUrl" placeholder="https://..." style="width:140px"><button class="btn btn-s btn-sm" onclick="app.addLinkForEmp(${id})">Add</button></div>
          </div>

          <div class="card mb">
            <div class="card-hd"><h3>Notes</h3></div>
            <div style="margin-bottom:8px"><textarea class="inp" id="newNote" placeholder="Add a note..." rows="2" style="min-height:48px"></textarea><button class="btn btn-p btn-sm" style="margin-top:6px" onclick="app.addNoteForEmp(${id})">Add Note</button></div>
            ${notes.map(n=>`<div class="note-card"><div class="note-meta"><span>${this.esc(n.author)} · ${this.timeAgo(n.created_at)}</span><button class="btn btn-g btn-icon btn-d" onclick="app.rmNote(${n.id},${id})">✕</button></div><p>${this.esc(n.note_text)}</p></div>`).join('')}
          </div>

          <div class="card">
            <div class="card-hd"><h3>Survey Results</h3></div>
            ${surveyInfo.length?surveyInfo.map(s=>`<div class="review-row" style="cursor:pointer" onclick="app.surveyResults(${s.id})"><span class="text-sm" style="color:var(--primary)">${this.esc(s.title)}</span>${s.avg?`<span class="fw-600">${s.avg}/10</span>`:''}</div>`).join(''):'<p class="text-sm text-muted">No survey responses</p>'}
          </div>
        </div>
      </div>`;
  }

  async addTag(eid){const n=document.getElementById('newTagName').value.trim();if(!n)return;const c=document.getElementById('newTagColor').value;await db.addTag({employee_id:eid,tag_name:n,tag_color:c});this.viewEmp(eid);}
  async rmTag(tid,eid){await db.deleteTag(tid);this.viewEmp(eid);}
  async addSkill(eid){const n=document.getElementById('newSkillName').value.trim();if(!n)return;const p=document.getElementById('newSkillProf').value;await db.addSkill({employee_id:eid,skill_name:n,proficiency:p});this.viewEmp(eid);}
  async rmSkill(sid,eid){await db.deleteSkill(sid);this.viewEmp(eid);}
  async addCourseForEmp(eid){const n=document.getElementById('newCourseName').value.trim();if(!n)return;await db.addCourse({employee_id:eid,course_name:n,course_url:document.getElementById('newCourseUrl').value.trim(),due_date:document.getElementById('newCourseDue').value});this.viewEmp(eid);}
  async updCourseStatus(cid,status,eid){await db.updateCourse(cid,{...db.getData('courses').find(c=>c.id===cid),status});this.viewEmp(eid);}
  async rmCourse(cid,eid){await db.deleteCourse(cid);this.viewEmp(eid);}
  async addLinkForEmp(eid){const n=document.getElementById('newLinkName').value.trim();const u=document.getElementById('newLinkUrl').value.trim();if(!u)return;await db.addLink({entity_type:'employee',entity_id:eid,link_name:n||u,url:u});this.viewEmp(eid);}
  async rmLink(lid,eid){await db.deleteLink(lid);this.viewEmp(eid);}
  async addNoteForEmp(eid){const t=document.getElementById('newNote').value.trim();if(!t)return;await db.addNote({entity_type:'employee',entity_id:eid,note_text:t});this.viewEmp(eid);}
  async rmNote(nid,eid){await db.deleteNote(nid);this.viewEmp(eid);}

  // ─── TRAINING PAGE ─────────────────────────────────────────
  async trainPage(cw){
    try{
      const courses=db.getCourses(),emps=db.getEmployees();
      const empMap={};emps.forEach(e=>{empMap[e.id]=e.name;});
      cw.innerHTML=`
        <div class="toolbar"><div></div><div class="act-btns"><button class="btn btn-p" id="bulkAssignBtn">📋 Bulk Assign Course</button></div></div>
        <div class="card">
          ${courses.length?`<div class="tbl-wrap"><table><thead><tr><th>Employee</th><th>Course</th><th class="hide-m">URL</th><th>Status</th><th class="hide-m">Due</th><th></th></tr></thead><tbody>${courses.map(c=>`<tr><td><strong>${this.esc(empMap[c.employee_id]||'?')}</strong></td><td>${this.esc(c.course_name)}</td><td class="hide-m">${c.course_url?`<a href="${this.escAttr(c.course_url)}" target="_blank" class="text-sm" style="color:var(--primary)">Open ↗</a>`:'-'}</td><td><select class="sel inp-sm" onchange="app.updCourseStatusDirect(${c.id},this.value)"><option value="not started" ${c.status==='not started'?'selected':''}>Not Started</option><option value="in progress" ${c.status==='in progress'?'selected':''}>In Progress</option><option value="complete" ${c.status==='complete'?'selected':''}>Complete</option></select></td><td class="hide-m text-sm">${c.due_date?this.fmtDate(c.due_date):'-'}</td><td><button class="btn btn-g btn-sm btn-d" onclick="app.rmCourseDirect(${c.id})">✕</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty"><h3>No courses yet</h3><p>Assign courses to employees or use bulk assign</p></div>`}
        </div>`;
      document.getElementById('bulkAssignBtn').addEventListener('click',()=>this.bulkAssignModal());
    }catch(e){cw.innerHTML=`<div class="empty"><p>${e.message}</p></div>`;}
  }

  async updCourseStatusDirect(cid,status){const c=db.getData('courses').find(x=>x.id===cid);if(c)await db.updateCourse(cid,{...c,status});this.notify('Status updated','ok');}
  async rmCourseDirect(cid){await db.deleteCourse(cid);this.nav('training');}

  bulkAssignModal(){
    const emps=db.getEmployees();
    document.getElementById('mc').innerHTML=`
      <div class="modal-bg" id="bulkMod">
        <div class="modal modal-lg">
          <div class="modal-hd"><h3>Bulk Assign Course</h3><button class="modal-x" onclick="app.closeM('bulkMod')">×</button></div>
          <div class="modal-body">
            <div class="fg"><label class="fl">Course Name *</label><input class="inp" id="bulkName" required></div>
            <div class="form-row"><div class="fg"><label class="fl">Course URL</label><input class="inp" id="bulkUrl" placeholder="https://..."></div><div class="fg"><label class="fl">Complete By</label><input class="inp" id="bulkDue" type="date"></div></div>
            <div class="fg"><label class="fl">Select Employees *</label>
              <div style="max-height:200px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius);padding:8px">
                <label style="display:block;padding:4px 0;font-size:13px;cursor:pointer"><input type="checkbox" id="selAll" style="margin-right:6px"><strong>Select All</strong></label>
                ${emps.map(e=>`<label style="display:block;padding:4px 0;font-size:13px;cursor:pointer"><input type="checkbox" class="empCb" value="${e.id}" style="margin-right:6px">${this.esc(e.name)} <span class="text-xs">${this.esc(e.job_title||'')}</span></label>`).join('')}
              </div>
            </div>
          </div>
          <div class="save-bar"><button class="btn btn-s" onclick="app.closeM('bulkMod')">Cancel</button><button class="btn btn-p" id="bulkSaveBtn" style="min-width:200px">Assign Course</button></div>
        </div>
      </div>`;
    document.getElementById('selAll').addEventListener('change',function(){document.querySelectorAll('.empCb').forEach(c=>{c.checked=this.checked;});});
    document.getElementById('bulkSaveBtn').addEventListener('click',async()=>{
      const name=document.getElementById('bulkName').value.trim();if(!name){alert('Enter a course name');return;}
      const ids=[...document.querySelectorAll('.empCb:checked')].map(c=>parseInt(c.value));if(!ids.length){alert('Select at least one employee');return;}
      const btn=document.getElementById('bulkSaveBtn');btn.disabled=true;btn.textContent='Assigning...';
      try{await db.bulkAssignCourse({course_name:name,course_url:document.getElementById('bulkUrl').value.trim(),due_date:document.getElementById('bulkDue').value},ids);this.closeM('bulkMod');this.nav('training');this.notify(`Course assigned to ${ids.length} employees`,'ok');}catch(e){this.notify(e.message,'err');btn.disabled=false;btn.textContent='Assign Course';}
    });
  }

  // ─── SURVEYS PAGE ──────────────────────────────────────────
  async surveyPage(cw){
    try{
      const surveys=db.getSurveys();
      cw.innerHTML=`
        <div class="toolbar"><div></div><button class="btn btn-p" id="createSurvBtn">+ Create Survey</button></div>
        <div class="g3">${surveys.map(s=>{
          const qs=db.getSurveyQuestions(s.id);
          const rs=db.getSurveyResponses(s.id);
          const ppl=new Set(rs.map(r=>r.employee_id)).size;
          return`<div class="card survey-card"><h3>${this.esc(s.title)}</h3><p class="text-sm text-muted" style="margin-bottom:12px">${this.esc(s.description||'')}</p><div class="text-xs" style="margin-bottom:8px">${qs.length} questions · ${ppl} responses · ${this.fmtDate(s.created_date)}</div><div class="survey-acts"><button class="btn btn-s btn-sm" onclick="app.copySurveyLink(${s.id})">🔗 Share</button><button class="btn btn-p btn-sm" onclick="app.surveyResults(${s.id})">Results</button><button class="btn btn-g btn-sm" onclick="app.editSurvey(${s.id})">Edit</button><button class="btn btn-g btn-sm btn-d" onclick="app.delSurvey(${s.id})">✕</button></div></div>`;
        }).join('')}${!surveys.length?'<div class="card" style="grid-column:1/-1"><div class="empty"><h3>No surveys</h3><p>Create your first survey</p></div></div>':''}</div>`;
      document.getElementById('createSurvBtn').addEventListener('click',()=>this.createSurveyModal());
    }catch(e){cw.innerHTML=`<div class="empty"><p>${e.message}</p></div>`;}
  }

  createSurveyModal(){
    let qc=1;
    document.getElementById('mc').innerHTML=`
      <div class="modal-bg" id="survMod">
        <div class="modal modal-lg">
          <div class="modal-hd"><h3>Create Survey</h3><button class="modal-x" onclick="app.closeM('survMod')">×</button></div>
          <div class="modal-body">
            <form id="survForm">
              <div class="fg"><label class="fl">Title *</label><input class="inp" name="title" required></div>
              <div class="fg"><label class="fl">Description</label><textarea class="inp" name="description"></textarea></div>
              <h4 style="margin:16px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:var(--text-3)">Questions</h4>
              <div id="qCont"><div class="card mb" data-q="1"><div class="fg"><label class="fl">Question 1</label><input class="inp" name="q_1_text" required></div><div class="fg"><label class="fl">Type</label><select class="sel" name="q_1_type"><option value="scale">Scale (1-10)</option><option value="yes-no">Yes/No</option><option value="text">Text</option></select></div></div></div>
              <button type="button" class="btn btn-s" id="addQBtn">+ Add Question</button>
            </form>
          </div>
          <div class="save-bar"><button class="btn btn-s" onclick="app.closeM('survMod')">Cancel</button><button class="btn btn-p" id="saveSurvBtn" style="min-width:200px">Create Survey</button></div>
        </div>
      </div>`;
    document.getElementById('addQBtn').addEventListener('click',()=>{qc++;document.getElementById('qCont').insertAdjacentHTML('beforeend',`<div class="card mb" data-q="${qc}"><div class="flex between items-center mb"><strong class="text-sm">Question ${qc}</strong><button type="button" class="btn btn-g btn-sm btn-d" onclick="this.closest('.card').remove()">Remove</button></div><div class="fg"><input class="inp" name="q_${qc}_text" required></div><div class="fg"><select class="sel" name="q_${qc}_type"><option value="scale">Scale (1-10)</option><option value="yes-no">Yes/No</option><option value="text">Text</option></select></div></div>`);});
    document.getElementById('saveSurvBtn').addEventListener('click',async()=>{const form=document.getElementById('survForm');if(!form.checkValidity()){form.reportValidity();return;}const btn=document.getElementById('saveSurvBtn');btn.disabled=true;btn.textContent='Creating...';const fd=new FormData(form);try{const sid=await db.addSurvey({title:fd.get('title'),description:fd.get('description')});const items=document.querySelectorAll('#qCont .card');const qs=[];items.forEach((item,idx)=>{const n=item.dataset.q;const t=fd.get('q_'+n+'_text');const ty=fd.get('q_'+n+'_type');if(t&&ty)qs.push({survey_id:sid,question_text:t,question_type:ty,question_order:idx+1});});if(qs.length)await db.addSurveyQuestions(qs);this.closeM('survMod');this.nav('surveys');this.notify('Survey created','ok');}catch(e){this.notify(e.message,'err');btn.disabled=false;btn.textContent='Create Survey';}});
  }

  copySurveyLink(sid){const base=window.location.href.replace(/[^/]*$/,'')+'survey.html?survey='+sid;navigator.clipboard.writeText(base).then(()=>this.notify('Link copied','ok')).catch(()=>alert('Share: '+base));}

  async surveyResults(sid){
    const survey=db.getSurvey(sid),qs=db.getSurveyQuestions(sid),rs=db.getSurveyResponses(sid);if(!survey)return;
    const ppl=new Set(rs.map(r=>r.employee_id)).size;
    document.getElementById('mc').innerHTML=`
      <div class="modal-bg" id="resMod">
        <div class="modal modal-lg">
          <div class="modal-hd"><h3>${this.esc(survey.title)} — Results</h3><button class="modal-x" onclick="app.closeM('resMod')">×</button></div>
          <div class="modal-body">
            <div class="stats mb" style="grid-template-columns:repeat(3,1fr)"><div class="stat"><div class="stat-label">Questions</div><div class="stat-val">${qs.length}</div></div><div class="stat"><div class="stat-label">Responses</div><div class="stat-val">${rs.length}</div></div><div class="stat"><div class="stat-label">Participants</div><div class="stat-val">${ppl}</div></div></div>
            ${qs.map((q,i)=>{const qr=rs.filter(r=>r.question_id===q.id);
              if(q.question_type==='scale'){const vals=qr.map(r=>parseFloat(r.response_value)).filter(v=>!isNaN(v));const avg=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1):0;return`<div class="card mb"><h4 class="text-sm mb">Q${i+1}: ${this.esc(q.question_text)}</h4><div class="flex between items-center mb"><span class="badge badge-p">Scale</span><strong>${avg}/10</strong></div>${qr.map(r=>`<div class="review-row"><span>${this.esc(r.employee_name)}</span><strong>${r.response_value}/10</strong></div>`).join('')}</div>`;}
              else if(q.question_type==='yes-no'){const yes=qr.filter(r=>(r.response_value||'').toLowerCase()==='yes').length;return`<div class="card mb"><h4 class="text-sm mb">Q${i+1}: ${this.esc(q.question_text)}</h4><span class="badge badge-p mb">Yes/No</span><div class="g2"><div class="stat"><div class="stat-label">Yes</div><div class="stat-val">${yes}</div></div><div class="stat"><div class="stat-label">No</div><div class="stat-val">${qr.length-yes}</div></div></div></div>`;}
              else{return`<div class="card mb"><h4 class="text-sm mb">Q${i+1}: ${this.esc(q.question_text)}</h4><span class="badge badge-p mb">Text</span>${qr.map(r=>`<div class="note-card"><div class="note-meta">${this.esc(r.employee_name)}</div><p>${this.esc(r.response_value)}</p></div>`).join('')}</div>`;}
            }).join('')}
          </div>
          <div class="modal-ft"><button class="btn btn-s" onclick="app.closeM('resMod')">Close</button></div>
        </div>
      </div>`;
  }

  async editSurvey(sid){const s=db.getSurvey(sid);if(!s)return;document.getElementById('mc').innerHTML=`<div class="modal-bg" id="editSMod"><div class="modal"><div class="modal-hd"><h3>Edit Survey</h3><button class="modal-x" onclick="app.closeM('editSMod')">×</button></div><div class="modal-body"><div class="fg"><label class="fl">Title</label><input class="inp" id="eTitle" value="${this.escAttr(s.title)}"></div><div class="fg"><label class="fl">Description</label><textarea class="inp" id="eDesc">${this.esc(s.description||'')}</textarea></div></div><div class="save-bar"><button class="btn btn-s" onclick="app.closeM('editSMod')">Cancel</button><button class="btn btn-p" onclick="app.saveSurveyEdit(${sid})" style="min-width:160px">Save Changes</button></div></div></div>`;  }
  async saveSurveyEdit(sid){await db.updateSurvey(sid,{title:document.getElementById('eTitle').value,description:document.getElementById('eDesc').value});this.closeM('editSMod');this.nav('surveys');this.notify('Survey updated','ok');}
  async delSurvey(sid){if(!confirm('Delete this survey and all responses?'))return;await db.deleteSurvey(sid);this.nav('surveys');this.notify('Deleted','ok');}

  // ─── EXPORT CSV ────────────────────────────────────────────
  async exportCSV(){
    try{
      const emps=db.getEmployees(),tags=db.getAllTags(),skills=db.getAllSkills(),courses=db.getCourses();
      const tMap={},sMap={},cMap={};
      tags.forEach(t=>{if(!tMap[t.employee_id])tMap[t.employee_id]=[];tMap[t.employee_id].push(t.tag_name);});
      skills.forEach(s=>{if(!sMap[s.employee_id])sMap[s.employee_id]=[];sMap[s.employee_id].push(s.skill_name+' ('+s.proficiency+')');});
      courses.forEach(c=>{if(!cMap[c.employee_id])cMap[c.employee_id]=[];cMap[c.employee_id].push(c.course_name+' ['+c.status+']');});
      let csv='Name,Email,Job Title,Industry SME,Module SME,Start Date,Tags,Skills,Courses\n';
      emps.forEach(e=>{csv+='"'+[e.name,e.email,e.job_title,e.industry_sme,e.module_sme,e.start_date,(tMap[e.id]||[]).join('; '),(sMap[e.id]||[]).join('; '),(cMap[e.id]||[]).join('; ')].join('","')+'"\n';});
      const blob=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='insighthub-'+new Date().toISOString().split('T')[0]+'.csv';a.click();URL.revokeObjectURL(a.href);this.notify('Export downloaded','ok');
    }catch(e){this.notify('Export failed','err');}
  }

  // ─── UTILITIES ─────────────────────────────────────────────
  closeM(id){const el=document.getElementById(id);if(el)el.remove();}
  notify(msg,type='ok'){const n=document.createElement('div');n.className='notif n-'+type;n.textContent=msg;document.body.appendChild(n);requestAnimationFrame(()=>n.classList.add('show'));setTimeout(()=>{n.classList.remove('show');setTimeout(()=>n.remove(),200);},3000);}
  esc(t){if(!t)return'';const d=document.createElement('div');d.textContent=String(t);return d.innerHTML;}
  escAttr(t){if(!t)return'';return String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  fmtDate(d){if(!d)return'-';try{return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});}catch(e){return d;}}
  timeAgo(d){if(!d)return'';const ms=Date.now()-new Date(d).getTime();const m=Math.floor(ms/60000);if(m<1)return'just now';if(m<60)return m+'m ago';const h=Math.floor(m/60);if(h<24)return h+'h ago';const dy=Math.floor(h/24);if(dy<7)return dy+'d ago';return this.fmtDate(d);}
}

let app;
document.addEventListener('DOMContentLoaded',()=>{app=new InsightHubApp();app.init();});
