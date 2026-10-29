// Reproducible static delivery: core, MotionPathPlugin and the package's license notice.
import fs from 'node:fs';
const root=new URL('../',import.meta.url),pkg=new URL('node_modules/gsap/',root);
const manifest=JSON.parse(fs.readFileSync(new URL('package.json',pkg),'utf8'));
if(manifest.version!=='3.13.0')throw new Error('Unexpected GSAP version: '+manifest.version);
const dest=new URL('vendor/gsap/',root);fs.mkdirSync(dest,{recursive:true});
for(const name of ['gsap.min.js','MotionPathPlugin.min.js'])fs.copyFileSync(new URL('dist/'+name,pkg),new URL(name,dest));
fs.copyFileSync(new URL('README.md',pkg),new URL('README.md',dest));
fs.writeFileSync(new URL('NOTICE.txt',dest),`GSAP ${manifest.version}\n${manifest.license}\nhttps://gsap.com/standard-license\nOriginal copyright headers are retained in both distribution files.\n`);
console.log('Vendored GSAP '+manifest.version+' core + MotionPathPlugin (no extra plugins).');
