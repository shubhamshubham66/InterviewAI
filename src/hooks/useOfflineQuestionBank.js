import { useEffect, useState } from 'react'
import { exportQuestionBank } from '../api/client.js'

const CACHE_KEY = 'interviewai_offline_qbank'

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useOfflineQuestionBank() {
  const [cache, setCache] = useState(readCache)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  async function download() {
    setDownloading(true)
    setError('')
    try {
      const res = await exportQuestionBank()
      const entry = { questions: res.questions, downloadedAt: Date.now() }
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
      } catch {
        // storage full or unavailable — still usable for this page load
      }
      setCache(entry)
    } catch (err) {
      setError(err.message)
    } finally {
      setDownloading(false)
    }
  }

  return { cache, download, downloading, error, online }
}
