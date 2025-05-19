const gamesets = Object.fromEntries(
  Object.entries(import.meta.glob<Partial<Record<string, string>>>('./gamesets/*.ts', { import: 'default' }))
    .map(([k, v]) => [
      k
        .replace('./gamesets/', '')
        .replace('.ts', ''),
      v,
    ]),
)

export async function getCardVideoId(sku: string, cardNumber: string) {
  const cards = await getGamesetCards(sku)

  const videoId = cards[cardNumber]

  if (videoId === undefined) {
    throw new Error(`card '${cardNumber}' in gameset '${sku}' not found`)
  }

  return videoId
}

async function getGamesetCards(sku: string) {
  if (sku in gamesets) {
    return gamesets[sku]()
  }

  throw new Error(`gameset '${sku}' not found`)
}
