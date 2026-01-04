# AT Protocol Health Dashboard

Real-time dashboard showing health metrics for the AT Protocol (Bluesky) ecosystem.

## Tech Stack
- **SvelteKit** (TypeScript) - Framework
- **Chart.js** - Visualizations
- **Jetstream WebSocket** - Real-time firehose data

## Data Sources

### Global Stats APIs (polled every 60s)
| API | Endpoint | Data |
|-----|----------|------|
| bsky-stats | `https://bsky-stats.scroll.blue` | total_users, total_posts, total_likes, total_follows, growth_rate |
| ClearSky | `https://public.api.clearsky.services/api/v1/anon/total-users` | active_count, deleted_count |
| ClearSky | `https://public.api.clearsky.services/api/v1/anon/lists/block-stats` | total_blocks, percent_blocking, percent_blocked |

### Real-time Data (WebSocket)
- **Jetstream**: `wss://jetstream2.us-east.bsky.network/subscribe`
- Collections: `app.bsky.feed.post`, `app.bsky.feed.like`, `app.bsky.feed.repost`, `app.bsky.graph.follow`, `app.bsky.graph.block`
- No authentication required

## Key Files
```
src/lib/stores/
  jetstream.ts   - WebSocket connection, real-time event processing
  network.ts     - Global stats from bsky-stats + ClearSky APIs
  history.ts     - Rolling 60-second activity history for charts

src/lib/components/
  StatCard.svelte        - Metric display card
  ActivityChart.svelte   - Chart.js line graph (posts/likes/reposts/follows per second)
  TopHashtags.svelte     - Trending hashtags from firehose
  TopLanguages.svelte    - Language distribution
  ConnectionStatus.svelte - WebSocket status indicator
  LiveFeed.svelte        - Real-time post stream

src/routes/+page.svelte  - Main dashboard layout
```

## Commands
```bash
npm run dev    # Start dev server
npm run build  # Production build
```

## API Documentation
- Jetstream: https://docs.bsky.app/blog/jetstream
- ClearSky: https://github.com/ClearskyApp06/clearskyservices
- AT Protocol: https://atproto.com/specs/xrpc
