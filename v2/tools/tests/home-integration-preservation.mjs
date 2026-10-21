import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const codex='974d33140bc6375742405bfc190dda662ee15112',claude='775fc596ec644c22927bb6029c0c6190a6cd0b63';
const out=path.resolve('.design-tools/output/home-integration');fs.mkdirSync(out,{recursive:true});
const git=(...args)=>execFileSync('git',['-c','core.safecrlf=false',...args],{encoding:'utf8',windowsHide:true}).trimEnd();
const norm=s=>s.replaceAll('\r\n','\n').trimEnd(),read=f=>norm(fs.readFileSync(f,'utf8')),old=(sha,f)=>norm(git('show',sha+':'+f));
const slice=(s,a,b)=>{assert(s.includes(a)&&s.includes(b));return s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));};
const report={codex,claude,checks:[]};const check=(name,ok)=>{report.checks.push({name,passed:!!ok});assert(ok,name);console.log('PASS '+name);};
try{
 check('Common ancestor is the shared website setup checkpoint',git('merge-base',codex,claude)==='11d29756086f591d868c986c1d1484f0f0a2ad84');
 for(const f of ['v2/world.js','v2/world.css','v2/tools/board-playground.mjs'])check(f+' exactly matches Claude',read(f)===old(claude,f));
 for(const f of ['v2/chrome.js','v2/activity-carousel.js','v2/press-strip.js','v2/fundraising-progress.mjs','v2/fundraising-reveal.mjs','v2/fundraising-preview.mjs','v2/data/content.mjs','v2/data/site-data.js','assets/css/typography.css'])check(f+' exactly matches Codex',read(f)===old(codex,f));
 const html=read('v2/index.html'),heroStart='<div class="hero-wrap world-wrap',heroEnd='<poet-nav class="site-home-nav';
 check('Embedded Intro / Hero / board SVG exactly matches Claude',slice(html,heroStart,heroEnd)===slice(old(claude,'v2/index.html'),heroStart,heroEnd));
 const template=read('v2/tools/site-templates.mjs'),ct=old(codex,'v2/tools/site-templates.mjs'),lt=old(claude,'v2/tools/site-templates.mjs');
 check('Activity template is Codex version without obsolete playback control',template.split('\n').find(l=>l.startsWith('function activityCarousel('))===ct.split('\n').find(l=>l.startsWith('function activityCarousel(')));
 for(const name of ['press','archive'])check(name+' template exactly matches Claude',template.split('\n').find(l=>l.startsWith('export function '+name+'('))===lt.split('\n').find(l=>l.startsWith('export function '+name+'(')));
 check('Home fundraising markup/data and initialization preserved',slice(template,'function homeFundraising(','\nfunction homeCampaign(')===slice(ct,'function homeFundraising(','\nfunction homeCampaign('));
 check('Home lowercase participation / colored icons / CTA copy preserved',slice(template,'function homeParticipation(','\nexport function home(')===slice(ct,'function homeParticipation(','\nexport function home('));
 check('People / About source not separately redesigned',slice(template,'export function about(','\nfunction tabs(')===slice(ct,'export function about(','\nfunction tabs('));
 const js=read('v2/site.js'),codexJs=old(codex,'v2/site.js'),claudeJs=old(claude,'v2/site.js');
 const mergedJs=codexJs.replace(/\/\/ Native touch scrolling[\s\S]*?(?=\/\/ Reveal once)/,'').replace(slice(codexJs,'// Reveal once','const counters='),slice(claudeJs,'// Reveal once','const counters='));
 check('site.js combines Codex imports/fixture with Claude reveal/removal of rail only',js===mergedJs);
 const css=read('v2/site.css'),cc=old(codex,'v2/site.css'),lc=old(claude,'v2/site.css');
 check('Claude press-grid CSS is preserved',slice(css,'/* Góc nhìn truyền thông:', '.join-section{background:')===slice(lc,'/* Góc nhìn truyền thông:', '.join-section{background:'));
 check('Claude archive layout / reveal CSS is preserved',slice(css,'/* Two cards across','.archive-section>.text-link')===slice(lc,'/* Two cards across','.archive-section>.text-link'));
 check('Codex Product Sans header CSS is preserved',slice(css,'/* UI-004: use the supplied','/* Home card only')===slice(cc,'/* UI-004: use the supplied','/* Home card only'));
 check('Codex fundraising reveal / CTA styling is preserved',slice(css,'/* Home card only','/* UI-004: editorial ink')===slice(cc,'/* Home card only','/* UI-004: editorial ink'));
 const codexEnd=cc.slice(cc.indexOf('/* UI-004: editorial ink')).replace('.site-content :is(.story-copy,.media-card) h3 a:focus-visible{color:var(--poet-green-dark)}\n','').replace('@media(hover:hover) and (pointer:fine){.site-content :is(.story-copy,.media-card) h3 a:hover{color:var(--poet-green-dark)}}\n','');
 check('Warm headings / Home participation / plain footer preserved; Claude owns card hover',css.slice(css.indexOf('/* UI-004: editorial ink'))===codexEnd);
 check('Obsolete press-rail controller/template/style fragments removed',!js.includes("querySelectorAll('[data-carousel]')")&&!template.includes('function rail(')&&!css.match(/\.rail(?:\{|[ .:]|-controls|-help)/));
 for(const ref of [codex,claude]){
  const assetChanges=git('diff',ref,'--name-status','--','assets','v2/fonts').split('\n').filter(Boolean);
  check('All existing assets/fonts from '+ref.slice(0,7)+' retained unchanged',assetChanges.every(l=>l.startsWith('A\t')));
 }
 check('Payment / QR / Worker / admin / deployment unchanged',git('diff',codex,'--name-only','--','ung-ho','worker','admin','.github','wrangler.toml','netlify.toml','vercel.json','.nojekyll')==='');
 check('Hero cache patch and fresh merged editorial revision applied',read('v2/tools/build-site.mjs').includes("const heroVersion='ui-001-1';")&&html.includes('world.js?v=ui-001-1')&&html.includes('site.css?v=home-integration-1'));
 for(const f of ['v2/site.css','v2/site.js','v2/tools/site-templates.mjs','v2/index.html','v2/team/index.html'])check(f+' has no conflict markers',!read(f).match(/^(<<<<<<<|=======|>>>>>>>)/m));
 if(process.argv.includes('--review-checkout'))report.unverified=['Machine-local backup refs, untracked files and Claude working tree intentionally skipped for independent review checkout.'];
 else{
  const pre=JSON.parse(fs.readFileSync(path.join(out,'preflight.json'),'utf8'));
  check('Both backup refs and both source branches remain at original SHAs',git('rev-parse',pre.backupCodex)===codex&&git('rev-parse',pre.backupClaude)===claude&&git('rev-parse','codex/poet-requirements-polish')===codex&&git('rev-parse','claude/ui-feedback')===claude);
  check('All 23 existing untracked files remain byte-identical',pre.untracked.length===23&&pre.untracked.every(e=>crypto.createHash('sha256').update(fs.readFileSync(e.file)).digest('hex')===e.sha256));
  const status=execFileSync('git',['-C',pre.claudeRoot,'status','--porcelain','--untracked-files=all'],{encoding:'utf8',windowsHide:true}).trim();check('Claude worktree remains clean',status==='');
 }
 git('diff','--check');report.status='passed';
}catch(e){report.status='failed';report.error=e.stack;process.exitCode=1;console.error(e.stack);}finally{fs.writeFileSync(path.join(out,'preservation.json'),JSON.stringify(report,null,2)+'\n');}
