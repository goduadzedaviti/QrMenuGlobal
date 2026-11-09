const fs = require('fs');
const path = require('path');

const backendUrl = process.env.BACKEND_URL;
if (backendUrl) {
  const envFile = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
  if (fs.existsSync(envFile)) {
    let content = fs.readFileSync(envFile, 'utf8');
    const cleanUrl = backendUrl.replace(/\/+$/, '');
    content = content.replace(/apiUrl:\s*['"][^'"]*['"]/, `apiUrl: '${cleanUrl}/api'`);
    content = content.replace(/baseUrl:\s*['"][^'"]*['"]/, `baseUrl: '${cleanUrl}'`);
    fs.writeFileSync(envFile, content, 'utf8');
    console.log(`[build] Successfully updated environment.prod.ts with BACKEND_URL: ${cleanUrl}`);
  }
} else {
  console.log('[build] No BACKEND_URL provided, keeping default environment.prod.ts');
}

