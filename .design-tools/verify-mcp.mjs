import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import readline from 'node:readline';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const directory = path.dirname(fileURLToPath(import.meta.url));
const project = path.dirname(directory);
const output = path.join(directory, 'output');
fs.mkdirSync(output, { recursive: true });
const configuration = fs.readFileSync(path.join(project, '.codex/config.toml'), 'utf8');
const command = configuration.match(/^command = '([^']+)'/m)?.[1];
const args = [...configuration.match(/^args = \[(.+)\]/m)[1].matchAll(/'([^']*)'/g)].map(match => match[1]);
assert.ok(command && fs.existsSync(args[0]), 'Configured MCP executable must exist.');
const evidence = { startedAt: new Date().toISOString(), configuration: '.codex/config.toml', checks: [], screenshots: [] };
const processHandle = spawn(command, args, { cwd: project, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
const pending = new Map();
let id = 0;
let server;
let stderr = '';
processHandle.stderr.on('data', data => { stderr = (stderr + data).slice(-4000); });
const lines = readline.createInterface({ input: processHandle.stdout });
lines.on('line', line => {
  let message;
  try { message = JSON.parse(line); } catch { return; }
  if (message.id !== undefined && pending.has(message.id)) {
    const item = pending.get(message.id);
    pending.delete(message.id);
    clearTimeout(item.timer);
    if (message.error) item.reject(new Error(JSON.stringify(message.error)));
    else item.resolve(message.result);
  } else if (message.method && message.id !== undefined) {
    const result = message.method === 'roots/list' ? { roots: [{ uri: new URL(`file:///${project.replaceAll('\\', '/')}/`).href, name: 'poet' }] } : {};
    processHandle.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: message.id, result }) + '\n');
  }
});
processHandle.on('error', error => { for (const item of pending.values()) item.reject(error); });
processHandle.on('exit', code => {
  for (const item of pending.values()) { clearTimeout(item.timer); item.reject(new Error(`MCP exited ${code}: ${stderr}`)); }
  pending.clear();
});
function request(method, params = {}) {
  return new Promise((resolve, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`MCP timeout: ${method}; ${stderr}`)); }, 45000);
    pending.set(requestId, { resolve, reject, timer });
    processHandle.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: requestId, method, params }) + '\n');
  });
}
async function call(name, args = {}) {
  const result = await request('tools/call', { name, arguments: args });
  const text = result.content?.filter(item => item.type === 'text').map(item => item.text).join('\n') ?? '';
  if (result.isError) throw new Error(`${name}: ${text}`);
  return { result, text };
}
async function screenshot(name) {
  const filename = `.design-tools/output/${name}.png`;
  const result = await call('browser_take_screenshot', { type: 'png', filename, scale: 'css' });
  const absolute = path.join(project, filename);
  const image = result.result.content?.find(item => item.type === 'image');
  if (!fs.existsSync(absolute) && image) fs.writeFileSync(absolute, Buffer.from(image.data, 'base64'));
  assert.ok(fs.statSync(absolute).size > 1000, `Screenshot ${name} must contain image data.`);
  evidence.screenshots.push(filename);
}
function check(name, result = true) { evidence.checks.push({ name, result }); console.log(JSON.stringify({ check: name, result })); }
try {
  const initialized = await request('initialize', { protocolVersion: '2024-11-05', capabilities: { roots: { listChanged: false } }, clientInfo: { name: 'codex-project-design-qa', version: '1.0.0' } });
  evidence.serverInfo = initialized.serverInfo;
  processHandle.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const catalog = await request('tools/list');
  fs.writeFileSync(path.join(output, 'mcp-tools.json'), JSON.stringify(catalog, null, 2) + '\n');
  evidence.toolCount = catalog.tools.length;
  for (const name of ['browser_navigate', 'browser_resize', 'browser_take_screenshot', 'browser_evaluate', 'browser_snapshot', 'browser_click', 'browser_hover', 'browser_press_key', 'browser_close']) assert.ok(catalog.tools.some(tool => tool.name === name), `${name} advertised`);
  check('MCP initialization and tool discovery', { server: initialized.serverInfo, tools: catalog.tools.length });
  if (!process.argv.includes('--discover')) {
    const contentTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.otf': 'font/otf', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };
    server = http.createServer((req, res) => {
      let requestPath;
      try { requestPath = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); } catch { res.writeHead(400).end(); return; }
      if (requestPath.split('/').some(part => part.startsWith('.'))) { res.writeHead(403).end(); return; }
      let file = path.resolve(project, '.' + requestPath);
      if (!file.startsWith(project + path.sep) && file !== project) { res.writeHead(403).end(); return; }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      const type = contentTypes[path.extname(file).toLowerCase()];
      if (!type) { res.writeHead(404).end(); return; }
      fs.readFile(file, (error, bytes) => { if (error) res.writeHead(404).end(); else { res.writeHead(200, { 'Content-Type': type }); res.end(bytes); } });
    });
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    const base = `http://127.0.0.1:${server.address().port}`;
    await call('browser_navigate', { url: base + '/' });
    const gsap = await call('browser_evaluate', { function: `async () => { const deadline = Date.now() + 15000; while (!window.gsap && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 200)); return {version: window.gsap?.version ?? null, title: document.title}; }` });
    evidence.gsapRuntime = gsap.text;
    check('Original homepage opened; GSAP runtime observation', gsap.text);
    await call('browser_navigate', { url: base + '/v2/' });
    for (const [name, width, height] of [['desktop', 1440, 1000], ['tablet', 768, 1024], ['mobile', 390, 844]]) {
      await call('browser_resize', { width, height });
      const measurement = await call('browser_evaluate', { function: `async () => { await document.fonts.ready; return {width: innerWidth, scrollWidth: document.documentElement.scrollWidth, horizontalOverflow: document.documentElement.scrollWidth > innerWidth, heading: document.querySelector('h1')?.textContent?.trim()}; }` });
      evidence.checks.push({ name: `${name} rendered measurement`, result: measurement.text });
      await screenshot(name);
    }
    const snapshot = await call('browser_snapshot');
    fs.writeFileSync(path.join(output, 'mobile-snapshot.txt'), snapshot.text);
    const menuLine = snapshot.text.split('\n').find(line => /button "Menu"/.test(line));
    const menuRef = menuLine?.match(/\[ref=([^\]]+)\]/)?.[1];
    assert.ok(menuRef, 'Visible mobile Menu button discovered in MCP snapshot.');
    await call('browser_click', { element: 'Menu button', target: menuRef });
    const menu = await call('browser_evaluate', { function: `() => ({expanded: document.querySelector('.nav-toggle').getAttribute('aria-expanded')})` });
    assert.match(menu.text, /"expanded":\s*"true"/);
    check('Mobile menu clicked through MCP', true);
    await screenshot('mobile-menu');
    await call('browser_press_key', { key: 'Escape' });
    await call('browser_resize', { width: 1440, height: 1000 });
    const desktopSnapshot = await call('browser_snapshot');
    const linkLine = desktopSnapshot.text.split('\n').find(line => /link "Trang chủ".*\[ref=/.test(line));
    assert.ok(linkLine, 'Homepage navigation link discovered in desktop snapshot.');
    await call('browser_hover', { element: 'Homepage navigation link', target: linkLine.match(/\[ref=([^\]]+)\]/)[1] });
    check('Navigation hover through MCP', true);
    await call('browser_press_key', { key: 'PageDown' });
    const scroll = await call('browser_evaluate', { function: `() => ({scrollY})` });
    assert.match(scroll.text, /"scrollY":\s*[1-9]/);
    check('Page scroll through MCP', scroll.text);
    await call('browser_emulate_media', { reducedMotion: 'reduce' });
    await call('browser_navigate', { url: base + '/v2/' });
    const reduced = await call('browser_evaluate', { function: `() => ({ reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, heading: document.querySelector('h1')?.textContent?.trim(), horizontalOverflow: document.documentElement.scrollWidth > innerWidth })` });
    assert.match(reduced.text, /"reducedMotion":\s*true/);
    check('Reduced-motion browser emulation', reduced.text);
    await call('browser_close');
  }
  evidence.status = 'passed';
} catch (error) {
  evidence.status = 'failed';
  evidence.error = error.message;
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (server) await new Promise(resolve => server.close(resolve));
  processHandle.stdin.end();
  const shutdownTimer = setTimeout(() => processHandle.kill(), 2000);
  shutdownTimer.unref();
  fs.writeFileSync(path.join(output, 'mcp-verification.json'), JSON.stringify(evidence, null, 2) + '\n');
}
