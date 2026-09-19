
## The web

`/search` returns Loot entries first, then the web. The web comes from **our own
engine**: a SearXNG (Google + Bing + Brave + Startpage merged) running on the
LooterStudio server, behind nginx on port 2052 with a token header
(`X-Looterio`). The worker reaches it through `SEARX_URL` (a hostname; Workers
refuse raw IPs) and the secret `SEARX_TOKEN`. Falls back to Google Programmable
Search if `GOOGLE_CSE_KEY` + `GOOGLE_CSE_CX` are set, then to DuckDuckGo html.

On the server: `/root/searxng` (`docker compose`), config in `settings.yml`.
