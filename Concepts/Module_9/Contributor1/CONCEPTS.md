# Module 9 – Full-Stack CodeBloggs

## 🎯 Purpose

List of **three (3) challenging concepts** applied in this project, plus extended concepts drawn from `Secret/R_C.md` and a research sources section. Each concept is documented only once even if it appears in multiple places.

## 📝 How to Use the CONCEPTS.md Log

> 1. Write the **`🔤 Name`** of the concept you found challenging.
> 2. Describe its **`🎯 Purpose`** within the project.
> 3. Explain in your own words **`❓ Why`** it was challenging.
> 4. If applicable, indicate **`📍 Where`** it was used in your project (file name and line number).

---

## ✏️ Concept - 01

**🔤 Name:**

CORS + `sameSite`: Same-Site and Same-Origin Are Not the Same Thing

**🎯 Purpose:**

When the React client at `localhost:3000` talks to the Express API at `localhost:5050`, two different browser security systems are in play simultaneously, and they solve different problems.

**CORS** (Cross-Origin Resource Sharing) activates because the two ports make these *different origins* — same-origin requires matching scheme + host + port. CORS is how the server tells the browser which clients are allowed to make requests. With cookie-based auth you need `credentials: true` in both the CORS config and the fetch options. Critically, you cannot use `origin: "*"` (wildcard) when credentials are involved — the browser refuses it, and login silently breaks.

**`sameSite`** on the cookie is a separate layer entirely — it is the browser's built-in CSRF guard. It controls when the browser attaches the cookie to an outgoing request, based on *site* (not origin). "Same site" is a looser test: it checks the registrable domain and ignores the port. So `localhost:3000` and `localhost:5050` are **different origins** (ports differ) but **the same site** (both are `localhost`). A cookie with `sameSite: "lax"` is sent between them because they are same-site, even though they are not same-origin. CORS handles the cross-origin problem; `sameSite` is satisfied because of the same-site relationship. Both layers are needed at the same time and neither one replaces the other.

**❓ Why it was challenging:**

I kept conflating CORS and `sameSite` before I understood what each one actually does. They both involve the words "origin" and "site" and they're both browser security features — but they activate for different reasons, they're configured in different places (the server CORS config vs. the cookie options object), and they guard against different attacks (unauthorized cross-origin requests vs. CSRF). The bug that made it concrete was setting `origin: "*"` with `credentials: true` — login just silently broke with no useful error message, and it wasn't obvious why until I understood that browsers refuse that combination entirely.

**📍 Where (file & line):**

- `server/server.js` — CORS with `credentials: true` and an explicit `allowedClientOrigins` Set (built from `CLIENT_ORIGINS` env var, with `CLIENT_ORIGIN` as a fallback and hardcoded `localhost:3000` / `127.0.0.1:3000` defaults in dev) (lines 67–78)
- `server/lib/session.config.js` — `sameSite: "lax"` in `COOKIE_OPTIONS` (line 15)
- `Secret/R_C.md` — Section 1

---

## ✏️ Concept - 02

**🔤 Name:**

Ephemeral In-Memory Presence and the Heartbeat Pattern

**🎯 Purpose:**

The presence system answers one question in real time: which users are online right now? Rather than storing presence in MongoDB, the server tracks it in a **module-scoped `Map`** (`lastSeenByUser` in `lib/presence.js`) that only lives in process memory. Each entry maps a user ID to the epoch millisecond when that user last made an authenticated request. A user is "active" if their `lastSeen` is within the last `ACTIVE_WINDOW_MS` (90 seconds).

**This is different from `User.status`.** The `status` field on the User schema is a DB-persisted boolean — `true` from login until explicit logout or session expiry. It answers "does this user have a live session?" Presence answers "has this user made a request recently?" — a subtler question. A user who logged in yesterday and left their tab open all night still has `status: true`, but their presence drops off 90 seconds after their last request.

**The heartbeat is implicit, not explicit.** The client polls `GET /presence` on an interval (~30 seconds). That route is wrapped in `requireSession`, which calls `touchPresence(req.user._id)` on every authenticated request. So the poll does two things at once: it fetches the list of online users *and* it refreshes the caller's own presence. No separate heartbeat endpoint is needed. `ACTIVE_WINDOW_MS` must be meaningfully larger than the poll interval — if they were equal, one missed poll would flip a user from online to offline and cause flickering.

**The Map self-prunes.** `getActiveUserIds()` iterates the full Map and deletes any entry whose `lastSeen` is older than the active window before returning the results. The Map never grows unbounded as users come and go — stale entries are cleaned up on every read.

