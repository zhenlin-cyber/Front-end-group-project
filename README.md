# Link Up

A casual, community-driven event board for informal activities like pickup basketball or a pottery night. Built with React (Vite), Firebase, and the Google Maps API.

**Team:** Zhen Lin, Kamilah Idris, Ajia Grant, Philmon Abraha. See [PROPOSAL.md](PROPOSAL.md).

**Figma:** https://www.figma.com/design/K6yUFWseQbNmYdYOMBtpdO/link-up?node-id=2-48&t=nfcxX2OstLiHkUgY-1 

## Running locally

1. Install [Node.js](https://nodejs.org/) 20 or newer.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in the values (ask Person 1 for them, or get them from the Firebase console under **Project settings → Your apps**).
   **Never commit `.env`.** It's already in `.gitignore`.
4. Start the dev server:
   ```bash
   npm run dev
   ```
   Then open http://localhost:5173.

| Variable | Where it comes from |
| --- | --- |
| `VITE_FIREBASE_*` | Firebase console → Project settings → Your apps → Config |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Cloud Console → APIs & Services → Credentials |

## Project structure

```
src/
  firebase.js            # the one place Firebase is initialized; import { auth, db } from here
  context/
    AuthProvider.jsx     # wraps the app, tracks the signed-in user
    authContext.js       # useAuth() hook
  components/
    Navbar.jsx
    ProtectedRoute.jsx   # wrap pages that need sign-in
    UserBadge.jsx        # name + attendance tier, e.g. on RSVP lists
  lib/
    users.js             # user profile reads/writes
    badges.js            # attended/hosted counts and tiers (cached)
  pages/
    Login.jsx
    Profile.jsx          # /profile/:uid
    Placeholder.jsx      # temporary; replace with your real pages in App.jsx
firestore.rules          # security rules (deploy with the Firebase CLI)
```

## Using auth in your components

```jsx
import { useAuth } from '../context/authContext'

const { user, loading, signIn, signOut } = useAuth()
// user is null when signed out; otherwise user.uid, user.displayName, user.photoURL
```

To require sign-in for a page, wrap it in `App.jsx`:

```jsx
<Route path="/events/new" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
```

To show someone's name with their badge (e.g. on an RSVP list):

```jsx
import UserBadge from '../components/UserBadge'
<UserBadge uid={rsvp.userId} />
```

After you create an event or an attendance record, call `clearUserStats(uid)` from `lib/badges.js` so badges refresh.

## Design system

Shared styles and components come from the Figma event details frame. Use them on new pages, and avoid hardcoding colors or sizes.

- **Tokens:** `src/styles/tokens.css` holds the colors, type sizes, radii and spacing (`var(--color-outline)`, `var(--space-3)`, ...). Spacing follows an 8px scale: 8, 16, 24, 32, 48, 64.
- **Components:** `src/components/ui` has `Button`/`ButtonGroup`, `Card`, `Title`/`Label`/`Body`, `Section`, `Stack`, `Field`, `Input`/`Textarea`, `ChoiceChips`, `Avatar`, `Person`, `PeopleList`, `Tile`/`DateTile`, `InfoRow`, `MediaFrame` and `BackLink`. Their styles are in `src/styles/ui.css`, along with the page layout classes `ui-page-wide` and `ui-split` (left media column + 540px main column).
- **Reference page:** run the app and open `/design` to see every component.

```jsx
import { Button, Card, Label } from '../components/ui'

<Card as="section">
  <Label>RSVP</Label>
  <Button variant="primary" onClick={join}>Going</Button>
</Card>
```

Page-specific layout (widths, grid, one-off margins) stays in `src/index.css` under a page prefix (for example `.ed-*` for event details).

## Data model

The security rules enforce these shapes, so writes that don't match will fail with `permission-denied`.

**`users/{uid}`**: created automatically on first sign-in.
```js
{ displayName, photoURL, joinedAt }   // joinedAt can never change
```

**`events/{eventId}`**: auto-generated ID (`addDoc`).
```js
{ title, activityType,              // activityType: sports | experiences | nature | arts
  lat, lng, locationName,
  address, description, capacity,    // optional (null when not set)
  startsAt, endsAt, expiresAt,       // Firestore Timestamps; expiresAt = endsAt
  hostId,                            // must equal the creator's uid
  createdAt }
```

**`rsvps/{eventId}_{userId}`**: the doc ID **must** be `` `${eventId}_${userId}` `` (use `setDoc`, not `addDoc`). This makes RSVPs one per person per event.
```js
{ eventId, userId, status,          // status: 'going' | 'interested' (missing = going)
  displayName, photoURL,             // copied in so signed-out visitors can see who's coming
  checkedIn: false, createdAt }
```

**`attendance/{eventId}_{userId}`**: created **only by the event's host**, only for people who RSVP'd. No record means a no-show, so no negative data is ever stored.
```js
{ eventId, userId, hostId, attended: true }
```

### Who can do what

| Collection | Read | Write |
| --- | --- | --- |
| users | signed-in users | only your own doc |
| events | anyone | host only (create/edit/delete) |
| rsvps | anyone | only your own RSVP |
| attendance | signed-in users | event host only; can't confirm yourself |

## Deploying security rules

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # pick our project
firebase deploy --only firestore:rules
```

Test rule changes first in the Firebase console → Firestore → Rules → **Rules Playground**.

## Known limitations

- A host could mark friends as attended when they didn't come. For a casual board we accept this; possible guards are to only count events with 2+ RSVPs, or to cap how many of one host's events count toward a single user's badge.
- Photo uploads are skipped because Firebase Storage requires the paid Blaze plan.
