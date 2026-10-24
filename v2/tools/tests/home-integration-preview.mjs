import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {chromium} from '../../../.design-tools/node_modules/playwright/index.mjs';
const out=path.resolve('.design-tools/output/home-integration/preview'),origin='http://127.0.0.1:8766';fs.mkdirSync(out,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const report={checkedAt:new Date().toISOString(),root:process.cwd(),branch:execFileSync('git',['branch','--show-current'],{encoding:'utf8',windowsHide:true}).trim(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),files:[],screenshots:[]};
for(const file of ['v2/index.html','v2/site.css','v2/site.js','v2/chrome.js','v2/world.js','v2/world.css','assets/fonts/suaserif-bold.otf','v2/fonts/Product Sans Bold.otf']){
 const response=await fetch(origin+'/'+file.split('/').map(encodeURIComponent).join('/')+'?review=home-integration'),buffer=Buffer.from(await response.arrayBuffer()),local=sha(fs.readFileSync(file)),served=sha(buffer);
 assert.equal(response.status,200,file);assert.equal(served,local,'Preview must serve current worktree bytes: '+file);report.files.push({file,status:response.status,contentType:response.headers.get('content-type'),sha256:served});
}
const home=fs.readFileSync('v2/index.html','utf8');assert(home.includes('projects-detail-2')&&home.includes('press-grid')&&home.includes('class="action-icon"')&&home.includes('mỗi hành động đều có ý nghĩa'));
if(!process.argv.includes('--identity-only')){
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:width===1440?900:844},reducedMotion:'reduce'});await page.goto(origin+'/v2/?heroMotion=respect&pressMotion=respect',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  const selectors=width===1440?[['1440-archive','#dau-an']]:[['390-archive-card-1','.story-card >> nth=0'],['390-archive-card-2','.story-card >> nth=1']];
  for(const [name,selector]of selectors){const target=page.locator(selector);await target.evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top,behavior:'instant'}));await page.waitForTimeout(100);const rect=await target.boundingBox();assert(rect.height<=page.viewportSize().height,'Focused archive screenshot should fit the viewport');await target.screenshot({path:path.join(out,name+'.png'),style:'poet-nav.site-nav{visibility:hidden!important}'});report.screenshots.push({file:name+'.png',viewport:page.viewportSize(),selector,stickyHeaderHidden:true});}
  await page.close();
 }}finally{await browser.close();}
}
fs.writeFileSync(path.join(out,process.argv.includes('--identity-only')?'served-after-commit.json':'preview-proof.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({branch:report.branch,head:report.head,servedFiles:report.files.length,screenshots:report.screenshots.length}));
