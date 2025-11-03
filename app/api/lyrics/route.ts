export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const artist = searchParams.get("artist")
  const title = searchParams.get("title")

  if (!artist || !title) {
    return Response.json({ error: "Missing artist or title" }, { status: 400 })
  }

  try {
    // Try LRCLIB first (more reliable for synced lyrics)
    const lrclibResponse = await fetch(
      `https://lrclib.net/api/search?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`,
    )

    if (lrclibResponse.ok) {
      const results = await lrclibResponse.json()
      if (Array.isArray(results) && results.length > 0) {
        // Get the first (best matching) result with synced lyrics
        const track = results.find((t: any) => t.syncedLyrics) || results[0]
        if (track.syncedLyrics) {
          return Response.json({
            lyrics: track.syncedLyrics,
            synced: true,
            plainLyrics: track.plainLyrics,
          })
        }
        if (track.plainLyrics) {
          return Response.json({
            lyrics: track.plainLyrics,
            synced: false,
          })
        }
      }
    }

    // Fallback to lyrics.ovh if LRCLIB fails
    const lyricsOvhResponse = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
    )

    if (lyricsOvhResponse.ok) {
      const data = await lyricsOvhResponse.json()
      if (data.lyrics) {
        return Response.json({
          lyrics: data.lyrics,
          synced: false,
        })
      }
    }

    return Response.json({ error: "Lyrics not found" }, { status: 404 })
  } catch (error) {
    console.error("[v0] Proxy error:", error)
    return Response.json({ error: "Failed to fetch lyrics" }, { status: 500 })
  }
}
