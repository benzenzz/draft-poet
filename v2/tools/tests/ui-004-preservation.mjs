import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const base='b7a44ede1545e5ccb2f8080fad85ecc6e4ac4ec3',out=path.resolve('.design-tools/output/ui-004');fs.mkdirSync(out,{recursive:true});
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',windowsHide:true}).trimEnd();
const normalize=s=>s.replaceAll('\r\n','\n').trimEnd();
const read=f=>normalize(fs.readFileSync(f,'utf8')),old=f=>normalize(git('show',base+':'+f));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const report={base,checks:[]};
const check=(name,ok)=>{report.checks.push({name,passed:!!ok});assert(ok,name);console.log('PASS '+name);};
const section=(text,start,end)=>{assert(text.includes(start)&&text.includes(end));return text.slice(text.indexOf(start),text.indexOf(end,text.indexOf(start)));};
try{
 git('merge-base','--is-ancestor',base,'HEAD');check('Expected Codex branch and UI-002 ancestor',git('branch','--show-current')==='codex/poet-requirements-polish');
 const localBaseline=path.join(out,'baseline.json'),original=JSON.parse(fs.readFileSync(fs.existsSync(localBaseline)?localBaseline:'docs/collaboration/reviews/assets/UI-004/baseline.json','utf8'));
 if(process.argv.includes('--review-checkout'))report.unverified=['Original 23 untracked files and ignored classroom source are local-only; use recorded provenance for independent checkout review.'];
 else check('23 existing untracked files byte-identical',original.untracked.length===23&&original.untracked.every(e=>sha(fs.readFileSync(e.file))===e.sha256));
 const protectedFiles=JSON.parse(read('docs/recovery/POET_PROTECTED_BASELINE.json'));
 const changed=protectedFiles.files.filter(e=>e.file!=='v2/activity-carousel.js'&&sha(fs.readFileSync(e.file))!==e.sha256);
 check('61 original protected files byte-identical',changed.length===0);
 const frag=protectedFiles.fragments[0],html=read('v2/index.html');check('Exact Intro / Hero / board / handoff fragment preserved',sha(Buffer.from(section(html,frag.startMarker,frag.endMarker)))===frag.sha256);
 for(const f of ['v2/activity-carousel.js','v2/press-strip.js','v2/fundraising-progress.mjs','v2/fundraising-reveal.mjs','v2/data/content.mjs','v2/data/site-data.js','assets/css/typography.css'])check(f+' unchanged from UI-002',read(f)===old(f));
 const tpl=read('v2/tools/site-templates.mjs'),before=old('v2/tools/site-templates.mjs');
 for(const [name,start,end]of [['People / About markup','export function about(','\nfunction tabs('],['Archive markup / geometry','export function archive(','\nexport function projectDetail('],['About / Projects participation copy','export function participation(','\nfunction pressLogoStrip('],['Original Home fundraising data and markup','function homeFundraising(','\nfunction homeCampaign('],['Activity template and motion markup','function activityCover(','\nexport function fundraising(']]){
  check(name+' preserved',section(tpl,start,end)===section(before,start,end));
 }
 const css=read('v2/site.css'),oldCss=old('v2/site.css');
 const geometry=oldCss.split('\n').filter(line=>/^\.(archive-grid|story-card|story-copy|media-card|media-rail)/.test(line));check('Existing archive/media CSS declarations untouched',geometry.every(line=>css.includes(line)));
 const routes=['v2/team/index.html','v2/du-an/index.html','v2/dong-hanh/index.html','v2/tinh-nguyen-vien/index.html','v2/du-an/vet-nut/index.html','v2/du-an/go-ngai/index.html','v2/team/phan-ban/index.html'];
 check('Seven other generated routes only refresh editorial cache revisions',routes.every(f=>read(f).replace(/ui-004-\d+/g,'ui-002-1')===old(f)));
 const financeFiles=git('ls-tree','-r','--name-only',base,'--','worker','ung-ho','admin','.github','wrangler.toml','netlify.toml','vercel.json').split('\n').filter(Boolean);check('All '+financeFiles.length+' payment / Worker / admin / deployment files unchanged',financeFiles.every(f=>read(f)===old(f)));
 const site=read('v2/site.js').replace("import {initLocalFundraisingPreview} from './fundraising-preview.mjs';\n",'').replace('initLocalFundraisingPreview();\n','');check('site.js only adds isolated local fixture initialization',site===old('v2/site.js'));
 const photoSource='New materials/Ảnh lớp học.jpg',photoHash=sha(fs.readFileSync('assets/photos/classroom-footer.jpg'));
 check('Footer photo matches verified source hash',photoHash===(process.argv.includes('--review-checkout')?'14da4b9825d6bfd7393f9faf442b09ac0965fd84ce9257a1d6c80187173a67aa':sha(fs.readFileSync(photoSource))));
 git('diff','--check');check('Git diff whitespace',true);report.status='passed';
}catch(e){report.status='failed';report.error=e.stack;process.exitCode=1;console.error(e.stack);}finally{fs.writeFileSync(path.join(out,'preservation.json'),JSON.stringify(report,null,2));}
