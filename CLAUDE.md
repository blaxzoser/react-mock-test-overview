# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Index

1. [Project overview](#project-overview)
2. [Repository layout](#repository-layout)
3. [Commands](#commands)
4. [Architecture and data flow](#architecture-and-data-flow)
5. [Code conventions](#code-conventions)
6. [Intentional gaps — do not fix unasked](#intentional-gaps--do-not-fix-unasked)
7. [Documentation](#documentation)
8. [Git and repo hygiene](#git-and-repo-hygiene)

## Project overview

A React interview-practice project for a developer coming from Angular. The app, **Reach Poster**, is a small Star Wars–themed message board: a header with a **New Post** button, a modal form, and a grid of posts held in React state (no backend, no persistence).

The code is study material first and an app second. Keep it small and readable; prefer explaining a concept over adding abstractions.

## Repository layout

```
/                                   # repo root (git, README, this file)
├── README.md                       # GitHub-facing readme
├── .gitignore                      # React-focused ignore rules
├── package.json                    # leftover root package (react-icons only) — not the app
└── react-overview-mock-interview/  # the actual Vite + React app
    ├── docs/
    │   ├── project-guide.md        # file-by-file guide, theory, interview Q&A
    │   └── react-for-angular-devs.md
    ├── src/
    │   ├── main.jsx                # entry, mounts <App /> in <StrictMode>
    │   ├── App.jsx                 # root, owns modal visibility
    │   ├── index.css               # global styles + theme tokens
    │   └── components/             # Hearder, PostList, Post, AddPost, Modal (+ .module.css)
    ├── vite.config.js
    └── eslint.config.js
```

All app work happens inside `react-overview-mock-interview/`. Ignore the root `package.json` unless asked.

## Commands

Run from `react-overview-mock-interview/`:

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Vite dev server with HMR (http://localhost:5173) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm run lint` | ESLint (recommended + react-hooks + react-refresh) |

There is no test suite. After a code change, run `npm run lint` and `npm run build` to check it.

## Architecture and data flow

**Data flows down through props; events flow up through callback props.**

| State | Lives in | Why |
|-------|----------|-----|
| `modelIsVisible` | `App` | `Header` opens the modal and `PostList` closes it, so it is lifted to their common parent |
| `posts` | `PostList` | Only `PostList` reads it; `AddPost` writes it through the `onAddPost` callback |
| `enteredBody`, `enteredAuthor` | `AddPost` | Only the form needs in-progress input |

`Modal` is a generic wrapper that renders its `children` over a backdrop. New posts are prepended (`[newPost, ...old]`).

## Code conventions

- **Stack:** React 19, Vite 8, plain JavaScript (`.jsx`), no TypeScript, no router, no state library.
- **Components:** function components only, one per file, PascalCase file and component names, default export.
- **Hooks:** `useState` for local state; follow the Rules of Hooks (enforced by ESLint).
- **Styling:** CSS Modules (`Component.module.css`, imported as `classes`). Global styles and theme tokens only in `index.css`.
- **Icons:** `react-icons` (`react-icons/md`).
- **State updates:** immutable — spread into new arrays/objects, use the updater form when the next state depends on the previous one.
- **Handlers:** camelCase, `somethingHandler` naming; callback props start with `on` (`onCreatePost`, `onAddPost`).
- Keep the Angular comparison in mind: when explaining something, relate it to the Angular equivalent where helpful.

## Intentional gaps — do not fix unasked

`docs/project-guide.md` §8 lists real flaws in the code that serve as interview talking points. **Do not fix them unless the user asks**, and if you do fix one, update §8 of the guide in the same change:

- `key={index}` on a prepended list (`PostList.jsx`)
- inputs not fully controlled (`AddPost.jsx`)
- filename typo `Hearder.jsx`
- capitalized `SetPosts` / `AddPostHandler` (`PostList.jsx`)
- `modelIsVisible` typo for "modal" (`App.jsx`)
- leftover `console.log(postData)` (`AddPost.jsx`)
- no persistence, no Escape-to-close or focus trap, whitespace-only posts allowed

## Documentation

- [README.md](README.md) — public overview, setup, structure.
- [project-guide.md](react-overview-mock-interview/docs/project-guide.md) — what each file teaches, theory, known gaps, mock interview questions, exercises.
- [react-for-angular-devs.md](react-overview-mock-interview/docs/react-for-angular-devs.md) — React concepts mapped to Angular.

When code changes affect structure, components, state ownership or scripts, update the README, the project guide and this file to match.

## Git and repo hygiene

- Branch: `main`. Remote: `github.com/blaxzoser/react-mock-test-overview`.
- Never commit `node_modules/`, `dist/`, `.env*` (except `.env.example`), logs or editor files — see `.gitignore`.
- Save Markdown files as UTF-8 (the original README was UTF-16 and rendered garbled on GitHub).
- Commit or push only when the user asks.
