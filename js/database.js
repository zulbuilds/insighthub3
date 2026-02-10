/**
 * InsightHub Database Manager - Google Sheets Backend
 * Author: Zul Suriya | Senior ERP Consultant
 */
const CREDENTIALS = {
  client_email: "insighthub-app@insighthub-486917.iam.gserviceaccount.com",
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9z5kZax1UkGXp
PLJjwmSZtK2ZHTbXHs5PlKDTlv9J3ys+7CFwAbPPZIwdJ6zfK+HdxYOVgRGnIaD2
KyeRc3jiSxry91Ge4I4wtNMWsAb3P0QE23nWwmq80hbirR2Y7wbCMaKOCtBu2cF9
809drxaQcF5H2xg9X4E427Judcp1AL0CbisD3YVDS9/4sNGOVxl2ej2judEP+VtA
OJXDUjh6qegn2SkLpLaJlstM5Js7TSYDlNQOGHczg4UoZ8PNQcDldWKK9iIm0w4U
BqSlLgucZkEiYUgOIrtrLQYMRBtlkgXSSppQ1dqlRJpfDmvS8pkEPrvum2QqLvKa
/4g6yftFAgMBAAECggEABrRtmQtClvke0HVXa9SzDwbl1vHEPScWbJM4dyDvVaGv
emKG79jvjBTmKiV7osp/CQFwG3jascerUubFWAr3Ky8x/YEk/fK6sxfAGR4QsO0o
Lu+9xwtJD/Bv5IPu9rcCyxtLva6+HBxPDG7qz8leh62gdvNTUN+txd9k1ygMBcP4
QHFMeZTunths25EsHgUBaZAj2mFex2D1Qf3IxZap2k/NHV8oh1m9cyTZbhKFVkqn
iPjjbzfnWh3Qg5SiPSBi9OLplLo6x0mxfStmxUjGBQHit8lbsR7B2iMez+WD1yCr
d/eRZQ8c8UaRF2Hnj1ciQJviXztoXXUl1xq46mHPRQKBgQD02me9gwKmt21zkMsM
+g26yFQYcphn3kH1RjQ0cAjjNYdXEsfwDOrbqLIHfU9cQPfeO6AKo5jhkBXCrPqb
M0NtqmJNMnQSs3TQoz5erz0mPR9ufNhgekDJZhR+Om7TOopx9U750U/9dhhBu6g9
WO0o7H6cWTaTSlj9ICi0qyPeywKBgQDGc7a017pyMxDFiWah1bz997x+CxCx/FV2
POpPCbNVYiVlDRM5YY6/6LZBqcTcsK+JEQE82l8Cj4FfsAwyeE6Za77gv3tekiss
3kWSE6CwiaP21/PJHUms6sezKphhMwu2vLBHoWpwcCPKbxgBcTVdixLXeHIFFaIP
/e23BOW8LwKBgQDteHlOsqY6nQG5KH/V+RqhwbLV9yZa7pNX15vAE7x66Cp3x45E
AbMyEN2BKAZ0+cmsLnXce6hFc6G3Kl7vcPt/e9VU+47ZqFSuGPTfjeOnl3ZJiSmu
AEOfULKlbfSYRlmJhpnu7hM/Rm7mKaNUxE9W9m8hIeEtXtkJvkvcVXM3mwKBgALq
gl3H6bpx26Y7baGlJWDJ+iAUA4vJ/Gt/W6YLq3HuvkPs3EJ0l4dkYQE4AGeJxRqL
gGwnfUvpVepVCOjY8ba5aZWd2q86EJ5ZKcaKuUq+ywT+iVuELaf3zzVnw9Nxz5NA
1IpI6ep7C1uXJFApHLKiL4WxBGPkvHvlrE+LJ+ELAoGAN2vp/9QYpSuGdkNc4k55
ctbvbPEDhQY2aYRS3oPZ5C+qkD7jaecEIMAqqyogf5yNGdyma3WB7VH5JPCyXu1V
iLLihJOA0MYKRPokApwiL56ZZPFKZ34dIasFcJ2MCvdE/GwJ+i9uC6voWPS10Stu
IojPuOejL4cf0pK8H4Axr2g=
-----END PRIVATE KEY-----
`,
  token_uri: "https://oauth2.googleapis.com/token"
};
const SPREADSHEET_ID = '17cPnJW2US0oiUhTLdxPgJ8sBc6isjxf9C_4THQqvXIM';
const SHEETS_API = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;

const SHEET_SCHEMAS = {
  employees: ['id','name','email','job_title','industry_sme','module_sme','start_date','qualifications','courses_completed','next_review_date','created_at'],
  surveys: ['id','title','description','created_date','is_active'],
  survey_questions: ['id','survey_id','question_text','question_type','question_order'],
  survey_responses: ['id','survey_id','employee_id','question_id','response_value','response_date'],
  courses: ['id','employee_id','course_name','course_url','status','due_date','created_at'],
  employee_links: ['id','entity_type','entity_id','link_name','url','created_at'],
  employee_skills: ['id','employee_id','skill_name','proficiency','created_at'],
  employee_notes: ['id','entity_type','entity_id','note_text','author','created_at'],
  employee_tags: ['id','employee_id','tag_name','tag_color','created_at'],
  sme_categories: ['id','sme_type','sme_value','created_at'],
  activity_log: ['id','action','entity_type','entity_id','details','created_at']
};
const INT_FIELDS = ['id','survey_id','employee_id','question_id','entity_id','question_order','is_active'];

class DatabaseManager {
  constructor() { this.accessToken=null; this.tokenExpiry=0; this.data={}; this.dataLoaded=false; this.lastReq=0; }
  b64url(s) { return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }

  async getToken() {
    if (this.accessToken && Date.now() < this.tokenExpiry-60000) return this.accessToken;
    const now=Math.floor(Date.now()/1000);
    const h=this.b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
    const p=this.b64url(JSON.stringify({iss:CREDENTIALS.client_email,scope:'https://www.googleapis.com/auth/spreadsheets',aud:CREDENTIALS.token_uri,iat:now,exp:now+3600}));
    const inp=h+'.'+p;
    const pem=CREDENTIALS.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,'');
    const key=await crypto.subtle.importKey('pkcs8',Uint8Array.from(atob(pem),c=>c.charCodeAt(0)),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
    const sig=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(inp));
    const jwt=inp+'.'+this.b64url(String.fromCharCode(...new Uint8Array(sig)));
    const r=await fetch(CREDENTIALS.token_uri,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion='+jwt});
    if(!r.ok) throw new Error('Auth failed: '+r.status);
    const d=await r.json(); this.accessToken=d.access_token; this.tokenExpiry=Date.now()+d.expires_in*1000; return this.accessToken;
  }

  async api(url,opts={}) {
    await this.getToken();
    const el=Date.now()-this.lastReq; if(el<100) await new Promise(r=>setTimeout(r,100-el)); this.lastReq=Date.now();
    let retries=3;
    while(retries>0) {
      const resp=await fetch(url,{...opts,headers:{'Authorization':'Bearer '+this.accessToken,'Content-Type':'application/json',...(opts.headers||{})}});
      if(resp.status===429){await new Promise(r=>setTimeout(r,Math.pow(2,4-retries)*1000));retries--;continue;}
      if(!resp.ok){const t=await resp.text();throw new Error('API '+resp.status+': '+t);}
      return resp.status===204?null:await resp.json();
    }
    throw new Error('Rate limit exceeded');
  }

  colLetter(n){let s='';while(n>0){n--;s=String.fromCharCode(65+(n%26))+s;n=Math.floor(n/26);}return s;}

  async init(){try{await this.getToken();await this.ensureSheets();await this.loadAllData();return true;}catch(e){console.error('DB init:',e);return false;}}

  async ensureSheets(){
    const meta=await this.api(SHEETS_API+'?fields=sheets.properties.title');
    const existing=meta.sheets.map(s=>s.properties.title);
    const missing=Object.keys(SHEET_SCHEMAS).filter(s=>!existing.includes(s));
    let needSeed=false;
    if(missing.length>0){
      await this.api(SHEETS_API+':batchUpdate',{method:'POST',body:JSON.stringify({requests:missing.map(t=>({addSheet:{properties:{title:t}}}))})});
      await this.api(SHEETS_API+'/values:batchUpdate',{method:'POST',body:JSON.stringify({valueInputOption:'RAW',data:missing.map(n=>({range:n+'!A1:'+this.colLetter(SHEET_SCHEMAS[n].length)+'1',values:[SHEET_SCHEMAS[n]]}))})});
      needSeed=true;
    }
    // Check schema: verify employees sheet has industry_sme column (v2 migration)
    if(existing.includes('employees')){
      const hdr=await this.api(SHEETS_API+'/values/'+encodeURIComponent('employees!A1:Z1'));
      const cols=(hdr.values&&hdr.values[0])||[];
      if(!cols.includes('industry_sme')){
        // Old schema detected - wipe employees sheet and re-create with new headers
        const sMeta=await this.api(SHEETS_API+'?fields=sheets.properties');
        const empSheet=sMeta.sheets.find(x=>x.properties.title==='employees');
        if(empSheet){
          await this.api(SHEETS_API+'/values/employees!A1:Z10000?valueInputOption=RAW',{method:'PUT',body:JSON.stringify({values:[SHEET_SCHEMAS.employees]})});
        }
        needSeed=true;
      }
    }
    if(needSeed){
      // Clear all sheets data rows before seeding
      const clearRanges=Object.keys(SHEET_SCHEMAS).map(n=>n+'!A2:Z10000');
      try{await this.api(SHEETS_API+'/values:batchClear',{method:'POST',body:JSON.stringify({ranges:clearRanges})});}catch(e){}
      await this.seedData();
    }
  }

  async loadAllData(){
    const ranges=Object.keys(SHEET_SCHEMAS).map(n=>n+'!A:'+this.colLetter(SHEET_SCHEMAS[n].length));
    const result=await this.api(SHEETS_API+'/values:batchGet?'+ranges.map(r=>'ranges='+encodeURIComponent(r)).join('&'));
    Object.keys(SHEET_SCHEMAS).forEach((name,i)=>{
      const rows=result.valueRanges[i].values||[];
      if(rows.length<=1){this.data[name]=[];return;}
      const hdrs=rows[0];
      this.data[name]=rows.slice(1).map(row=>{const o={};hdrs.forEach((h,j)=>{o[h]=row[j]||'';});INT_FIELDS.forEach(f=>{if(o[f]!==undefined&&o[f]!=='')o[f]=parseInt(o[f])||0;});return o;});
    });
    this.dataLoaded=true;
  }

  getData(s){return this.data[s]||[];}
  getNextId(s){const r=this.getData(s);return r.length?Math.max(...r.map(x=>parseInt(x.id)||0))+1:1;}

  async appendRow(sheet,data){
    const cols=SHEET_SCHEMAS[sheet],id=this.getNextId(sheet);data.id=id;if(!data.created_at)data.created_at=new Date().toISOString();
    const row=cols.map(c=>data[c]!==undefined?String(data[c]):'');
    await this.api(SHEETS_API+'/values/'+encodeURIComponent(sheet+'!A:'+this.colLetter(cols.length))+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',{method:'POST',body:JSON.stringify({values:[row]})});
    const o={};cols.forEach((c,i)=>{o[c]=row[i];});INT_FIELDS.forEach(f=>{if(o[f]!==undefined&&o[f]!=='')o[f]=parseInt(o[f])||0;});this.data[sheet].push(o);return id;
  }

  async appendRows(sheet,arr){
    if(!arr.length)return;const cols=SHEET_SCHEMAS[sheet];let nid=this.getNextId(sheet);const now=new Date().toISOString();
    const rows=arr.map(d=>{d.id=nid++;if(!d.created_at)d.created_at=now;return cols.map(c=>d[c]!==undefined?String(d[c]):'');});
    await this.api(SHEETS_API+'/values/'+encodeURIComponent(sheet+'!A:'+this.colLetter(cols.length))+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',{method:'POST',body:JSON.stringify({values:rows})});
    rows.forEach(row=>{const o={};cols.forEach((c,i)=>{o[c]=row[i];});INT_FIELDS.forEach(f=>{if(o[f]!==undefined&&o[f]!=='')o[f]=parseInt(o[f])||0;});this.data[sheet].push(o);});
  }

  async updateRow(sheet,id,upd){
    const idx=this.data[sheet].findIndex(r=>r.id===id);if(idx===-1)return false;
    const cols=SHEET_SCHEMAS[sheet],merged={...this.data[sheet][idx],...upd,id};
    const row=cols.map(c=>merged[c]!==undefined?String(merged[c]):'');
    await this.api(SHEETS_API+'/values/'+encodeURIComponent(sheet+'!A'+(idx+2)+':'+this.colLetter(cols.length)+(idx+2))+'?valueInputOption=RAW',{method:'PUT',body:JSON.stringify({values:[row]})});
    cols.forEach((c,i)=>{this.data[sheet][idx][c]=row[i];});INT_FIELDS.forEach(f=>{if(this.data[sheet][idx][f]!==undefined&&this.data[sheet][idx][f]!=='')this.data[sheet][idx][f]=parseInt(this.data[sheet][idx][f])||0;});
    return true;
  }

  async deleteRow(sheet,id){
    const meta=await this.api(SHEETS_API+'?fields=sheets.properties');const s=meta.sheets.find(x=>x.properties.title===sheet);if(!s)return false;
    const idx=this.data[sheet].findIndex(r=>r.id===id);if(idx===-1)return false;
    await this.api(SHEETS_API+':batchUpdate',{method:'POST',body:JSON.stringify({requests:[{deleteDimension:{range:{sheetId:s.properties.sheetId,dimension:'ROWS',startIndex:idx+1,endIndex:idx+2}}}]})});
    this.data[sheet].splice(idx,1);return true;
  }

  async deleteWhere(sheet,field,value){
    const meta=await this.api(SHEETS_API+'?fields=sheets.properties');const s=meta.sheets.find(x=>x.properties.title===sheet);if(!s)return;
    const idx=[];this.data[sheet].forEach((r,i)=>{if(String(r[field])===String(value))idx.push(i);});if(!idx.length)return;
    await this.api(SHEETS_API+':batchUpdate',{method:'POST',body:JSON.stringify({requests:[...idx].reverse().map(i=>({deleteDimension:{range:{sheetId:s.properties.sheetId,dimension:'ROWS',startIndex:i+1,endIndex:i+2}}}))})});
    [...idx].reverse().forEach(i=>this.data[sheet].splice(i,1));
  }

  getEmployees(){return[...this.getData('employees')].sort((a,b)=>a.name.localeCompare(b.name));}
  getEmployee(id){return this.getData('employees').find(r=>r.id===id)||null;}
  async addEmployee(e){if(e.email&&this.getData('employees').some(x=>x.email===e.email))throw new Error('Email exists');const id=await this.appendRow('employees',{name:e.name,email:e.email||'',job_title:e.job_title||'',industry_sme:e.industry_sme||'',module_sme:e.module_sme||'',start_date:e.start_date||'',qualifications:e.qualifications||'',courses_completed:e.courses_completed||'',next_review_date:e.next_review_date||''});this.logActivity('Employee added','employee',id,e.name);return id;}
  async updateEmployee(id,e){const r=await this.updateRow('employees',id,{name:e.name,email:e.email||'',job_title:e.job_title||'',industry_sme:e.industry_sme||'',module_sme:e.module_sme||'',start_date:e.start_date||'',qualifications:e.qualifications||'',courses_completed:e.courses_completed||'',next_review_date:e.next_review_date||''});if(r)this.logActivity('Employee updated','employee',id,e.name);return r;}
  async deleteEmployee(id){const e=this.getEmployee(id);for(const s of['courses','survey_responses','employee_links','employee_skills','employee_notes','employee_tags'])await this.deleteWhere(s,s==='employee_links'||s==='employee_notes'?'entity_id':'employee_id',id);const r=await this.deleteRow('employees',id);if(r&&e)this.logActivity('Employee deleted','employee',id,e.name);return r;}

  getSurveys(){return[...this.getData('surveys')].sort((a,b)=>(b.created_date||'').localeCompare(a.created_date||''));}
  getSurvey(id){return this.getData('surveys').find(r=>r.id===id)||null;}
  async addSurvey(s){const id=await this.appendRow('surveys',{title:s.title,description:s.description||'',created_date:new Date().toISOString(),is_active:1});this.logActivity('Survey created','survey',id,s.title);return id;}
  async updateSurvey(id,s){return this.updateRow('surveys',id,{title:s.title,description:s.description||''});}
  async deleteSurvey(id){const s=this.getSurvey(id);await this.deleteWhere('survey_questions','survey_id',id);await this.deleteWhere('survey_responses','survey_id',id);const r=await this.deleteRow('surveys',id);if(r&&s)this.logActivity('Survey deleted','survey',id,s.title);return r;}

  getSurveyQuestions(sid){return this.getData('survey_questions').filter(r=>r.survey_id===sid).sort((a,b)=>a.question_order-b.question_order);}
  async addSurveyQuestions(qs){return this.appendRows('survey_questions',qs.map(q=>({survey_id:q.survey_id,question_text:q.question_text,question_type:q.question_type,question_order:q.question_order})));}
  async updateSurveyQuestion(id,q){return this.updateRow('survey_questions',id,{question_text:q.question_text,question_type:q.question_type,question_order:q.question_order});}
  async deleteSurveyQuestion(id){return this.deleteRow('survey_questions',id);}

  getSurveyResponses(sid){const em={};this.getData('employees').forEach(e=>{em[e.id]=e.name;});const qs={};this.getData('survey_questions').forEach(q=>{qs[q.id]=q;});return this.getData('survey_responses').filter(r=>r.survey_id===sid).map(r=>({...r,employee_name:em[r.employee_id]||'Unknown',question_text:qs[r.question_id]?.question_text||'',question_type:qs[r.question_id]?.question_type||''}));}
  hasCompletedSurvey(sid,eid){return this.getData('survey_responses').some(r=>r.survey_id===sid&&r.employee_id===parseInt(eid));}
  async submitSurveyResponse(sid,eid,resps){const now=new Date().toISOString();await this.appendRows('survey_responses',resps.map(r=>({survey_id:sid,employee_id:eid,question_id:r.question_id,response_value:r.value,response_date:now})));const emp=this.getEmployee(parseInt(eid));this.logActivity('Survey completed','survey',sid,emp?emp.name:'');return true;}

  getCourses(eid=null){const c=this.getData('courses');return eid?c.filter(r=>r.employee_id===eid):c;}
  async addCourse(c){return this.appendRow('courses',{employee_id:c.employee_id,course_name:c.course_name,course_url:c.course_url||'',status:c.status||'not started',due_date:c.due_date||''});}
  async bulkAssignCourse(c,eids){await this.appendRows('courses',eids.map(eid=>({employee_id:eid,course_name:c.course_name,course_url:c.course_url||'',status:'not started',due_date:c.due_date||''})));this.logActivity('Course bulk assigned','course',0,c.course_name+' -> '+eids.length+' people');}
  async updateCourse(id,c){return this.updateRow('courses',id,{course_name:c.course_name,course_url:c.course_url||'',status:c.status,due_date:c.due_date||''});}
  async deleteCourse(id){return this.deleteRow('courses',id);}

  getLinks(t,eid){return this.getData('employee_links').filter(r=>r.entity_type===t&&r.entity_id===eid);}
  async addLink(l){return this.appendRow('employee_links',{entity_type:l.entity_type,entity_id:l.entity_id,link_name:l.link_name,url:l.url});}
  async deleteLink(id){return this.deleteRow('employee_links',id);}

  getSkills(eid){return this.getData('employee_skills').filter(r=>r.employee_id===eid);}
  getAllSkills(){return this.getData('employee_skills');}
  async addSkill(s){return this.appendRow('employee_skills',{employee_id:s.employee_id,skill_name:s.skill_name,proficiency:s.proficiency});}
  async deleteSkill(id){return this.deleteRow('employee_skills',id);}

  getNotes(t,eid){return this.getData('employee_notes').filter(r=>r.entity_type===t&&r.entity_id===eid).sort((a,b)=>(b.created_at||'').localeCompare(a.created_at||''));}
  async addNote(n){return this.appendRow('employee_notes',{entity_type:n.entity_type,entity_id:n.entity_id,note_text:n.note_text,author:n.author||'Admin'});}
  async deleteNote(id){return this.deleteRow('employee_notes',id);}

  getTags(eid){return this.getData('employee_tags').filter(r=>r.employee_id===eid);}
  getAllTags(){return this.getData('employee_tags');}
  async addTag(t){return this.appendRow('employee_tags',{employee_id:t.employee_id,tag_name:t.tag_name,tag_color:t.tag_color||'#6366f1'});}
  async deleteTag(id){return this.deleteRow('employee_tags',id);}

  getSmeCategories(t=null){const d=this.getData('sme_categories');return t?d.filter(r=>r.sme_type===t):d;}
  async addSmeCategory(t,v){return this.appendRow('sme_categories',{sme_type:t,sme_value:v});}
  async deleteSmeCategory(id){return this.deleteRow('sme_categories',id);}

  async logActivity(a,t,id,d){try{await this.appendRow('activity_log',{action:a,entity_type:t,entity_id:id,details:d||''});}catch(e){console.warn('Log:',e);}}
  getActivityLog(n=15){return[...this.getData('activity_log')].sort((a,b)=>(b.created_at||'').localeCompare(a.created_at||'')).slice(0,n);}

  getAnalytics(){
    const em=this.getData('employees'),su=this.getData('surveys'),re=this.getData('survey_responses'),co=this.getData('courses');
    const iS=this.getSmeCategories('industry'),mS=this.getSmeCategories('module');
    const cI=new Set(),cM=new Set(),today=new Date().toISOString().split('T')[0];
    em.forEach(e=>{if(e.industry_sme)(e.industry_sme+'').split(',').forEach(s=>{if(s.trim())cI.add(s.trim())});if(e.module_sme)(e.module_sme+'').split(',').forEach(s=>{if(s.trim())cM.add(s.trim())});});
    return{totalEmployees:em.length,totalSurveys:su.length,totalResponses:re.length,totalCourses:co.length,coursesComplete:co.filter(c=>c.status==='complete').length,coursesInProgress:co.filter(c=>c.status==='in progress').length,coursesOverdue:co.filter(c=>c.due_date&&c.due_date<today&&c.status!=='complete').length,industrySmeTotal:iS.length,industryCovered:cI.size,moduleSmeTotal:mS.length,moduleCovered:cM.size,upcomingReviews:em.filter(e=>e.next_review_date).length};
  }

  createBackup(){const b={version:2,date:new Date().toISOString(),sheets:{}};Object.keys(SHEET_SCHEMAS).forEach(n=>{b.sheets[n]=this.getData(n);});return b;}
  async restoreBackup(b){
    if(!b.sheets)throw new Error('Invalid backup');
    await this.api(SHEETS_API+'/values:batchClear',{method:'POST',body:JSON.stringify({ranges:Object.keys(SHEET_SCHEMAS).map(n=>n+'!A2:Z10000')})});
    const bd=[];Object.keys(SHEET_SCHEMAS).forEach(n=>{const r=b.sheets[n]||[];if(!r.length)return;const c=SHEET_SCHEMAS[n];bd.push({range:n+'!A2:'+this.colLetter(c.length),values:r.map(x=>c.map(k=>x[k]!==undefined?String(x[k]):''))});});
    if(bd.length)await this.api(SHEETS_API+'/values:batchUpdate',{method:'POST',body:JSON.stringify({valueInputOption:'RAW',data:bd})});
    await this.loadAllData();this.logActivity('Backup restored','system',0,'Full restore');
  }

  async resetDatabase(){
    await this.api(SHEETS_API+'/values:batchClear',{method:'POST',body:JSON.stringify({ranges:Object.keys(SHEET_SCHEMAS).map(n=>n+'!A2:Z10000')})});
    Object.keys(SHEET_SCHEMAS).forEach(n=>{this.data[n]=[];});await this.seedData();await this.loadAllData();
  }

  async seedData(){
    const now=new Date().toISOString(),batch={};
    const mk=(s,r)=>{batch[s]=r.map(x=>{if(!x.created_at)x.created_at=now;return x;});};
    mk('sme_categories',[{id:1,sme_type:'industry',sme_value:'Aerospace'},{id:2,sme_type:'industry',sme_value:'Manufacturing'},{id:3,sme_type:'industry',sme_value:'Automotive'},{id:4,sme_type:'industry',sme_value:'Pharma'},{id:5,sme_type:'industry',sme_value:'Defence'},{id:6,sme_type:'industry',sme_value:'FMCG'},{id:7,sme_type:'industry',sme_value:'Energy'},{id:8,sme_type:'module',sme_value:'Finance'},{id:9,sme_type:'module',sme_value:'Planning'},{id:10,sme_type:'module',sme_value:'Logistics'},{id:11,sme_type:'module',sme_value:'Warehouse Management'},{id:12,sme_type:'module',sme_value:'HR'},{id:13,sme_type:'module',sme_value:'Procurement'},{id:14,sme_type:'module',sme_value:'Quality Management'}]);
    mk('employees',[{id:1,name:'Sarah Johnson',email:'sarah.johnson@co.com',job_title:'Senior Consultant',industry_sme:'Aerospace,Manufacturing',module_sme:'Finance,Planning',start_date:'2022-03-15',qualifications:'BSc CS, SAP Certified',next_review_date:'2026-04-15'},{id:2,name:'Michael Chen',email:'michael.chen@co.com',job_title:'Solution Architect',industry_sme:'Automotive',module_sme:'Logistics,Warehouse Management',start_date:'2021-06-01',qualifications:'MBA, SAP S/4 Certified',next_review_date:'2026-03-01'},{id:3,name:'Emily Rodriguez',email:'emily.r@co.com',job_title:'Consultant',industry_sme:'Pharma',module_sme:'Quality Management',start_date:'2023-01-10',next_review_date:'2026-05-20'},{id:4,name:'James Wilson',email:'james.w@co.com',job_title:'Senior Consultant',industry_sme:'Manufacturing,Defence',module_sme:'Planning,Procurement',start_date:'2020-09-20',next_review_date:'2026-02-28'},{id:5,name:'Lisa Thompson',email:'lisa.t@co.com',job_title:'Analyst',industry_sme:'FMCG',module_sme:'Finance',start_date:'2022-11-05',next_review_date:'2026-06-10'},{id:6,name:'David Park',email:'david.p@co.com',job_title:'Junior Consultant',module_sme:'HR',start_date:'2023-04-12',next_review_date:'2026-03-15'},{id:7,name:'Amanda Foster',email:'amanda.f@co.com',job_title:'Practice Lead',industry_sme:'Aerospace,Pharma',module_sme:'Finance,HR',start_date:'2021-02-28',next_review_date:'2026-04-01'},{id:8,name:'Robert Garcia',email:'robert.g@co.com',job_title:'Technical Consultant',industry_sme:'Energy',module_sme:'Logistics,Warehouse Management',start_date:'2022-07-18',next_review_date:'2026-05-01'}]);
    mk('surveys',[{id:1,title:'Q4 Skills Assessment',description:'Quarterly skills review',created_date:now,is_active:1},{id:2,title:'Leadership Competency',description:'Leadership readiness',created_date:now,is_active:1},{id:3,title:'Client Engagement',description:'Client delivery quality',created_date:now,is_active:1}]);
    mk('survey_questions',[{id:1,survey_id:1,question_text:'ERP tool proficiency (1-10)',question_type:'scale',question_order:1},{id:2,survey_id:1,question_text:'Complex issue solving (1-10)',question_type:'scale',question_order:2},{id:3,survey_id:1,question_text:'Adequate training resources?',question_type:'yes-no',question_order:3},{id:4,survey_id:1,question_text:'Skill to develop?',question_type:'text',question_order:4},{id:5,survey_id:2,question_text:'Delegation (1-10)',question_type:'scale',question_order:1},{id:6,survey_id:2,question_text:'Leadership interest?',question_type:'yes-no',question_order:2},{id:7,survey_id:2,question_text:'Leadership skill to improve?',question_type:'text',question_order:3},{id:8,survey_id:3,question_text:'Client comms clarity (1-10)',question_type:'scale',question_order:1},{id:9,survey_id:3,question_text:'Positive client feedback?',question_type:'yes-no',question_order:2},{id:10,survey_id:3,question_text:'Improve delivery how?',question_type:'text',question_order:3}]);
    mk('survey_responses',[{id:1,survey_id:1,employee_id:1,question_id:1,response_value:'9',response_date:now},{id:2,survey_id:1,employee_id:1,question_id:2,response_value:'8',response_date:now},{id:3,survey_id:1,employee_id:1,question_id:3,response_value:'yes',response_date:now},{id:4,survey_id:1,employee_id:1,question_id:4,response_value:'Machine Learning',response_date:now},{id:5,survey_id:1,employee_id:2,question_id:1,response_value:'8',response_date:now},{id:6,survey_id:1,employee_id:2,question_id:2,response_value:'9',response_date:now},{id:7,survey_id:1,employee_id:2,question_id:3,response_value:'yes',response_date:now},{id:8,survey_id:1,employee_id:2,question_id:4,response_value:'Cloud architecture',response_date:now}]);
    mk('courses',[{id:1,employee_id:1,course_name:'SAP S/4HANA Finance',course_url:'https://learning.sap.com/s4-finance',status:'in progress',due_date:'2026-06-01'},{id:2,employee_id:1,course_name:'Advanced Planning',course_url:'https://learning.sap.com/aps',status:'not started',due_date:'2026-08-01'},{id:3,employee_id:2,course_name:'SAP EWM Config',course_url:'https://learning.sap.com/ewm',status:'complete'},{id:4,employee_id:3,course_name:'SAP QM Advanced',course_url:'https://learning.sap.com/qm',status:'in progress',due_date:'2026-07-15'},{id:5,employee_id:6,course_name:'SAP SuccessFactors',course_url:'https://learning.sap.com/sf',status:'not started',due_date:'2026-04-01'}]);
    mk('employee_skills',[{id:1,employee_id:1,skill_name:'SAP FI/CO',proficiency:'Expert'},{id:2,employee_id:1,skill_name:'SAP PP',proficiency:'Intermediate'},{id:3,employee_id:1,skill_name:'Project Mgmt',proficiency:'Expert'},{id:4,employee_id:2,skill_name:'SAP WM/EWM',proficiency:'Expert'},{id:5,employee_id:2,skill_name:'Solution Design',proficiency:'Expert'},{id:6,employee_id:3,skill_name:'SAP QM',proficiency:'Intermediate'},{id:7,employee_id:4,skill_name:'SAP PP/DS',proficiency:'Expert'},{id:8,employee_id:4,skill_name:'SAP MM',proficiency:'Expert'},{id:9,employee_id:5,skill_name:'Data Analytics',proficiency:'Expert'},{id:10,employee_id:7,skill_name:'Change Mgmt',proficiency:'Expert'},{id:11,employee_id:8,skill_name:'SAP Basis',proficiency:'Expert'}]);
    mk('employee_tags',[{id:1,employee_id:1,tag_name:'Team Lead',tag_color:'#6366f1'},{id:2,employee_id:2,tag_name:'Architect',tag_color:'#8b5cf6'},{id:3,employee_id:3,tag_name:'New Joiner',tag_color:'#3b82f6'},{id:4,employee_id:4,tag_name:'SAP Certified',tag_color:'#10b981'},{id:5,employee_id:6,tag_name:'New Joiner',tag_color:'#3b82f6'},{id:6,employee_id:7,tag_name:'Practice Lead',tag_color:'#f59e0b'},{id:7,employee_id:8,tag_name:'Remote',tag_color:'#06b6d4'}]);
    mk('employee_links',[{id:1,entity_type:'employee',entity_id:1,link_name:'SAP Learning Hub',url:'https://learning.sap.com'},{id:2,entity_type:'employee',entity_id:1,link_name:'Client Portal',url:'https://portal.client.com'},{id:3,entity_type:'employee',entity_id:2,link_name:'Architecture Docs',url:'https://docs.company.com/arch'}]);
    mk('employee_notes',[{id:1,entity_type:'employee',entity_id:1,note_text:'Reviewed Q2 project plan. On track.',author:'Admin',created_at:'2025-12-15T10:00:00Z'},{id:2,entity_type:'employee',entity_id:1,note_text:'Completed SAP FI cert with distinction.',author:'Admin',created_at:'2025-11-20T14:00:00Z'},{id:3,entity_type:'employee',entity_id:2,note_text:'Leading architecture review for auto client.',author:'Admin',created_at:'2025-12-01T09:00:00Z'}]);
    mk('activity_log',[{id:1,action:'Platform initialized',entity_type:'system',entity_id:0,details:'InsightHub created'},{id:2,action:'Employee added',entity_type:'employee',entity_id:1,details:'Sarah Johnson'},{id:3,action:'Survey created',entity_type:'survey',entity_id:1,details:'Q4 Skills Assessment'},{id:4,action:'Course assigned',entity_type:'course',entity_id:1,details:'SAP Finance -> Sarah Johnson'}]);
    const bd=[];Object.keys(batch).forEach(n=>{const c=SHEET_SCHEMAS[n],v=batch[n].map(r=>c.map(k=>r[k]!==undefined?String(r[k]):''));if(v.length)bd.push({range:n+'!A2:'+this.colLetter(c.length),values:v});});
    await this.api(SHEETS_API+'/values:batchUpdate',{method:'POST',body:JSON.stringify({valueInputOption:'RAW',data:bd})});
  }
}
const db = new DatabaseManager();
