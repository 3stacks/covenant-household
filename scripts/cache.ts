// Downloads with a local copy in .cache/sources/, for the build scripts.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const cache = join(fileURLToPath(new URL('..', import.meta.url)), '.cache/sources')
export const offline = process.argv.includes('--offline')

export async function getJson(url: string): Promise<unknown> {
  const file = join(cache, url.replace(/^https?:\/\//, ''))
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'))
  if (offline) throw new Error(`Not in the cache: ${url}`)
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${url}: ${r.status}`)
  const text = await r.text()
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text)
  return JSON.parse(text)
}

/** A text file, with a local copy in .cache/sources/. */
export async function getText(url: string): Promise<string> {
  const file = join(cache, url.replace(/^https?:\/\//, ''))
  if (existsSync(file)) return readFileSync(file, 'utf8')
  if (offline) throw new Error(`Not in the cache: ${url}`)
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${url}: ${r.status}`)
  const text = await r.text()
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text)
  return text
}

export const HEARERS_DATA = 'https://hearers.app/app/data'
export const PRECENTOR_CORPUS = 'https://precentor.app/corpus'

/** The KJV text of a book, from Hearers: chapters, then verses. */
export const kjvBook = (code: string) => getJson(`${HEARERS_DATA}/kjv/${code}.json`) as Promise<string[][]>
