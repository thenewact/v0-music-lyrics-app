"use client"

import { useState } from "react"
import { SearchSection } from "@/components/search-section"
import { LyricsDisplay } from "@/components/lyrics-display"

export default function Home() {
  const [song, setSong] = useState<{
    title: string
    artist: string
    lyrics?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-2">LyricsFlow</h1>
          <p className="text-slate-400">Find and discover song lyrics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <SearchSection onSongSelect={setSong} loading={loading} setLoading={setLoading} />
          </div>

          <div className="lg:col-span-2">
            {song && <LyricsDisplay song={song} />}
            {!song && (
              <div className="flex items-center justify-center h-full min-h-96 text-center">
                <div>
                  <div className="text-6xl mb-4 opacity-20">♪</div>
                  <p className="text-slate-400 text-lg">Search for a song to see lyrics</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
