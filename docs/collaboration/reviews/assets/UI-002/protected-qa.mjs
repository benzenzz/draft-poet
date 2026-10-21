import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const root=fs.existsSync('v2')?process.cwd():path.resolve('poet'),base='11d29756086f591d868c986c1d1484f0f0a2ad84',out=fs.existsSync('v2')?path.resolve('.design-tools/output/ui-002-qa'):path.resolve('audit-work/ui-002');fs.mkdirSync(out,{recursive:true});
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true}).trimEnd();const read=f=>fs.readFileSync(path.join(root,f),'utf8').replaceAll('\r\n','\n').trimEnd();const old=f=>git('show',base+':'+f).replaceAll('\r\n','\n');const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const result={base,checks:[]};const check=(name,passed)=>{result.checks.push({name,passed});assert(passed,name);console.log('PASS '+name);};
try{
 git('merge-base','--is-ancestor',base,'HEAD');check('Correct Codex branch/base ancestry',git('branch','--show-current')==='codex/poet-requirements-polish');
 const snapshotFile=fs.existsSync(path.join(out,'baseline.json'))?path.join(out,'baseline.json'):path.join(root,'docs/collaboration/reviews/assets/UI-002/untracked-baseline.json');
 const snapshot=JSON.parse(fs.readFileSync(snapshotFile,'utf8')),originals=snapshot.untracked.filter(f=>f.file!=='v2/fundraising-reveal.mjs');
 if(process.argv.includes('--skip-local-untracked'))result.unverified=['Original local untracked assets intentionally unavailable in this review checkout.'];
 else check('All 23 original untracked files byte-identical',originals.length===23&&originals.every(f=>sha(fs.readFileSync(path.join(root,f.file)))===f.sha256));
 const protectedFiles=JSON.parse(read('docs/recovery/POET_PROTECTED_BASELINE.json'));
 const changed=protectedFiles.files.filter(f=>f.file!=='v2/activity-carousel.js'&&sha(fs.readFileSync(path.join(root,f.file)))!==f.sha256);
 check('61 protected files unchanged; activity-carousel is explicit ticket exception',changed.length===0);
 const fragment=protectedFiles.fragments[0],html=read('v2/index.html');check('Exact Intro/board/Hero subtree unchanged',sha(Buffer.from(html.slice(html.indexOf(fragment.startMarker),html.indexOf(fragment.endMarker))))===fragment.sha256);
 const section=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
 const fund=read('v2/fundraising-progress.mjs'),fundBefore=old('v2/fundraising-progress.mjs');
 check('Financial calculation unchanged',section(fund,'export function fundraisingState','export function fundraisingStyle')===section(fundBefore,'export function fundraisingState','export function fundraisingStyle'));
 check('Original milestone mapping unchanged',section(fund,'export const fundraisingMilestones','export function fundraisingState')===section(fundBefore,'export const fundraisingMilestones','export function fundraisingState'));
 for(const file of ['v2/data/content.mjs','v2/data/site-data.js','v2/press-strip.js','v2/world.js','v2/world.css','assets/css/typography.css'])check(file+' unchanged',read(file)===old(file));
 const templates=read('v2/tools/site-templates.mjs'),before=old('v2/tools/site-templates.mjs');
 for(const [name,a,b] of [['About/People','export function about(','\nfunction tabs('],['Archive geometry/markup','export function archive(','\nexport function projectDetail('],['Project fundraising template','export function fundraising(','\nconst uiIcon=']])check(name+' untouched',section(templates,a,b)===section(before,a,b));
 check('site.js changes only import cache revisions',read('v2/site.js').replace("./fundraising-progress.mjs?v=ui-002-1","./fundraising-progress.mjs?v=header-about-funding-1").replace("./activity-carousel.js?v=ui-002-1","./activity-carousel.js?v=poet-v3-1")===old('v2/site.js'));
 const allowed=new Set(['ASSET_STATUS.md','v2/site.css','v2/site.js','v2/chrome.js','v2/activity-carousel.js','v2/fundraising-progress.mjs','v2/tools/site-templates.mjs','v2/tools/build-site.mjs','v2/index.html','v2/team/index.html','v2/du-an/index.html','v2/dong-hanh/index.html','v2/tinh-nguyen-vien/index.html','v2/du-an/vet-nut/index.html','v2/du-an/go-ngai/index.html','v2/team/phan-ban/index.html']);
 result.changed=git('diff',base,'--name-only').split('\n').filter(Boolean);check('No unrelated tracked edits',result.changed.every(f=>allowed.has(f)||['v2/fundraising-reveal.mjs','v2/tools/tests/ui-002.test.mjs','assets/fonts/cookie-crumble-demo.otf','docs/collaboration/reviews/UI-002.md'].includes(f)||f.startsWith('docs/collaboration/reviews/assets/UI-002/')));
 git('diff',base,'--check');check('Git diff whitespace',true);result.status='passed';
}catch(e){result.status='failed';result.error=e.message;process.exitCode=1;console.error(e.message);}
fs.writeFileSync(path.join(out,'preservation.json'),JSON.stringify(result,null,2)+'\n');
