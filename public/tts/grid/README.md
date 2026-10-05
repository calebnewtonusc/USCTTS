# LA grid data

`la-grid.bin` is the street field behind the usctts.com home page: Los Angeles
roads, the 10, 110, 101 and 5, a sample of real business locations, and an
arterial routing graph, all projected to metres on a local plane centred on
USC (34.0224, -118.2851).

- Built by `scripts/build-la-grid.mjs` (the file header documents the layout)
- Source: OpenStreetMap via the Overpass API, https://overpass-api.de/api/interpreter
- Query box (S,W,N,E): 33.96850,-118.35013,34.07630,-118.22007
- Built: 2026-10-05
- sha256: `8ba65184552b387cee1698188d6c65e78467cdeaa9bc8cbeed7b092a62cc4582`
- Size: 403440 bytes, 294560 bytes gzipped
- Counts: 69327 street points, 5663 freeway vertices in 375 lines, 348 businesses, 1680 graph nodes, 2645 graph edges
- KOREATOWN in components/tts/grid/store.ts: [-2004, 4594], the dental office nearest Wilshire and Western

Only positions and a category are kept; no names, addresses or IDs ship.

## License

Map data © OpenStreetMap contributors, available under the Open Database
License (ODbL 1.0), https://www.openstreetmap.org/copyright. This file is a
derived database under the same license. The page footer must carry
"© OpenStreetMap contributors" linked to https://www.openstreetmap.org/copyright.
