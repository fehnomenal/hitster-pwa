import { base } from '$app/paths'

const gamesets: Partial<Record<string, Partial<Record<string, string>>>> = {}

export async function getCardVideoId(sku: string, cardNumber: string) {
  const cards = await getGamesetCards(sku)

  const videoId = cards[cardNumber]

  if (videoId === undefined) {
    throw new Error(`card '${cardNumber}' in gameset '${sku}' not found`)
  }

  return videoId
}

async function getGamesetCards(sku: string) {
  let cards = gamesets[sku]

  if (cards === undefined) {
    const res = await fetch(`${base}/gamesets/${sku}.json`)

    if (!res.ok) {
      throw new Error(`gameset '${sku}' not found`)
    }

    cards = await res.json() as Record<string, string>

    gamesets[sku] = cards
  }

  return cards
}
