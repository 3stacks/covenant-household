const path = require('node:path')

/**
 * A static export. `npm run site` at the repository root builds the app into
 * out/app/, so one folder holds the homepage and the app.
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // The readings pages use the shared code in packages/core and the calendar
  // in apps/web/public/calendar/, so the root is the repository root.
  turbopack: { root: path.join(__dirname, '../..') },
  outputFileTracingRoot: path.join(__dirname, '../..'),
}

module.exports = nextConfig
