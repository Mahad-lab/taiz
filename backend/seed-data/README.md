# seed-data

`karachi-areas.source.json` is a pinned snapshot of the Karachi area-name list
used to seed the `areas` table. Fetched from:

https://gist.githubusercontent.com/Muzammil-Bilwani/1061412b979077902b53bfd17a6e165e/raw/5565ebfdf563df8e6d9b511425abba32f70e0a45/areas.json

Committed as a local snapshot (rather than fetched at seed time) so the seed
is reproducible and doesn't depend on the gist staying reachable/unchanged.

Verified structure (2026-08-29): a JSON array of 373 single-field objects,
`{"name": string}`, no `zone` field, no coordinates. Exactly one exact
duplicate name: `"Firdous Colony"` (appears twice) -> 372 unique names.

To refresh from upstream, re-download the file to this path and re-verify
counts/duplicates before re-seeding -- don't assume the source hasn't changed.
