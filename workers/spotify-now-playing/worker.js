/**
 * Spotify Now Playing — Cloudflare Worker
 * 
 * Deploy this worker and set the following secrets via `wrangler secret put`:
 *   - SPOTIFY_CLIENT_ID
 *   - SPOTIFY_CLIENT_SECRET
 *   - SPOTIFY_REFRESH_TOKEN
 * 
 * Then set PUBLIC_SPOTIFY_NOW_PLAYING_URL in your Astro site's .env to
 * the deployed worker URL (e.g., https://spotify-now-playing.<your-subdomain>.workers.dev)
 * 
 * --- How to get a Spotify Refresh Token ---
 * 1. Create an app at https://developer.spotify.com/dashboard
 * 2. Set redirect URI to http://localhost:3000/callback
 * 3. Visit: https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/callback&scope=user-read-currently-playing%20user-read-recently-played
 * 4. Grab the `code` from the redirect URL
 * 5. Exchange it:
 *    curl -X POST https://accounts.spotify.com/api/token \
 *      -H "Content-Type: application/x-www-form-urlencoded" \
 *      -d "grant_type=authorization_code&code=YOUR_CODE&redirect_uri=http://localhost:3000/callback&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"
 * 6. Use the `refresh_token` from the response
 */

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

async function getAccessToken(env) {
  const basic = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=refresh_token&refresh_token=' + env.SPOTIFY_REFRESH_TOKEN,
  });

  return response.json();
}

async function getNowPlaying(accessToken) {
  const response = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 204 || response.status > 400) {
    return null;
  }

  return response.json();
}

async function getRecentlyPlayed(accessToken) {
  const response = await fetch(RECENTLY_PLAYED_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return null;
  return response.json();
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    'Content-Type': 'application/json',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    try {
      const { access_token } = await getAccessToken(env);
      const nowPlaying = await getNowPlaying(access_token);

      if (nowPlaying && nowPlaying.item) {
        const track = nowPlaying.item;
        return new Response(
          JSON.stringify({
            isPlaying: nowPlaying.is_playing,
            title: track.name,
            artist: track.artists.map((a) => a.name).join(', '),
            albumImageUrl: track.album.images?.[1]?.url || track.album.images?.[0]?.url || '',
            songUrl: track.external_urls?.spotify || '',
          }),
          { headers: corsHeaders(origin) }
        );
      }

      // Fallback: show most recently played track
      const recent = await getRecentlyPlayed(access_token);
      if (recent?.items?.length > 0) {
        const track = recent.items[0].track;
        return new Response(
          JSON.stringify({
            isPlaying: false,
            title: track.name,
            artist: track.artists.map((a) => a.name).join(', '),
            albumImageUrl: track.album.images?.[1]?.url || track.album.images?.[0]?.url || '',
            songUrl: track.external_urls?.spotify || '',
          }),
          { headers: corsHeaders(origin) }
        );
      }

      return new Response(
        JSON.stringify({ isPlaying: false, title: '', artist: '', albumImageUrl: '', songUrl: '' }),
        { headers: corsHeaders(origin) }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch now playing data' }),
        { status: 500, headers: corsHeaders(origin) }
      );
    }
  },
};
