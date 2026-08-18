import { useEffect, useState } from 'react'
import client from '../api/client'

const requestCache = new Map<string, Promise<any[]>>()

function fetchList<T>(endpoint: string): Promise<T[]> {
  let promise = requestCache.get(endpoint)
  if (!promise) {
    promise = client
      .get(endpoint, { params: { per_page: 200 } })
      .then((res) => res.data.data ?? res.data)
      .catch(() => [])
    requestCache.set(endpoint, promise)
  }
  return promise
}

/**
 * Fetches a list endpoint once (cached per session) and extracts distinct
 * non-empty values for use as input suggestions, so forms recommend values
 * that already exist instead of asking users to retype them from scratch.
 */
export function useDistinctValues<T>(
  endpoint: string,
  extract: (row: T) => (string | null | undefined)[],
): string[] {
  const [values, setValues] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    fetchList<T>(endpoint).then((rows) => {
      if (cancelled || !Array.isArray(rows)) return
      const set = new Set<string>()
      for (const row of rows) {
        for (const v of extract(row)) {
          if (v && v.trim()) set.add(v.trim())
        }
      }
      setValues(Array.from(set))
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint])

  return values
}

/** Same session-level cache as useDistinctValues, but returns the raw rows. */
export function useCachedList<T>(endpoint: string): T[] {
  const [rows, setRows] = useState<T[]>([])

  useEffect(() => {
    let cancelled = false
    fetchList<T>(endpoint).then((data) => {
      if (!cancelled && Array.isArray(data)) setRows(data)
    })
    return () => {
      cancelled = true
    }
  }, [endpoint])

  return rows
}
