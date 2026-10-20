// Local preview for the entire POET tree, including V2's shared assets.
// Keep this process running while using http://127.0.0.1:8766/v2/.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.pdf':'application/pdf','.otf':'font/otf','.woff':'font/woff','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
  let file;
  try{
    let name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    if(name.startsWith('/poet/'))name=name.slice(5);
    file=path.resolve(root,'.'+name);
    const relative=path.relative(root,file);
    if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative)){res.writeHead(403).end();return;}
    if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
    const data=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file).toLowerCase()]||'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-store'});
    res.end(req.method==='HEAD'?undefined:data);
  }catch(error){res.writeHead(error instanceof URIError?400:404).end();}
});
server.on('error',error=>{
  console.error(error.code==='EADDRINUSE'?'Port 8766 is already in use. Check the existing preview at http://127.0.0.1:8766/v2/.':error.message);
  process.exitCode=1;
});
server.listen(8766,'127.0.0.1',()=>console.log('POET V2 preview: http://127.0.0.1:8766/v2/\nKeep this process running. Press Ctrl+C to stop.'));
