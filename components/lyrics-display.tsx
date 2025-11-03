"use client"

import { useEffect, useRef, useState } from "react"

interface LyricsDisplayProps {
  song: {
    title: string
    artist: string
    lyrics: string
    synced: boolean
  }
}

interface LyricLine {
  time: number
  content: string
}

export function LyricsDisplay({ song }: LyricsDisplayProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [lyricLines, setLyricLines] = useState<LyricLine[]>([])
  const autoPlayRef = useRef(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!song.lyrics) return

    if (song.synced) {
      // Parse LRC format: [mm:ss.xx]lyrics text
      const lines: LyricLine[] = []
      const lrcLines = song.lyrics.split("\n").filter((line) => line.trim())

      lrcLines.forEach((line) => {
        const timeMatch = line.match(/\[(\d+):(\d+)\.(\d+)\](.+)/)
        if (timeMatch) {
          const minutes = Number.parseInt(timeMatch[1])
          const seconds = Number.parseInt(timeMatch[2])
          const centiseconds = Number.parseInt(timeMatch[3])
          const content = timeMatch[4].trim()

          const timeInMs = (minutes * 60 + seconds) * 1000 + centiseconds * 10
          lines.push({ time: timeInMs, content })
        }
      })

      setLyricLines(lines)
    } else {
      // Parse unsynced lyrics - assign simulated timing
      const lines: LyricLine[] = []
      const textLines = song.lyrics.split("\n").filter((line) => line.trim())

      textLines.forEach((line, index) => {
        lines.push({
          time: index * 3500, // 3.5 seconds per line
          content: line.trim(),
        })
      })

      setLyricLines(lines)
    }
  }, [song.lyrics, song.synced])

  // Auto-advance time for demo purposes
  useEffect(() => {
    if (!autoPlayRef.current || lyricLines.length === 0) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const nextTime = prev + 50
        const maxTime = lyricLines[lyricLines.length - 1]?.time || 0
        if (nextTime > maxTime) {
          return maxTime
        }
        return nextTime
      })
    }, 50)

    return () => clearInterval(interval)
  }, [lyricLines])

  useEffect(() => {
    if (!containerRef.current || lyricLines.length === 0) return

    const initRenderer = () => {
      const windowAny = window as any
      if (windowAny.AppleMusicLikeLyrics) {
        try {
          const { LyricListRenderer } = windowAny.AppleMusicLikeLyrics

          containerRef.current!.innerHTML = ""

          const renderer = new LyricListRenderer({
            container: containerRef.current,
            lrcData: lyricLines,
            currentTime,
            draggable: true,
            onDrag: (time: number) => {
              setCurrentTime(time)
              autoPlayRef.current = false
            },
          })
        } catch (error) {
          console.error("[v0] Failed to initialize LyricListRenderer:", error)
        }
      }
    }

    // Wait for library to load
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initRenderer)
      return () => document.removeEventListener("DOMContentLoaded", initRenderer)
    } else {
      initRenderer()
    }
  }, [lyricLines, currentTime])

  if (!song.lyrics || lyricLines.length === 0) {
    return null
  }

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 border-b border-slate-700">
        <h2 className="text-3xl font-bold text-white mb-1">{song.title}</h2>
        <p className="text-blue-100 text-lg">{song.artist}</p>
        <p className="text-blue-200 text-sm mt-2">{song.synced ? "Synced Lyrics" : "Unsynced Lyrics"}</p>
      </div>

      <div className="h-[600px] bg-slate-800" ref={containerRef} />

      {/* Footer */}
      <div className="bg-slate-700/50 border-t border-slate-700 p-4 text-center text-sm text-slate-400">
        Powered by LyricsPlus & LRCLIB • Apple Music-inspired UI
      </div>
    </div>
  )
}
