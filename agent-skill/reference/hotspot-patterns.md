# Hotspot scan patterns

Used by `SKILL.md`'s **opt-in** repo scan step. This is `grep` + reasoning only — no AST, no
static-analysis engine, no dependency. Read matches, use judgment, and always frame findings as
**"worth load-testing before launch"**, never as a verdict on code quality. The goal is to help
the user pick their first 1-3 tests, not to audit their codebase.

## Tone rules (non-negotiable)

- Never say "your code is bad," "this is inefficient," or similar. Say things like "this endpoint
  does a fan-out to N services — that's exactly the kind of path worth putting under load before
  launch" or "nice, this looks like your busiest write path — a good candidate for a first test."
- Keep it short: a ranked shortlist (3-5 items), not an essay per match.
- Every hotspot is an opportunity, not a defect.

## Grep set

Run these against the user's repo (read-only; findings stay in the user's own agent context —
never uploaded or transmitted anywhere by this skill). Adapt file globs to the repo's actual
language/framework once detected (e.g. skip `**/*.py` greps in a pure-TS repo).

### 1. Route / request handlers (entry points)

```
grep -rnE '(app|router)\.(get|post|put|patch|delete)\(' --include='*.{js,ts,mjs}' .
grep -rnE '@(Get|Post|Put|Patch|Delete)\(' --include='*.ts' .          # Nest/decorators
grep -rnE 'def\s+\w+\(.*request' --include='*.py' .                    # Flask/Django-style
grep -rnE 'router\.(Get|Post|Put|Patch|Delete)\(' --include='*.go' .
```
Why: every route is a candidate load-test target; this also inventories what exists.

### 2. N+1 / DB-in-loop

```
grep -rnE 'for\s*\(.*\)\s*\{[^}]*\.(find|query|select|save|update)' --include='*.{js,ts}' .
grep -rnE '(for|while)\s.*:\s*$' -A3 --include='*.py' . | grep -E '\.(objects\.|query\(|execute\(|filter\()'
```
Why: a loop that issues one query per iteration turns linear traffic into multiplicative DB load
— often the single biggest perf risk in a new app, and a great first hotspot to test.

### 3. Unbounded / unpaginated reads

```
grep -rnE '\.(findAll|find\(\{\}\)|SELECT \*|find_all|objects\.all\(\))' --include='*.{js,ts,py}' .
grep -rniE 'select\s+\*\s+from' --include='*.{sql,ts,js,py}' .
```
Why: an endpoint that returns "everything" scales badly as data grows; worth load-testing with a
realistic (not empty) dataset size.

### 4. Fan-out HTTP (calls to other services per request)

```
grep -rnE '(fetch|axios|httpx|requests\.(get|post))\(' --include='*.{js,ts,py}' .
```
Then look for these calls **inside** a route handler or inside a loop — that's the fan-out
pattern (one inbound request triggers N outbound calls).

### 5. Heavy synchronous work on the request path

```
grep -rnE '(readFileSync|execSync|crypto\.(pbkdf2Sync|scryptSync)|JSON\.parse\(.{200,})' --include='*.{js,ts}' .
grep -rnE '\b(time\.sleep|subprocess\.run)\(' --include='*.py' .
```
Why: blocking I/O or CPU-heavy work inline in a request handler caps throughput regardless of
infra scale — a strong candidate for a load test that reveals the ceiling early.

### `SELECT *` / heavy queries (SQL-specific)

```
grep -rniE 'select\s+\*|join.*join.*join' --include='*.{sql,ts,js,py}' .
```
Why: wide selects and deep joins are common latency-under-load surprises.

## Ranking guidance

After collecting matches, rank candidates by:

1. **Traffic likelihood** — is this on a hot/common path (checkout, login, search, dashboard) vs.
   an admin/rare path?
2. **Risk shape** — N+1 and fan-out patterns scale worse than a single well-indexed query.
3. **User-declared priority** — if the intake already named a flow, prefer hotspots on that flow.

Present the shortlist, ask the user to confirm/adjust before building anything, and always let
them decline entirely ("skip the scan, I know what I want to test") — that's a normal, first-class
path through the workflow, not a fallback.