**The trade-off is intentional ephemeralness.** A server restart clears all presence — everyone shows offline until their next heartbeat. In a multi-process deployment (load balancer across several Node processes), each process has its own Map and they diverge immediately. These are known, accepted limitations. The alternative — persisting presence to MongoDB — would require a write on every single authenticated request, which is expensive and unnecessary for a feature that does not need to survive restarts.

**❓ Why it was challenging:**

The surprising part was how much the presence system stacks onto existing infrastructure without adding new endpoints. The Map living only in process memory felt fragile at first — I kept expecting there to be a database field somewhere. Understanding why that's actually the right call — writing to MongoDB on every authenticated request would be prohibitively expensive — required thinking through the trade-off rather than just reaching for the most persistent option. The other thing that took a while to click was the implicit heartbeat: the poll doesn't just fetch data, it also refreshes the caller's own presence as a side effect of passing through `requireSession`. Once I saw that, the whole system made sense as a single loop.

**📍 Where (file & line):**

- `server/lib/presence.js` — `ACTIVE_WINDOW_MS` constant (line 16), `lastSeenByUser` Map (line 19), `touch()` (line 22), `isActive()` (line 30), `getActiveUserIds()` with inline prune (line 40), `clear()` (line 56)
- `server/middleware/requireSession.js` — `touchPresence(req.user._id)` called on every authenticated request (line 43)
- `server/controllers/session.controller.js` — `clearPresence(session.user)` called on explicit logout (line 109)
- `server/controllers/presence.controller.js` — `getPresence` handler returns `activeUserIds` array (line 12)
- `server/routes/presence.routes.js` — route guarded by `requireSession`, making each client poll double as a heartbeat (line 15)
- `Secret/R_C.md` — Section 6

---

## ✏️ Concept - 03

**🔤 Name:**

Field Whitelisting on PATCH Routes and the Mass Assignment Vulnerability

**🎯 Purpose:**

The `PATCH /posts/:id` endpoint exists so users can increment the like count on a post. It should only be able to update the `likes` field — nothing else. Field whitelisting is the technique that enforces that contract at the controller level: instead of forwarding the entire request body to Mongoose, the controller explicitly extracts only the one permitted field.

**❓ Why it was challenging:**

The original version of `updatePost` passed `req.body` directly to `findByIdAndUpdate`:

```js
// ❌ dangerous — any field in the body gets written
const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
```

My first assumption was that Mongoose's `strict` mode would protect against this. `strict: true` is the default — it rejects unknown fields. But that is the wrong mental model. `strict` mode blocks fields that are **not in the schema** (completely unknown properties). It does not block known fields that simply should not be writable through this particular route. `content` and `user_id` are both valid Post schema fields, so Mongoose passes them through without complaint. A caller could send `{ "likes": 1, "content": "replaced", "user_id": "attacker-id" }` and silently overwrite any post in the database.

The fix is to explicitly name what you accept:

```js
// ✅ safe — only likes can be changed through this route
const { likes } = req.body;
const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { likes } }, { new: true, runValidators: true });
```

Everything else in `req.body` is never destructured and never reaches the database. The same principle appears throughout the project:

| Handler | Fields extracted from body | Fields blocked |
|---|---|---|
| `createUser` | `first_name`, `last_name`, `email`, `password`, `birthday`, `location`, `occupation` | `auth_level`, `status` — set server-side only |
| `createPost` | `content` | `user_id` (from session), `time_stamp` (server-generated), `likes`, `comments` |
| `createComment` | `content`, `post_id` | `user_id` (from session), `time_stamp` (server-generated), `likes` |
| `updatePost` | `likes` | `content`, `user_id`, `time_stamp`, `comments` |
| `updateComment` | `content`, `likes` | `post_id`, `user_id`, `time_stamp` |

The schema defines what *can exist* in the database. The controller defines what *a caller is allowed to write* for a given operation. Those are two different things.

**📍 Where (file & line):**

- `server/controllers/post.controller.js` — whitelist comment and `const { likes } = req.body` (lines 59–64), `findByIdAndUpdate` (line 68)
- `server/controllers/comment.controller.js` — conditional update build that allows only `content` and `likes` (line 87+)
- `server/controllers/user.controller.js` — `auth_level: "basic"` hardcoded on create, never read from `req.body`
- `Secret/R_C.md` — Section 5 (before/after pattern, cross-handler reference table)

---