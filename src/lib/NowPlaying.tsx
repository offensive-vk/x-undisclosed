import React, { useEffect, useState, useCallback } from 'react';

interface NowPlayingData {
  isPlaying: boolean;
  title: string;
  artist: string;
  albumImageUrl: string;
  songUrl: string;
}

// Configure your API endpoint here — deploy a Cloudflare Worker or Vercel Edge Function
// that calls Spotify's /v1/me/player/currently-playing and returns the shape above.
const SPOTIFY_API_ENDPOINT = import.meta.env.PUBLIC_SPOTIFY_NOW_PLAYING_URL || '';

const DEFAULT_TRACK: NowPlayingData = {
  isPlaying: true,
  title: "Zemër",
  artist: "Soolking, Dhurata Dora",
  albumImageUrl: "https://i.scdn.co/image/ab67616d0000b2732f44715c2610a093361f26ee",
  songUrl: "https://open.spotify.com/track/68av1mZz0VsIYXJWATZWUW?si=a012b67b7c164a69",
};

export default function NowPlaying() {
  const [data, setData] = useState<NowPlayingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const fetchNowPlaying = useCallback(async () => {
    if (!SPOTIFY_API_ENDPOINT) {
      setData(DEFAULT_TRACK);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(SPOTIFY_API_ENDPOINT);
      if (res.ok) {
        const json = await res.json();
        setData(json && json.title ? json : DEFAULT_TRACK);
      } else {
        setData(DEFAULT_TRACK);
      }
    } catch {
      setData(DEFAULT_TRACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNowPlaying();
    if (SPOTIFY_API_ENDPOINT) {
      const interval = setInterval(fetchNowPlaying, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchNowPlaying]);

  const currentTrack = data || DEFAULT_TRACK;
  const isPlaying = currentTrack.isPlaying;

  return (
    <div className="now-playing-container">
      <style>{`
        .now-playing-container {
          position: relative;
          width: 100%;
        }

        .now-playing-widget {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 20px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(135deg, rgba(20, 20, 20, 0.85) 0%, rgba(30, 30, 35, 0.6) 100%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
          text-decoration: none;
          color: inherit;
        }

        .now-playing-widget:hover {
          border-color: rgba(164, 118, 255, 0.35);
          box-shadow: 0 12px 36px -8px rgba(164, 118, 255, 0.2);
          transform: translateY(-2px);
        }

        /* Ambient glow background */
        .now-playing-widget::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 15% 50%, rgba(29, 185, 84, 0.12), transparent 50%),
                      radial-gradient(circle at 85% 50%, rgba(164, 118, 255, 0.1), transparent 50%);
          pointer-events: none;
          opacity: 0.8;
          transition: opacity 0.4s ease;
        }

        .now-playing-widget:hover::before {
          opacity: 1;
        }

        .np-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          flex: 1;
          z-index: 1;
        }

        /* Album Art with disc effect */
        .np-album-art {
          position: relative;
          width: 52px;
          height: 52px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .np-album-art img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .np-album-art img.loaded {
          opacity: 1;
        }

        .now-playing-widget:hover .np-album-art img {
          transform: scale(1.06);
        }

        /* Track Info */
        .np-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          flex: 1;
        }

        .np-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: rgba(243, 243, 243, 0.45);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .np-spotify-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #1DB954;
          display: inline-block;
          box-shadow: 0 0 8px #1DB954;
          animation: dot-pulse 2s ease-in-out infinite;
        }

        @keyframes dot-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 0 rgba(29, 185, 84, 0.5); }
          50% { transform: scale(1.15); opacity: 1; box-shadow: 0 0 0 5px rgba(29, 185, 84, 0); }
        }

        .np-title {
          font-size: 15px;
          font-weight: 600;
          color: #f3f3f3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
          transition: color 0.2s ease;
        }

        .now-playing-widget:hover .np-title {
          color: #a476ff;
        }

        .np-artist {
          font-size: 13px;
          font-weight: 400;
          color: rgba(243, 243, 243, 0.6);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }

        /* Right items: Equalizer + Spotify CTA */
        .np-right {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
          z-index: 1;
        }

        /* Equalizer Bars */
        .np-equalizer {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 20px;
          padding-right: 4px;
        }

        .np-eq-bar {
          width: 3px;
          border-radius: 2px;
          background: linear-gradient(to top, #1DB954, #a476ff);
          transform-origin: bottom;
          animation: eq-bounce var(--eq-duration, 0.8s) ease-in-out infinite alternate;
          animation-delay: var(--eq-delay, 0s);
        }

        @keyframes eq-bounce {
          0% { height: var(--eq-min, 4px); }
          100% { height: var(--eq-max, 18px); }
        }

        /* Spotify Icon / Listen Pill */
        .np-spotify-action {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          background: rgba(29, 185, 84, 0.12);
          border: 1px solid rgba(29, 185, 84, 0.25);
          color: #1DB954;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.25s ease;
        }

        .now-playing-widget:hover .np-spotify-action {
          background: #1DB954;
          color: #000;
          border-color: #1DB954;
          box-shadow: 0 0 16px rgba(29, 185, 84, 0.4);
          transform: scale(1.04);
        }

        .np-spotify-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        /* Loading Skeleton */
        .np-skeleton {
          border-radius: 4px;
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
        }

        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <a
        href={currentTrack.songUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="now-playing-widget"
        aria-label={`Listen to ${currentTrack.title} by ${currentTrack.artist} on Spotify`}
      >
        <div className="np-left">
          <div className="np-album-art">
            {loading ? (
              <div className="np-skeleton" style={{ width: '100%', height: '100%' }} />
            ) : (
              <img
                src={currentTrack.albumImageUrl}
                alt={`${currentTrack.title} album art`}
                className={imageLoaded ? 'loaded' : ''}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
                width="52"
                height="52"
              />
            )}
          </div>

          <div className="np-info">
            <span className="np-label">
              <span className="np-spotify-dot" />
              {isPlaying ? 'Now Playing' : 'Favorite Track'}
            </span>
            {loading ? (
              <>
                <div className="np-skeleton" style={{ width: 140, height: 16, margin: '2px 0' }} />
                <div className="np-skeleton" style={{ width: 100, height: 12 }} />
              </>
            ) : (
              <>
                <span className="np-title">{currentTrack.title}</span>
                <span className="np-artist">{currentTrack.artist}</span>
              </>
            )}
          </div>
        </div>

        <div className="np-right">
          <div className="np-equalizer" aria-hidden="true">
            <div
              className="np-eq-bar"
              style={{ '--eq-delay': '0s', '--eq-duration': '0.6s', '--eq-min': '4px', '--eq-max': '16px' } as React.CSSProperties}
            />
            <div
              className="np-eq-bar"
              style={{ '--eq-delay': '0.15s', '--eq-duration': '0.75s', '--eq-min': '3px', '--eq-max': '20px' } as React.CSSProperties}
            />
            <div
              className="np-eq-bar"
              style={{ '--eq-delay': '0.3s', '--eq-duration': '0.5s', '--eq-min': '5px', '--eq-max': '14px' } as React.CSSProperties}
            />
            <div
              className="np-eq-bar"
              style={{ '--eq-delay': '0.1s', '--eq-duration': '0.85s', '--eq-min': '3px', '--eq-max': '18px' } as React.CSSProperties}
            />
          </div>

          <div className="np-spotify-action">
            <svg className="np-spotify-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <span className="hidden sm:inline">Spotify</span>
          </div>
        </div>
      </a>
    </div>
  );
}


