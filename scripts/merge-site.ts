// Put the built web app (apps/web/dist/) under the built homepage
// (apps/site/out/app/), so one folder holds the public site. Run by `npm run site`.
import { cpSync, existsSync, rmSync } from 'node:fs'

const app = 'apps/web/dist'
const site = 'apps/site/out'
if (!existsSync(`${app}/index.html`)) throw new Error(`${app}/ is missing: run \`npm run build\` first`)
if (!existsSync(`${site}/index.html`)) throw new Error(`${site}/ is missing: run \`npm --prefix apps/site run build\` first`)
rmSync(`${site}/app`, { recursive: true, force: true })
cpSync(app, `${site}/app`, { recursive: true })
console.log(`${site}/ holds the homepage, and ${site}/app/ holds the web app`)
