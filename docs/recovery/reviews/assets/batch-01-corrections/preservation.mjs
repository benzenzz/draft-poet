import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const base='e0a993839c83ef5273c4b518b833d856263241a6';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',windowsHide:true}).trimEnd();
const read=f=>fs.readFileSync(f,'utf8').replaceAll('\r\n','\n');
const old=f=>git('show',base+':'+f).replaceAll('\r\n','\n');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const result={base,checkedAt:new Date().toISOString(),checks:[]};
const check=(name,passed)=>{result.checks.push({name,passed});assert(passed,name);console.log('PASS '+name);};
try{
  result.verifiedFromHead=git('rev-parse','HEAD');
  git('merge-base','--is-ancestor',base,'HEAD');
  check('Recovery branch descends from exact baseline',git('branch','--show-current')==='codex/poet-requirements-polish');
  const manifest=JSON.parse(read('docs/recovery/POET_PROTECTED_BASELINE.json'));
  const changed=manifest.files.filter(f=>hash(fs.readFileSync(f.file))!==f.sha256).map(f=>f.file);
  result.protectedFileCount=manifest.files.length;result.changedProtectedFiles=changed;
  check('All 62 protected files byte-identical',manifest.files.length===62&&!changed.length);
  const html=read('v2/index.html'),fragment=manifest.fragments[0];
  check('Intro/Hero subtree identical',hash(Buffer.from(html.slice(html.indexOf(fragment.startMarker),html.indexOf(fragment.endMarker))))===fragment.sha256);
  for(const f of ['v2/site.css','v2/chrome.js','v2/data/content.mjs','v2/data/site-data.js','v2/fundraising-progress.mjs'])check(f+' unchanged',read(f).trimEnd()===old(f));
  const slice=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
  const template=read('v2/tools/site-templates.mjs'),original=old('v2/tools/site-templates.mjs');
  check('People/About markup unchanged',slice(template,'export function about(','\nfunction tabs(')===slice(original,'export function about(','\nfunction tabs('));
  check('Archive card markup unchanged',slice(template,'export function archive(','\nexport function projectDetail(')===slice(original,'export function archive(','\nexport function projectDetail('));
  const stripController=s=>s.replace(/\/\/ Native touch scrolling,[\s\S]*?(?=\/\/ Reveal once,)/,'');
  check('site.js outside shared rail controller unchanged',stripController(read('v2/site.js')).trimEnd()===stripController(old('v2/site.js')));
  check('Builder only changes editorial cache revision',read('v2/tools/build-site.mjs').replace("editorialVersion='recovery-batch1-fix1'","editorialVersion='recovery-batch1-1'").trimEnd()===old('v2/tools/build-site.mjs'));
  const pages=['index.html','team/index.html','du-an/index.html','dong-hanh/index.html','tinh-nguyen-vien/index.html','du-an/vet-nut/index.html','du-an/go-ngai/index.html','team/phan-ban/index.html'];
  for(const p of pages){
    const current=read('v2/'+p),previous=old('v2/'+p);
    const expected=previous.replaceAll('recovery-batch1-1','recovery-batch1-fix1').replaceAll('<span class="rail-count" aria-live="polite">1 / 3</span>','<span class="rail-count" aria-live="polite" aria-atomic="true"></span>').replaceAll('<h3>Doanh nghiệp đồng hành</h3>','<h3>Doanh nghiệp đồng hành và tài trợ</h3>');
    check(p+' generated delta limited to approved fixes/cache',current.trimEnd()===expected);
  }
  const allowed=new Set(['v2/site.js','v2/tools/site-templates.mjs','v2/tools/build-site.mjs',...pages.map(p=>'v2/'+p)]);
  result.changedTrackedFiles=git('diff',base,'--name-only').split('\n').filter(Boolean);
  check('Only authorized tracked files changed',result.changedTrackedFiles.every(f=>allowed.has(f)||f==='docs/recovery/reviews/BATCH_01_CORRECTIONS.md'||f.startsWith('docs/recovery/reviews/assets/batch-01-corrections/')));
  git('diff',base,'--check');check('Git whitespace check',true);
  result.status='passed';
}catch(e){result.status='failed';result.error=e.message;process.exitCode=1;console.error(e.message);}
fs.writeFileSync('docs/recovery/reviews/assets/batch-01-corrections/preservation.json',JSON.stringify(result,null,2)+'\n');
