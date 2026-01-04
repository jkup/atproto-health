# AT Protocol Health Dashboard

Real-time dashboard showing health metrics for the AT Protocol (Bluesky) ecosystem.

## Tech Stack
- **SvelteKit** (TypeScript) - Framework
- **Chart.js** - Visualizations
- **Jetstream WebSocket** - Real-time data source

## Key Files
```
src/lib/stores/
  jetstream.ts   - WebSocket connection to Jetstream, processes events, tracks activity stats
  network.ts     - User count estimates and network stats
  history.ts     - Rolling 60-second activity history for charts

src/lib/components/
  StatCard.svelte        - Metric display card
  ActivityChart.svelte   - Chart.js line graph
  TopHashtags.svelte     - Trending hashtags list
  TopLanguages.svelte    - Language distribution
  ConnectionStatus.svelte - WebSocket status indicator
  LiveFeed.svelte        - Real-time post stream

src/routes/+page.svelte  - Main dashboard layout
```

## Data Source
- **Jetstream**: `wss://jetstream2.us-east.bsky.network/subscribe`
- Collections tracked: `app.bsky.feed.post`, `app.bsky.feed.like`, `app.bsky.feed.repost`, `app.bsky.graph.follow`, `app.bsky.graph.block`
- No authentication required
- Docs: https://docs.bsky.app/blog/jetstream

## Commands
```bash
npm run dev    # Start dev server
npm run build  # Production build
```
