import type { PriceData } from '../types'

const API_KEY = '2baa491ec3804f86a76c0000f86be6ba'
const CACHE_PREFIX = 'cn_sectors_price_'
const CACHE_DURATION = 5 * 60 * 1000

interface CacheEntry {
  data: Record<string, PriceData>
  timestamp: number
}

function getCacheKey(sectorId: string): string {
  return CACHE_PREFIX + sectorId
}

function getCache(sectorId: string): Record<string, PriceData> | null {
  try {
    const raw = localStorage.getItem(getCacheKey(sectorId))
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(getCacheKey(sectorId))
      return null
    }
    return entry.data
  } catch { return null }
}

function setCache(sectorId: string, data: Record<string, PriceData>): void {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() }
    localStorage.setItem(getCacheKey(sectorId), JSON.stringify(entry))
  } catch { /* ignore */ }
}

function toTwelveDataSymbol(symbol: string): string {
  // A-share symbols: 600519 → 600519.SS (Shanghai), 000858 → 000858.SZ (Shenzhen)
  if (symbol.startsWith('6') || symbol.startsWith('5') || symbol.startsWith('9')) {
    return symbol + '.SS'
  }
  return symbol + '.SZ'
}

export async function fetchSectorPrices(
  sectorId: string,
  symbols: string[]
): Promise<Record<string, PriceData>> {
  const cached = getCache(sectorId)
  if (cached) return cached

  const result: Record<string, PriceData> = {}

  const batchSize = 8
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize)
    try {
      const apiSymbols = batch.map(toTwelveDataSymbol).join(',')
      const url = `https://api.twelvedata.com/quote?symbol=${apiSymbols}&apikey=${API_KEY}`
      const response = await fetch(url)
      const data = await response.json()

      if (batch.length === 1) {
        if (data && data.close) {
          result[batch[0]] = {
            price: parseFloat(data.close),
            change: parseFloat(data.change || '0'),
            changePercent: parseFloat(data.percent_change || '0'),
            timestamp: Date.now(),
          }
        }
      } else {
        for (const sym of batch) {
          const apiSym = toTwelveDataSymbol(sym)
          const item = data[apiSym]
          if (item && item.close) {
            result[sym] = {
              price: parseFloat(item.close),
              change: parseFloat(item.change || '0'),
              changePercent: parseFloat(item.percent_change || '0'),
              timestamp: Date.now(),
            }
          }
        }
      }

      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 800))
      }
    } catch {
      console.warn(`Failed to fetch prices for batch starting at ${i}`)
    }
  }

  if (Object.keys(result).length > 0) {
    setCache(sectorId, result)
  }
  return result
}
