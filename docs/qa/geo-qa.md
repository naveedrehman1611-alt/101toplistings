# Geo QA

Run against PostgreSQL 16.13 + PostGIS 3.4, all 8 migrations applied cleanly.
The Supabase project is still unreachable (blocker B-2), so this is local verification;
it must be repeated against Supabase once a project is available.

## Criterion 44 — distances verified against real coordinates

`search_listings()` output versus published great-circle distances:

| Origin | Target | Returned | Reference | Delta |
|---|---|---|---|---|
| London (51.5074, −0.1278) | Paris (48.8566, 2.3522) | **343.9 km** | ~344 km | ✅ |
| Lahore (31.5204, 74.3587) | Karachi (24.8607, 67.0011) | **1032.2 km** | ~1024 km | ✅ ~0.8% |
| London | Los Angeles (34.0522, −118.2437) | **8776.6 km** | ~8756 km | ✅ ~0.2% |
| London | Karachi | **6317.6 km** | ~6320 km | ✅ |
| Lahore | Los Angeles | **12627.3 km** | ~12610 km | ✅ |

Deltas are expected and correct: `st_distance` on `geography` measures on the WGS84
**ellipsoid**, while quoted "great-circle" figures use a sphere. The ellipsoidal answer is the
more accurate one.

## Criterion 43 — server-side only

Radius filtering uses `st_dwithin(l.geo, origin, radius_m)` against the GiST index
`listings_geo_idx`, inside the `search_listings` RPC. No distance is computed in the browser.

- Radius 500 km from London → returns Paris only. Karachi, LA and the coordinate-less record are
  all excluded. ✅

## Criterion 44 — no fabricated distances

- A listing with `latitude`/`longitude` null returns `distance_km = null`, never 0 and never an
  estimate. ✅
- Called with no origin, **every** row returns `distance_km = null`. ✅
- With a radius requested, coordinate-less listings are excluded rather than assumed inside it —
  an unknown distance cannot be asserted to be within a bound. ✅

## Still outstanding

- Geocoding on submission and admin edit (§7.5.3) is not implemented — no geocoding provider is
  configured, and outbound network is restricted in this environment.
- Sort `nearest` is verified; `newest`, `oldest`, `rating`, `alphabetical` are implemented but
  only `nearest` and `newest` have been exercised with data.
- Performance is unmeasured. The index is present and used by construction, but no `EXPLAIN
  ANALYZE` has been run against a realistic row count.
