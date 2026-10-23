# Language and domain contracts

## Interface, listing and communication language are separate

- Interface locale: `zh-CN` / `en`, stored only as `ui-locale-v1`. First visits default to Simplified Chinese regardless of browser language; an explicit saved language choice takes precedence.
- Listing language: required `listing_language: zh | en` on every V4 recruitment. A new submission derives this field from the interface language at submission time. There is no independent language selector. Switching the interface before publishing changes the upcoming submission language; switching after publishing never changes the existing listing.
- Communication language: `language.zh | language.en`, a response field derived by the server from the listing language; it is not independently selected or accepted as a V4 input field.

Each listing is stored once. Auto-match, recommendations, hall browsing, direct invitations and share-link invitations all enforce the listing language pool. A query parameter cannot override an active listing's pool. No translated copies of listings are generated.

## Stable identifiers only

Goals (`goal.loot_extract`), maps (`map.zero_dam`), difficulty (`difficulty.normal`), time slots (`slot.next_hour`), voice modes (`voice.mic`), and tasks (`task.investigate`) are stable ASCII identifiers throughout validation, API input/output, stored profiles and matching. UI labels never determine behavior. The test scenarios use the same contract.

There are no existing users to migrate. No Chinese-value compatibility layer is retained. The draft storage key is now `pilot-preferences-v3`, and the rule version is `two-person-recruitment-v5`. Frontend and backend must be released together. Superseded demo routes are not registered in the public frontend, and the server's legacy demonstration API remains disabled in production.

## Translation

`src/i18n/zh.js` and `en.js` have identical semantic key sets. Use `$t('action.confirm')` and named parameters for complete sentences; do not use Chinese source text as a key, infer translations from phrases, or replace parts of formatted strings.

Catalog values contain display text. Business code contains IDs or message keys. Nicknames, game IDs, chat messages and event names are user text and must be rendered unchanged. Comparison changes are computed from raw values, independently of the display locale.

Server errors use semantic codes or message keys. `api-errors.js` maps validation fields to explicit keys and never displays raw validation inputs. Unknown errors use a translated generic fallback. Dates and numbers use the interface locale while dates retain the device time zone.

## Regression checks

Frontend: `node --test tests/*.test.mjs` and `npm run build:h5`.
Backend: `PILOT_DB=/tmp/triangle-semantic-tests.db .venv/bin/python -m unittest discover -s tests -q`.

Guards check catalog key parity, absence of Chinese translation keys and Chinese enum comparisons in the current publishing flow, raw user-text preservation, unchanged listing language when switching the interface, and all invitation/auto-match language-pool paths.
