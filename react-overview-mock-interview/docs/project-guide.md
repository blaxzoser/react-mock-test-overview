# Reach Poster — Project Guide

> A study guide for this repo: what the app does, what each file teaches, the theory behind it, and the reminders worth re-reading before an interview.
>
> Companion doc: [React for Angular Devs](./react-for-angular-devs.md). Every concept below links to its section there, so you can go back to "what this would be in Angular" at any time.

---

## Table of Contents

1. [What the App Does](#1-what-the-app-does)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Component Tree & Data Flow](#4-component-tree--data-flow)
5. [File by File](#5-file-by-file)
6. [Concepts Covered (Checklist)](#6-concepts-covered-checklist)
7. [Extra Theory](#7-extra-theory)
8. [Known Gaps in This Code (Good Interview Talking Points)](#8-known-gaps-in-this-code-good-interview-talking-points)
9. [Don't-Forget Reminders](#9-dont-forget-reminders)
10. [Mock Interview Questions](#10-mock-interview-questions)
11. [Next Steps / Exercises](#11-next-steps--exercises)

---

## 1. What the App Does

**Reach Poster** is a small Star Wars–themed message board:

1. The page shows a header with a **New Post** button and an empty-state message ("There are no posts yet").
2. Clicking **New Post** opens a **modal** with a form (text + your name).
3. Clicking **Add** creates the post, closes the modal, and shows the post at the **top** of a grid.
4. Clicking **Cancel** or the dark **backdrop** closes the modal without saving.

Posts live only in memory (React state) — a page reload clears them.

It's small, but it covers the core of React: components, JSX, props, state, events, lifting state up, conditional rendering, lists with keys, `children` composition, forms, and CSS Modules.

---

## 2. Tech Stack

| Tool | Version | Role | Angular equivalent |
|------|---------|------|--------------------|
| React | 19 | UI library | Angular framework (core) |
| React DOM | 19 | Renders React to the browser | `platform-browser` |
| Vite | 8 | Dev server + bundler (HMR) | Angular CLI (`ng serve` / `ng build`) |
| `@vitejs/plugin-react` | 6 | JSX transform + Fast Refresh | Angular compiler |
| react-icons | 5 | Icon components (`MdPostAdd`, `MdMessage`) | Angular Material icons |
| CSS Modules | built into Vite | Scoped component styles | `ViewEncapsulation.Emulated` |
| ESLint + `react-hooks` plugin | 10 / 7 | Linting, Rules of Hooks | `angular-eslint` |

### Scripts

```bash
npm install      # install dependencies
npm run dev      # start dev server (like ng serve)
npm run build    # production build into dist/ (like ng build)
npm run preview  # serve the built dist/ locally
npm run lint     # run ESLint
```

---

## 3. Project Structure

```
react-overview-mock-interview/
├── index.html                 ← the single HTML page; loads fonts and /src/main.jsx
├── vite.config.js             ← Vite config (just the React plugin)
├── eslint.config.js
├── docs/
│   ├── react-for-angular-devs.md
│   └── project-guide.md       ← this file
└── src/
    ├── main.jsx               ← entry point: mounts <App /> into #root
    ├── index.css              ← global styles + Star Wars theme tokens
    ├── App.jsx / App.css      ← root component, owns "is the modal open?"
    └── components/
        ├── Hearder.jsx        ← header + "New Post" button (note the filename typo)
        ├── PostList.jsx       ← owns the posts array, shows modal / list / empty state
        ├── Post.jsx           ← one post card
        ├── Modal.jsx          ← backdrop + <dialog>, renders whatever children it gets
        ├── AddPost.jsx        ← the form
        └── *.module.css       ← one scoped stylesheet per component
```

---

## 4. Component Tree & Data Flow

```
main.jsx
└── <StrictMode>
    └── <App>                         state: modelIsVisible (boolean)
        ├── <Header onCreatePost>     ──► calls showModalHandler()  → true
        └── <main>
            └── <PostList isPosting onStopPosting>
                │                     state: posts (array)
                ├── {isPosting &&
                │   <Modal onClose>   ──► backdrop click → onStopPosting() → false
                │     └── <AddPost onCancel onAddPost>
                │                     state: enteredBody, enteredAuthor
                │                     submit ──► onAddPost(postData) → posts = [new, ...old]
                │                            ──► onCancel()          → modal closes
                ├── {posts.length > 0 && <ul> posts.map(→ <Post />) </ul>}
                └── {posts.length === 0 && <empty state />}
```

### The one rule to remember

> [!IMPORTANT]
> **Data flows down through props. Events flow up through callback props.**
> A child never changes the parent's state directly — it calls a function the parent gave it.

| Piece of state | Lives in | Why there |
|----------------|----------|-----------|
| `modelIsVisible` | `App` | Both `Header` (opens) and `PostList` (closes) need it → lifted to their common parent |
| `posts` | `PostList` | Only `PostList` reads it, and `AddPost` (its descendant) writes it via callback |
| `enteredBody`, `enteredAuthor` | `AddPost` | Only the form cares about in-progress typing |

This is **"lifting state up"**: put state in the *closest common ancestor* of everything that needs it — no higher.

*Angular link:* this is `@Input()` down / `@Output() EventEmitter` up. In React the "output" is just a function passed as a prop. → [Props](./react-for-angular-devs.md#3-props)

---

## 5. File by File

### `index.html`

- The **only** HTML page. React mounts inside `<div id="root"></div>`.
- Loads Google Fonts (Orbitron, Titillium Web) and `<script type="module" src="/src/main.jsx">`.
- In Vite, `index.html` sits at the project root and *is* the entry point (in Angular it's `src/index.html` and the CLI injects scripts).

### `src/main.jsx` — bootstrapping

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Concepts:** `createRoot`, `StrictMode`, global CSS import.

- `createRoot(...).render(<App />)` = Angular's `bootstrapApplication(AppComponent)`.
- `import './index.css'` — importing CSS from JS is a bundler feature (Vite). Global, unscoped.

> [!NOTE]
> **StrictMode** is dev-only. It intentionally **renders components twice** and **runs effects mount → unmount → mount** to expose impure code and missing cleanups. If you see a `console.log` print twice in dev, that's why — not a bug. Nothing changes in production.

### `src/App.jsx` — root component, lifted state

```jsx
const [modelIsVisible, setModelIsVisible] = useState(false);
function showModalHandler()   { setModelIsVisible(true); }
function hiddenModalHandler() { setModelIsVisible(false); }

<Header onCreatePost={showModalHandler} />
<PostList isPosting={modelIsVisible} onStopPosting={hiddenModalHandler} />
```

**Concepts:** `useState`, event-handler functions, passing callbacks as props, Fragment `<>…</>`.

- `useState(false)` returns `[value, setter]`. Calling the setter **schedules a re-render** of `App` and its children.
- Pass the function **reference** (`onCreatePost={showModalHandler}`), not a call (`showModalHandler()` would run during render).
- `<>…</>` is a Fragment: groups elements without adding a DOM node (Angular: `<ng-container>`).
- Naming convention: props that receive callbacks start with `on…` (`onCreatePost`), the functions that implement them often end with `…Handler`.

→ [State](./react-for-angular-devs.md#4-state)

### `src/components/Hearder.jsx` — presentational component + icons

**Concepts:** destructured props, callback prop wired to `onClick`, third-party components (`react-icons`), CSS Modules.

- `function Header({ onCreatePost })` — destructuring props in the signature.
- `<MdPostAdd size={18} />` — icons are just components; `size` is a prop.
- The file is named `Hearder.jsx` but exports `Header`. The **import name is what matters** in JSX, not the filename (`import Header from './components/Hearder'`). Still a typo worth fixing.

### `src/components/PostList.jsx` — the "smart" component

```jsx
const [posts, SetPosts] = useState([]);

function AddPostHandler(postData) {
  SetPosts((existingPost) => [postData, ...existingPost]);
}
```

**Concepts:** array state, **functional updater**, immutable updates, conditional rendering with `&&`, lists with `.map()` + `key`, composing `Modal` + `AddPost`.

- **Functional updater** `SetPosts(prev => …)`: use it whenever the new state depends on the old state. It always receives the latest value, even if several updates are batched.
- **Immutability**: `[postData, ...existingPost]` creates a **new array**. `posts.push(x)` would mutate the same array → React compares by reference (`Object.is`), sees "same array", and **skips the re-render**.
- **Conditional rendering**: `{isPosting && <Modal>…</Modal>}` — if `isPosting` is false, nothing renders and the `AddPost` form is **unmounted** (its typed state is destroyed). Angular: `*ngIf` / `@if`.
- **Lists**: `posts.map((post, index) => <Post key={index} … />)` — Angular: `*ngFor` / `@for` with `trackBy` / `track`.

→ [Conditional Rendering](./react-for-angular-devs.md#6-conditional-rendering) · [Lists](./react-for-angular-devs.md#7-lists)

### `src/components/Post.jsx` — dumb display component

```jsx
function Post(props) {
  return <li> <p>{props.author}</p> <p>{props.body}</p> </li>;
}
```

**Concepts:** the raw `props` object (vs. destructuring elsewhere), `{}` interpolation.

- `props` is a plain, **read-only** object. `Post(props)` and `Post({ author, body })` are equivalent — destructuring is just more readable.
- `key` is **not** in `props` — React consumes it.
- `{props.body}` is **auto-escaped**: user text containing `<script>` is rendered as text, not HTML (XSS-safe by default, like Angular interpolation).

### `src/components/Modal.jsx` — composition with `children`

```jsx
function Modal({ children, onClose }) {
  return (
    <>
      <div className={classes.backdrop} onClick={onClose}></div>
      <dialog open={true} className={classes.modal}>{children}</dialog>
    </>
  );
}
```

**Concepts:** the `children` prop, reusable wrapper components, backdrop-click to close.

- Whatever goes between `<Modal>` and `</Modal>` arrives as `children`. Angular: `<ng-content>`.
- `Modal` knows nothing about posts — it's a generic shell. That's **composition over inheritance**, React's main reuse mechanism.
- `<dialog open>` shows the dialog non-modally; the custom backdrop `div` provides the overlay and the click-to-close.

### `src/components/AddPost.jsx` — forms and local state

```jsx
const [enteredBody, setEnteredBody] = useState('');
function bodyChangeHandler(event) { setEnteredBody(event.target.value); }

function submitHandler(event) {
  event.preventDefault();
  onAddPost({ body: enteredBody, author: enteredAuthor });
  onCancel();
}

<form onSubmit={submitHandler}>
  <textarea id="body" required onChange={bodyChangeHandler} />
```

**Concepts:** form state with `useState`, `onChange`, `event.target.value`, `onSubmit` + `preventDefault()`, `htmlFor`, `type="button"` vs `type="submit"`, child → parent communication.

- `event.preventDefault()` stops the browser's default full-page form submit (Angular's `(ngSubmit)` does this for you).
- `htmlFor` instead of `for`, `className` instead of `class` (they're reserved words in JS).
- `type='button'` on **Cancel** is essential — a `<button>` inside a `<form>` defaults to `type="submit"`.
- The `required` attribute gives native browser validation for free.
- React's `onChange` fires on **every keystroke** (it behaves like the DOM `input` event, not the DOM `change` event).

→ [JSX](./react-for-angular-devs.md#2-jsx)

### CSS: `index.css` + `*.module.css`

- `index.css` — **global**: Star Wars design tokens as CSS custom properties (`--crawl`, `--jedi`, `--sith`…), animated starfield with `body::before/::after`, `prefers-reduced-motion` support.
- `*.module.css` — **CSS Modules**: `import classes from './Post.module.css'` gives an object; `classes.post` is a generated unique class name like `_post_x7a2b`. Styles can't leak between components.
- Angular comparison: Angular scopes component styles by default; React does not — CSS Modules is one way to opt into it (others: Tailwind, styled-components, CSS-in-JS).

---

## 6. Concepts Covered (Checklist)

| # | Concept | Where in this repo | Angular equivalent |
|---|---------|--------------------|--------------------|
| 1 | Function components | every `.jsx` file | `@Component` class |
| 2 | JSX & `{}` expressions | every component | template `{{ }}`, `[ ]`, `( )` |
| 3 | Props (destructured & raw) | `Header`, `Post` | `@Input()` |
| 4 | Callback props | `onCreatePost`, `onAddPost`, `onCancel` | `@Output()` + `EventEmitter` |
| 5 | `useState` | `App`, `PostList`, `AddPost` | class field + change detection / `signal()` |
| 6 | Functional state updater | `PostList` → `SetPosts(prev => …)` | `signal.update(prev => …)` |
| 7 | Immutable array update | `[postData, ...existingPost]` | same idea as OnPush-friendly updates |
| 8 | Lifting state up | modal state in `App` | shared parent / service |
| 9 | Conditional rendering | `PostList` (`&&`) | `*ngIf` / `@if` |
| 10 | Lists + `key` | `PostList` → `posts.map` | `*ngFor` + `trackBy` / `@for … track` |
| 11 | `children` / composition | `Modal` | `<ng-content>` |
| 12 | Fragments | `App`, `Modal`, `PostList` | `<ng-container>` |
| 13 | Forms & events | `AddPost` | Template / Reactive forms |
| 14 | CSS Modules | `*.module.css` | `ViewEncapsulation.Emulated` |
| 15 | Third-party components | `react-icons` | Angular Material |
| 16 | App bootstrap + StrictMode | `main.jsx` | `bootstrapApplication` + dev-mode checks |

**Not covered yet** (see [§11](#11-next-steps--exercises)): `useEffect`, data fetching, Context / custom hooks, routing, `useRef`, `useMemo` / `useCallback`, TypeScript, tests.

---

## 7. Extra Theory

### 7.1 What a "render" actually is

A render = React **calling your component function again**. Every render:

1. The function runs top to bottom.
2. Local variables and handler functions are **recreated**.
3. `useState` returns the **current** value React stores for that component.
4. React diffs the new JSX against the previous one (**reconciliation**) and touches only the DOM that changed.

A component re-renders when: **its state changes**, **its parent re-renders**, or **a context it uses changes**. Props changing is just a consequence of the parent re-rendering.

> [!TIP]
> Angular checks bindings after events (zone.js) or when signals change. React does **nothing** until you call a setter. No setter call = no update. That's the #1 mental shift.

### 7.2 State is a snapshot

```jsx
function handle() {
  setCount(count + 1);
  setCount(count + 1);
  console.log(count); // still the OLD value
}
// Result: +1, not +2 — both lines read the same snapshot.

function handleFixed() {
  setCount(c => c + 1);
  setCount(c => c + 1); // +2 — each updater gets the latest value
}
```

`count` inside a render is a **constant for that render**. The setter doesn't change the variable; it asks React to render again with a new value. React 18+ also **batches** multiple setter calls in one event into a single re-render.

### 7.3 Why immutability matters

React decides "did state change?" with `Object.is(old, new)` — a **reference** comparison, not a deep compare.

| ❌ Mutates (no re-render) | ✅ New reference |
|---|---|
| `posts.push(p)` | `[...posts, p]` / `[p, ...posts]` |
| `posts.splice(i, 1)` | `posts.filter((_, idx) => idx !== i)` |
| `posts[i].body = 'x'` | `posts.map((p, idx) => idx === i ? { ...p, body: 'x' } : p)` |
| `user.name = 'x'` | `{ ...user, name: 'x' }` |

Same reason Angular `OnPush` needs new object references.

### 7.4 Keys and reconciliation

When a list re-renders, React matches old and new items **by key**. Same key → same component instance (state preserved, DOM reused). Different key → unmount + mount.

- **Index as key** breaks when items are inserted at the top, removed, or reordered: the item at index 0 is now a *different* post but React thinks it's the same one. This repo prepends posts, so `key={index}` is exactly the risky case (harmless today only because `Post` has no state or inputs).
- Use a **stable unique id** (`crypto.randomUUID()` at creation time, or a DB id).
- Bonus trick: changing a component's `key` on purpose **resets its state**.

### 7.5 Controlled vs. uncontrolled inputs

| | Controlled | Uncontrolled |
|---|---|---|
| Source of truth | React state | The DOM |
| Code | `value={x}` + `onChange` | `defaultValue` + `useRef` / `FormData` on submit |
| Can reset / format / validate per keystroke | ✅ Easy | ❌ Harder |
| Angular analogue | `[(ngModel)]` / `FormControl` | reading `nativeElement.value` |

`AddPost` uses `onChange` to track state but **doesn't pass `value`**, so it's a half-way version: React reads the input but doesn't control it. Adding `value={enteredBody}` makes it fully controlled. (React 19 also supports `<form action={fn}>` that receives `FormData` directly.)

### 7.6 Presentational vs. container components

- **Container / "smart"**: owns state and logic → `App`, `PostList`.
- **Presentational / "dumb"**: only props in, JSX out → `Header`, `Post`, `Modal`.

Keeping most components presentational makes them reusable and trivial to test. Same idea as Angular smart/dumb components.

### 7.7 Unidirectional data flow

React has **no two-way binding**. `[(ngModel)]` in Angular = `value={x}` + `onChange={e => setX(e.target.value)}` in React. More typing, but every change is explicit and traceable.

### 7.8 Rules of Hooks

1. Call hooks only at the **top level** of a component or custom hook — never inside `if`, loops, or nested functions.
2. Call hooks only from **React functions** (components or `useSomething` hooks).

Why: React identifies each `useState` **by call order**. Skipping one in an `if` shifts every hook after it. The `eslint-plugin-react-hooks` in this repo enforces this.

---

## 8. Known Gaps in This Code (Good Interview Talking Points)

Being able to critique your own code is an interview plus. These are real in this repo:

| Issue | Where | Why it matters | Fix |
|---|---|---|---|
| `key={index}` on a list that **prepends** | `PostList.jsx` | Wrong item identity on insert/delete/reorder | Add `id: crypto.randomUUID()` when creating the post; `key={post.id}` |
| Inputs not fully controlled | `AddPost.jsx` | Can't reset or pre-fill the form from state | Add `value={enteredBody}` / `value={enteredAuthor}` |
| Filename typo `Hearder.jsx` | `components/` | Confusing imports | Rename to `Header.jsx`, update import in `App.jsx` |
| `SetPosts`, `AddPostHandler` capitalized | `PostList.jsx` | Convention: **PascalCase = components only**; functions are camelCase | `setPosts`, `addPostHandler` |
| `modelIsVisible` | `App.jsx` | Typo for "modal" | `modalIsVisible` |
| Leftover `console.log(postData)` | `AddPost.jsx` | Noise in production | Remove |
| No persistence | `PostList.jsx` | Posts vanish on reload | `localStorage` via `useEffect`, or a backend + fetch |
| No Escape-to-close, no focus trap | `Modal.jsx` | Accessibility | Use `dialog.showModal()` via `useRef` + `useEffect` (native Esc + focus trap), or `createPortal` |
| Whitespace-only posts allowed | `AddPost.jsx` | `required` accepts `"   "` | `if (!enteredBody.trim()) return;` |

---

## 9. Don't-Forget Reminders

> [!IMPORTANT]
> **The 12 things you will forget — re-read before every interview.**

1. 🔁 **Calling a setter is the only thing that triggers a re-render.** Changing a normal variable does nothing.
2. 📸 **State is a snapshot.** After `setX(5)`, `x` is still the old value until the next render.
3. ➕ **Depends on previous state? Use the updater:** `setX(prev => prev + 1)`.
4. 🧊 **Never mutate state.** Spread / `map` / `filter` to make new arrays and objects.
5. 🔑 **Keys = stable unique ids, not indexes** (especially when you add to the top or reorder).
6. 📞 **Pass the function, don't call it:** `onClick={handler}` ✅ — `onClick={handler()}` ❌ (runs on render). Need arguments? `onClick={() => handler(id)}`.
7. ⬇️⬆️ **Props down, callbacks up.** Shared state goes in the closest common parent.
8. 🚫 **`0 && <X />` renders `0`.** Use `count > 0 && …` or a ternary.
9. 📝 **Forms:** `event.preventDefault()` in `onSubmit`; give non-submit buttons `type="button"`.
10. 🏷️ **JSX attribute names:** `className`, `htmlFor`, camelCase events (`onClick`, `onChange`), self-close tags (`<input />`).
11. 🪝 **Hooks at the top level only**, never inside `if` / loops. Custom hooks start with `use`.
12. 👯 **StrictMode double-renders in dev.** Double logs ≠ bug.

> [!WARNING]
> **Angular habits that break React:**
> - Expecting `this.x = …` to update the UI → use a setter.
> - Looking for two-way binding → `value` + `onChange`.
> - Expecting scoped styles by default → use CSS Modules (or similar).
> - Writing `class=` / `for=` → `className=` / `htmlFor=`.
> - Reaching for a service + DI for everything → start with props; use Context / custom hooks when prop-drilling hurts.

---

## 10. Mock Interview Questions

Answers are short on purpose — say them out loud.

<details>
<summary><b>Q1. What's the difference between props and state?</b></summary>

Props are inputs passed from the parent, read-only to the child. State is data the component owns and changes over time with a setter. Changing either re-renders the component. In this app, `isPosting` is a prop for `PostList`, but `modelIsVisible` is state in `App`.
</details>

<details>
<summary><b>Q2. How does a child component send data to its parent?</b></summary>

The parent passes a function as a prop; the child calls it with the data. `AddPost` calls `onAddPost(postData)`, which is `AddPostHandler` defined in `PostList`. Angular equivalent: `@Output()` + `EventEmitter`.
</details>

<details>
<summary><b>Q3. Why use <code>SetPosts(prev =&gt; [new, ...prev])</code> instead of <code>SetPosts([new, ...posts])</code>?</b></summary>

The updater always receives the latest state, even when updates are batched or the handler closed over an older `posts` value. It's the safe pattern whenever the next state depends on the previous one.
</details>

<details>
<summary><b>Q4. Why not <code>posts.push(newPost)</code>?</b></summary>

It mutates the existing array; the reference is unchanged, so React's `Object.is` check sees no change and may skip re-rendering. Always create a new array.
</details>

<details>
<summary><b>Q5. What is the <code>key</code> prop and why is index a bad key here?</b></summary>

`key` tells React which list item is which between renders. This app prepends new posts, so indexes shift on every add — index 0 is a different post each time. With stateful items that causes wrong state/DOM reuse. Use a stable id.
</details>

<details>
<summary><b>Q6. What is <code>children</code>?</b></summary>

A special prop containing whatever JSX is nested between a component's opening and closing tags. `Modal` renders `{children}` so it can wrap any content. Angular: `<ng-content>`.
</details>

<details>
<summary><b>Q7. Where should the modal's open/closed state live and why?</b></summary>

In `App`, because `Header` opens it and `PostList` closes it. State goes in the closest common ancestor of all components that need it — "lifting state up".
</details>

<details>
<summary><b>Q8. Controlled vs. uncontrolled input?</b></summary>

Controlled: React state is the source of truth (`value` + `onChange`). Uncontrolled: the DOM holds the value, read with a ref or `FormData`. `AddPost` currently tracks with `onChange` but doesn't set `value`, so it isn't fully controlled.
</details>

<details>
<summary><b>Q9. What happens to <code>AddPost</code>'s typed text when the modal closes?</b></summary>

`{isPosting && …}` unmounts `Modal` and `AddPost`, so their state is destroyed. Reopening starts with an empty form.
</details>

<details>
<summary><b>Q10. What does StrictMode do?</b></summary>

Dev-only checks: double-invokes renders and mounts/unmounts/remounts effects to surface impure renders and missing cleanups. No effect in production.
</details>

<details>
<summary><b>Q11. How would you persist posts across reloads?</b></summary>

Initialize with a lazy initializer `useState(() => JSON.parse(localStorage.getItem('posts')) ?? [])` and save in `useEffect(() => localStorage.setItem('posts', JSON.stringify(posts)), [posts])`. Or fetch from a backend in `useEffect` (or TanStack Query) and POST on submit.
</details>

<details>
<summary><b>Q12. How do CSS Modules work?</b></summary>

The bundler rewrites each class in a `.module.css` file to a unique name and exports a mapping object. `className={classes.post}` uses the generated name, so styles are scoped to the component — like Angular's emulated encapsulation.
</details>

---

## 11. Next Steps / Exercises

Each one adds a concept this project doesn't cover yet. Suggested order:

1. **Fix the gaps in [§8](#8-known-gaps-in-this-code-good-interview-talking-points)** — ids as keys, controlled inputs, naming.
2. **Delete a post** — add a button in `Post`, pass `onDelete(id)` down, use `filter` in `PostList`. *(callbacks with arguments, immutable removal)*
3. **Persist to `localStorage`** with `useEffect`. *(effects, dependency arrays)* → [useEffect](./react-for-angular-devs.md#5-useeffect)
4. **Close the modal with Escape** — `useEffect` adding a `keydown` listener with cleanup. *(effect cleanup = `ngOnDestroy`)*
5. **Extract a `usePosts()` custom hook** that owns the posts state + add/delete. *(custom hooks = services)* → [Context & Custom Hooks](./react-for-angular-devs.md#8-context--custom-hooks)
6. **Show a post count in the header** — the count lives in `PostList` but `Header` needs it. Lift state, or use Context. *(lifting state, Context)*
7. **Add routing** with `react-router` — `/` list, `/create` as a modal route, `/posts/:id` detail page. *(RouterModule equivalent)*
8. **Fetch posts from a fake API** (e.g. `json-server`) with loading/error states, then refactor to TanStack Query. *(async data, HttpClient equivalent)*
9. **Migrate to TypeScript** — type props with interfaces (`type PostProps = { author: string; body: string }`).
10. **Write tests** with Vitest + React Testing Library: "clicking New Post opens the form", "submitting adds a post".

---

*Companion to [react-for-angular-devs.md](./react-for-angular-devs.md) · October 2026*
