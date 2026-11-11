import { createServer } from 'node:http'
import { createReadStream, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
const report=JSON.parse(await readFile('artifacts/consumer-toolchains/build-report.json','utf8'))
if(report.cases.length!==10)throw new Error('Incomplete consumer builds')
const servers=[],mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.map':'application/json','.txt':'text/plain; charset=utf-8'}
let stopping=false
function stop(){if(stopping)return;stopping=true;for(const server of servers){server.close();server.closeAllConnections()}}
process.on('SIGINT',stop);process.on('SIGTERM',stop)
for(const [index,entry]of report.cases.entries()){
  const root=path.resolve('artifacts/consumer-toolchains/builds',entry.name)
  const server=createServer((request,response)=>{
    try{
      const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname)
      let file=path.resolve(root,'.'+pathname),relative=path.relative(root,file)
      if(relative.startsWith('..')||path.isAbsolute(relative)){response.writeHead(403).end();return}
      if(statSync(file).isDirectory())file=path.join(file,'index.html')
      response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'})
      const stream=createReadStream(file);stream.on('error',()=>response.destroy());response.on('close',()=>stream.destroy());stream.pipe(response)
    }catch{response.writeHead(404).end('Not found')}
  })
  servers.push(server);server.keepAliveTimeout=60000
  server.on('error',error=>{console.error(error);process.exitCode=1;stop()})
  server.listen(4180+index,'127.0.0.1',()=>console.log(entry.name+': http://127.0.0.1:'+(4180+index)+'/'))
}
