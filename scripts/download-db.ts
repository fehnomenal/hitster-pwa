import type { SongDetailed, VideoDetailed } from 'ytmusic-api'
import { exists, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import transliterate from '@sindresorhus/transliterate'
import { decode } from 'he'
import { retryAsync } from 'ts-retry'
import YTMusic from 'ytmusic-api'

const OVERRIDE_TRACKS: Record<string, string> = {
  '1OxDEvjPoQrNhZ5c3tTxSu': 'g70mUTlK5es',
  '1rijHA5veEZDV5CrGLpex6': '_cvE25yYtfo',
  '3kJrESsM3ISObFTfBQfJ8H': 'uDwraXBUHgs',
  '3STVHSJR6ZPGg9CI0aNP9q': 'k9JGDq2jp5c',
  '3ttpmd97MQoJVL79A1d2Te': 'R1Jakp2Bh5k',
  '3xdfDHO2TTVQfIjfReWHiD': '4ya0gEu4LYQ',
  '3yCmaQ9qgxrpEjqaZEVyhS': 'R1Jakp2Bh5k',
  '7vNKMhIItMMDAFSNjmhhtL': 'LGylTiWkk-8',
}

interface Card {
  CardNumber: string
  Spotify: string
}

interface GamesetData {
  gameset_language: string
  gameset_name: string
  cards: Card[]
}

interface Gameset {
  sku: string
  gameset_data: GamesetData
}

interface DB {
  updated_on: number
  gamesets: Gameset[]
}

const gamesetsDir = join(dirname(import.meta.dirname), 'static', 'gamesets')
const cacheDir = join(dirname(import.meta.dirname), 'tmp', 'tracks')

const db = (async () => {
  const DATABASE_URL = 'https://hitster.jumboplay.com/hitster-assets/gameset_database.json'

  const res = await fetch(DATABASE_URL)

  if (!res.ok) {
    throw new Error(`Could not fetch database (${res.status} ${res.statusText}): ${await res.text()}`)
  }

  return await res.json() as DB
})()

// Collect all songs.

const allSongs: Partial<Record<string, { sku: string, cardNumber: string }[]>> = {}

for (const gameset of (await db).gamesets) {
  for (const card of gameset.gameset_data.cards) {
    let existing = allSongs[card.Spotify]

    if (!existing) {
      existing = []
      allSongs[card.Spotify] = existing
    }

    existing.push({ sku: gameset.sku, cardNumber: card.CardNumber })
  }
}

// Convert spotify track id to search query and fire it to youtube.

const ytVideoIds: Record<string, string> = {}
const ytPromises: Promise<unknown>[] = []
const yt = new YTMusic()
await yt.initialize()

const total = Object.keys(allSongs).length
const _progress = {
  'search query': 0,
  'video id': 0,
  'cache hit': 0,
  'failed': 0,
}

function progress(kind: keyof typeof _progress) {
  _progress[kind]++

  const entries = Object.entries(_progress)
  const current = _progress['video id'] + _progress['cache hit'] + _progress.failed
  const parts = entries.map(([t, c]) => `${t[0]}=${c.toLocaleString()}`)

  console.log(`Handled ${current.toLocaleString()} of ${total.toLocaleString()} (${parts.join('; ')})`)
}

for (const trackId of Object.keys(allSongs)) {
  const cacheFile = join(cacheDir, trackId[0].toLowerCase(), trackId[1].toLowerCase(), trackId)

  if (await exists(cacheFile)) {
    ytPromises.push(readFile(cacheFile, { encoding: 'utf8' }).then((videoId) => {
      ytVideoIds[trackId] = videoId.trim()

      progress('cache hit')
    }))
  }
  else {
    let html = await retryAsync(async () => {
      const res = await fetch(`https://open.spotify.com/track/${trackId}`)

      if (!res.ok) {
        throw new Error(`Could not fetch track '${trackId}' from spotify (${res.status} ${res.statusText}): ${await res.text()}`)
      }

      return res.text()
    }, {
      delay: ({ currentTry }) => currentTry * 250,
    })

    let headClose = html.indexOf('</head>')

    let title: string | undefined
    let artist: string | undefined
    let albumUrl: string | undefined
    let album: string | undefined
    let assignTitleTo: 'title' | 'album' = 'title'

    const rewriter = new HTMLRewriter()

    rewriter.on('meta[property="og:title"]', {
      element(element) {
        if (assignTitleTo === 'title') {
          title = element.getAttribute('content')?.trim()
        }
        else if (assignTitleTo === 'album') {
          album = element.getAttribute('content')?.trim()
        }
      },
    })

    rewriter.on('meta[name="music:musician_description"]', {
      element(element) {
        artist = element.getAttribute('content')?.trim()
      },
    })

    rewriter.on('meta[name="music:album"]', {
      element(element) {
        albumUrl = element.getAttribute('content')?.trim()
      },
    })

    rewriter.transform(html.slice(0, headClose + '</head>'.length))

    if (title === undefined || artist === undefined || albumUrl === undefined) {
      console.log({ title, artist, albumUrl })
      throw new Error(`Could not find details of spotify song https://open.spotify.com/track/${trackId}`)
    }

    html = await retryAsync(async () => {
      const res = await fetch(albumUrl!)

      if (!res.ok) {
        throw new Error(`Could not fetch album '${albumUrl}' from spotify (${res.status} ${res.statusText}): ${await res.text()}`)
      }

      return res.text()
    }, {
      delay: ({ currentTry }) => currentTry * 250,
    })

    headClose = html.indexOf('</head>')

    assignTitleTo = 'album'

    rewriter.transform(html.slice(0, headClose + '</head>'.length))

    if (album === undefined) {
      console.log({ title, artist, album })
      throw new Error(`Could not find details of spotify song https://open.spotify.com/track/${trackId}`)
    }

    const query = transliterate(decode([title, artist, album].join(' ')))

    progress('search query')

    ytPromises.push(retryAsync(async () => {
      let songs: SongDetailed[] | VideoDetailed[] = await yt.searchSongs(query)

      if (songs.length === 0) {
        songs = await yt.searchVideos(query)
      }

      if (songs.length === 0) {
        if (trackId in OVERRIDE_TRACKS) {
          ytVideoIds[trackId] = OVERRIDE_TRACKS[trackId]

          progress('cache hit')

          return
        }

        throw new Error(`Could not find youtube song for query '${query}' (track: '${trackId}')`)
      }

      ytVideoIds[trackId] = songs[0].videoId

      await mkdir(dirname(cacheFile), { recursive: true })
      await writeFile(cacheFile, songs[0].videoId)

      progress('video id')
    }, {
      delay: ({ currentTry }) => currentTry * 250,
      onError(err) {
        if (err.message.startsWith('Could not find youtube song')) {
          progress('failed')

          return false
        }
      },
    }))
  }
}

await Promise.all(ytPromises)

// Store youtube links for each gameset.

await rm(gamesetsDir, { force: true, recursive: true })
await mkdir(gamesetsDir, { recursive: true })

for (const gameset of (await db).gamesets) {
  console.log(`Updating gameset '${gameset.sku}'`)

  const file = join(gamesetsDir, `${gameset.sku}.json`)

  const cardsWithYtIds = gameset.gameset_data.cards.map(c => [c.CardNumber, ytVideoIds[c.Spotify]])

  await writeFile(file, JSON.stringify(Object.fromEntries(cardsWithYtIds), null, 2))
}
