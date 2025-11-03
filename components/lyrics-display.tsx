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
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const autoPlayRef = useRef(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)

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
        if (nextTime > maxTime + 5000) {
          // Loop after 5 seconds past last line
          return 0
        }
        return nextTime
      })
    }, 50)

    return () => clearInterval(interval)
  }, [lyricLines])

  // Update current line based on time
  useEffect(() => {
    if (lyricLines.length === 0) return

    // Find the current line index
    let index = 0
    for (let i = lyricLines.length - 1; i >= 0; i--) {
      if (currentTime >= lyricLines[i].time) {
        index = i
        break
      }
    }
    setCurrentLineIndex(index)
  }, [currentTime, lyricLines])

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [currentLineIndex])

  if (!song.lyrics || lyricLines.length === 0) {
    return (
      <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 border-b border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-1">{song.title}</h2>
          <p className="text-blue-100 text-lg">{song.artist}</p>
        </div>
        <div className="h-[600px] bg-slate-800 flex items-center justify-center">
          <p className="text-slate-400 text-lg">No lyrics available</p>
        </div>
      </div>
    )
  }

  const handleLineClick = (time: number) => {
    setCurrentTime(time)
    autoPlayRef.current = false
  }

  const handlePlayPause = () => {
    autoPlayRef.current = !autoPlayRef.current
  }

  const handleRestart = () => {
    setCurrentTime(0)
    autoPlayRef.current = true
  }

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 border-b border-slate-700">
        <h2 className="text-3xl font-bold text-white mb-1">{song.title}</h2>
        <p className="text-blue-100 text-lg">{song.artist}</p>
        <div className="flex items-center gap-4 mt-3">
          <p className="text-blue-200 text-sm">{song.synced ? "🎵 Synced Lyrics" : "📝 Unsynced Lyrics"}</p>
          <div className="flex gap-2">
            <button
              onClick={handlePlayPause}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-sm transition"
            >
              {autoPlayRef.current ? "⏸ Pause" : "▶️ Play"}
            </button>
            <button
              onClick={handleRestart}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-sm transition"
            >
              🔄 Restart
            </button>
          </div>
        </div>
      </div>

      {/* Lyrics Container */}
      <div 
        ref={containerRef}
        className="h-[600px] bg-slate-800 overflow-y-auto px-8 py-12"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#475569 #1e293b'
        }}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {lyricLines.map((line, index) => {
            const isActive = index === currentLineIndex
            const isPast = index < currentLineIndex
            const isFuture = index > currentLineIndex

            return (
              <div
                key={index}
                ref={isActive ? activeLineRef : null}
                onClick={() => handleLineClick(line.time)}
                className={`
                  transition-all duration-500 cursor-pointer py-2 px-4 rounded-lg
                  ${isActive 
                    ? 'text-white text-3xl font-bold scale-110 bg-blue-500/20' 
                    : isPast
                    ? 'text-slate-500 text-xl hover:text-slate-400'
                    : 'text-slate-400 text-xl hover:text-slate-300'
                  }
                `}
                style={{
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  opacity: isActive ? 1 : isPast ? 0.5 : 0.7
                }}
              >
                {line.content}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-700/50 border-t border-slate-700 p-4 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Powered by LyricsPlus & LRCLIB • Apple Music-inspired UI
        </div>
        <div className="text-sm text-slate-400">
          {Math.floor(currentTime / 1000)}s / {Math.floor((lyricLines[lyricLines.length - 1]?.time || 0) / 1000)}s
        </div>
      </div>
    </div>
  )
        }
