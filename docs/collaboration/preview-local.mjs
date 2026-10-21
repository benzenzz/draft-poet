// Optional worktree-local launcher. The existing v2/tools/preview.mjs is unchanged.
// Run from either checkout: node docs/collaboration/preview-local.mjs --port 8767
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--port'||!/^\d+$/.test(args[1]))throw new Error('Usage: node docs/collaboration/preview-local.mjs --port <1-65535>');
const port=Number(args[1]);
if(port<1||port>65535)throw new Error('Invalid port');
const root=await fs.realpath(fileURLToPath(new URL('../../',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.pdf':'application/pdf','.otf':'font/otf','.woff':'font/woff','.woff2':'font/woff2','.json':'application/json; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
  try{
    const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    if(name==='/__poet_preview_identity'){
      const data=JSON.stringify({root,port,pid:process.pid});
      res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Content-Length':Buffer.byteLength(data)});
      res.end(req.method==='HEAD'?undefined:data);return;
    }
    let file=path.resolve(root,'.'+name);
    const relative=path.relative(root,file);
    if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative)){res.writeHead(403).end();return;}
    if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
    const data=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file).toLowerCase()]||'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-store'});
    res.end(req.method==='HEAD'?undefined:data);
  }catch(error){res.writeHead(error instanceof URIError?400:404).end();}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is occupied; identify its owner before restarting anything.`:error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`POET preview: http://127.0.0.1:${port}/v2/\nRepository: ${root}\nPID: ${process.pid}\nKeep running; Ctrl+C stops this server only.`));
