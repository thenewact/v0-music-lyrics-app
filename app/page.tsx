typescript
"use client"

import { useState } from "react"
import { SearchSection } from "@/components/SearchSection"
import { LyricsDisplay } from "@/components/LyricsDisplay"

interface Song {
  title: string
  artist: string
  lyrics: string
  synced: boolean
}

export default function Home() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎵 Music Lyrics App
          </h1>
          <p className="text-slate-400 text-lg">
            Search and view synchronized lyrics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Section */}
          <div className="lg:col-span-1">
            <SearchSection
              onSongSelect={setSelectedSong}
              loading={loading}
              setLoading={setLoading}
            />
          </div>

          {/* Lyrics Display */}
          <div className="lg:col-span-2">
            {selectedSong ? (
              <LyricsDisplay song={selectedSong} />
            ) : (
              <div className="bg-slate-800 rounded-lg border border-slate-700 h-[600px] flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <p className="text-xl mb-2">👈 Search for a song to get started</p>
                  <p className="text-sm">Try "Bohemian Rhapsody" by "Queen"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
