"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface SearchSectionProps {
  onSongSelect: (song: { title: string; artist: string; lyrics: string; synced: boolean }) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export function SearchSection({ onSongSelect, loading, setLoading }: SearchSectionProps) {
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !artist.trim()) {
      setError("Please enter both song title and artist")
      return
    }

    setError("")
    setLoading(true)

    try {
      const response = await fetch(
        `/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`,
      )

      if (!response.ok) {
        throw new Error("Song not found")
      }

      const data = await response.json()

      if (data && data.lyrics) {
        onSongSelect({
          title: title,
          artist: artist,
          lyrics: data.lyrics,
          synced: data.synced || false,
        })
      } else {
        setError("Lyrics not found for this song. Try another search.")
      }
    } catch (err) {
      console.error("[v0] Error fetching lyrics:", err)
      setError("Failed to fetch lyrics. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sticky top-8">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Search Lyrics</h2>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Song Title</label>
            <Input
              placeholder="Enter song title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Artist</label>
            <Input
              placeholder="Enter artist name..."
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search Lyrics"
            )}
          </Button>

          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Try searching for:</h3>
          <div className="space-y-2 text-xs text-slate-400">
            <p>• "Bohemian Rhapsody" by Queen</p>
            <p>• "Like a Rolling Stone" by Bob Dylan</p>
            <p>• "Hotel California" by Eagles</p>
          </div>
        </div>
      </div>
    </div>
  )
}
