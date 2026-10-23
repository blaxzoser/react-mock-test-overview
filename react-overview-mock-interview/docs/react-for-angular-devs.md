# React for Angular Devs

> You already know JavaScript, TypeScript, and advanced Angular.  
> This guide maps every React concept directly to what you already know.

---

## Table of Contents

1. [Components](#1-components)
2. [JSX](#2-jsx)
3. [Props](#3-props)
4. [State](#4-state)
5. [useEffect](#5-useeffect)
6. [Conditional Rendering](#6-conditional-rendering)
7. [Lists](#7-lists)
8. [Context & Custom Hooks](#8-context--custom-hooks)

---

## 1. Components

**Mental model:** `@Component` class → plain function

In Angular, a component requires a decorator, a class, and a template. In React, a component is just a **function** that returns JSX — no decorator, no class needed. The function name becomes the component tag.

### Angular

```typescript
@Component({
  selector: 'app-greeting',
  template: `<h1>Hello, {{ name }}!</h1>`
})
export class GreetingComponent {
  name = 'World';
}
```

### React

```jsx
function Greeting() {
  const name = 'World';
  return <h1>Hello, {name}!</h1>;
}

export default Greeting;
```

### Key Points

- Component names **must start with a capital letter**
- A component returns JSX — looks like HTML, but it's JavaScript
- One file = one component (convention, not enforced)

---

## 2. JSX

**Mental model:** Angular template syntax → JS expressions in `{}`

JSX is not a template language — it compiles directly to JavaScript. Instead of Angular's special syntax (`[]`, `()`, `{{}}`), JSX uses `{}` for **everything** dynamic.

### Angular

```html
<!-- Angular Template -->
<div class="box" [class.active]="isActive">
  <p>{{ message }}</p>
  <button (click)="handleClick()">Click</button>
</div>
```

### React

```jsx
function Box({ isActive, message, onClick }) {
  return (
    <div className={isActive ? 'box active' : 'box'}>
      <p>{message}</p>
      <button onClick={onClick}>Click</button>
    </div>
  );
}
```

### Key Points

- `class` → `className`, `for` → `htmlFor`
- All tags must be closed: `<br />` not `<br>`
- Return a single root element — or use `<>...</>` (Fragment)
- Events are camelCase: `onClick`, `onChange`, `onSubmit`

---

## 3. Props

**Mental model:** `@Input()` → destructured function arguments

Angular's `@Input()` decorator maps to React's **props** — a plain object passed to the function. Destructure them directly in the function signature. Props are **read-only**.

### Angular

```typescript
// Parent
<app-card [title]="myTitle" [count]="42" />

// Child
@Input() title: string;
@Input() count: number;
```

### React

```jsx
// Parent
<Card title="Dashboard" count={42} />

// Child — props is just an object!
function Card({ title, count }) {
  return (
    <div>
      <h2>{title}</h2>
      <span>{count}</span>
    </div>
  );
}
```

### Key Points

- Props are **immutable** — never mutate them
- String props: `title="hello"` — Number/bool/expression: `count={42}`
- Spread props: `<Card {...cardData} />` — Angular has no direct equivalent
- `children` prop = `ng-content`: `<Card><p>Inner</p></Card>`

---

## 4. State

**Mental model:** Class property + Change Detection → `useState` + explicit setter

Angular uses Change Detection to watch class properties. React is **explicit**: you declare state with `useState`, which returns `[value, setter]`. Calling the setter is what schedules a re-render — React never watches plain variables.

> ⚡ This is the #1 mental shift from Angular.

### Angular

```typescript
export class CounterComponent {
  count = 0;

  increment() {
    this.count++; // CD detects this
  }
}
```

### React

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1); // triggers re-render
  }

  return (
    <button onClick={increment}>Count: {count}</button>
  );
}
```

### Key Points

- `useState(initialValue)` returns `[state, setState]`
- **Never mutate state directly**: `state.push(x)` won't re-render
- For state based on previous value: `setCount(prev => prev + 1)`
- State updates may be batched — React 18+ batches automatically

---

## 5. useEffect

**Mental model:** `ngOnInit` / `ngOnDestroy` / `ngOnChanges` → one hook

Angular has explicit lifecycle hooks. React consolidates them into `useEffect`. The **dependency array** controls when it runs.

| Angular | React |
|---------|-------|
| `ngOnInit` | `useEffect(() => {}, [])` |
| `ngOnChanges` | `useEffect(() => {}, [dep])` |
| `ngOnDestroy` | `return () => cleanup` inside effect |
| Every render | `useEffect(() => {})` (no array) |

### Angular

```typescript
export class DataComponent implements OnInit, OnDestroy {
  sub: Subscription;

  ngOnInit() {
    this.sub = this.api.getData().subscribe(...);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
```

### React

```jsx
function DataComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/data', { signal: controller.signal })
      .then(r => r.json())
      .then(setData);

    // cleanup = ngOnDestroy
    return () => controller.abort();
  }, []); // [] = run once on mount

  return <div>{data?.name}</div>;
}
```

### Key Points

- `[]` → runs once on mount (like `ngOnInit`)
- `[dep1, dep2]` → runs when deps change (like `ngOnChanges`)
- Return a cleanup function to avoid memory leaks
- Don't lie about dependencies — ESLint `exhaustive-deps` helps

---

## 6. Conditional Rendering

**Mental model:** `*ngIf` → JavaScript ternary or `&&`

Angular uses structural directives (`*ngIf`). React uses plain **JavaScript expressions** inside JSX.

### Angular

```html
<div *ngIf="isLoaded; else loading">
  <p>Content loaded!</p>
</div>
<ng-template #loading>
  <p>Loading...</p>
</ng-template>
```

### React

```jsx
function Content({ isLoaded }) {
  // Option 1: Ternary (if/else)
  return isLoaded
    ? <p>Content loaded!</p>
    : <p>Loading...</p>;
}

function Content({ isLoaded }) {
  // Option 2: && short-circuit (show/hide)
  return (
    <div>
      {isLoaded && <p>Content loaded!</p>}
      {!isLoaded && <p>Loading...</p>}
    </div>
  );
}
```

### Key Points

- Ternary `condition ? <A /> : <B />` for if/else
- `condition && <A />` for show/hide
- ⚠️ Beware: `0 && <A />` renders `0` — use `!!count && <A />` or ternary
- For complex logic, compute a variable outside JSX and render that

---

## 7. Lists

**Mental model:** `*ngFor` + `trackBy` → `.map()` + `key`

Angular uses `*ngFor` with `trackBy`. React uses `.map()` — standard JavaScript. The `key` prop is React's equivalent of `trackBy`.

### Angular

```html
<ul>
  <li *ngFor="let item of items; trackBy: trackById">
    {{ item.name }}
  </li>
</ul>
```

### React

```jsx
function ItemList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>   {/* key = trackBy */}
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

### Key Points

- `key` must be **unique among siblings** — use IDs, not indexes
- Never use array index as key if the list can be reordered
- Keys don't get passed as props to the child component
- Put `key` on the **outermost element** returned from `.map()`

---

## 8. Context & Custom Hooks

**Mental model:** Singleton services / DI → Context API + custom hooks

Angular's powerful DI system maps roughly to React's **Context API** for simple shared state, or state management libraries (Zustand, Redux Toolkit) for complex apps.

### Angular

```typescript
// Service
@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal('dark');
}

// Component
constructor(private theme: ThemeService) {}
```

### React

```jsx
// 1. Create the context
const ThemeContext = createContext('light');

// 2. Provider wraps the tree (like providedIn: 'root' scope)
function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Page />
    </ThemeContext.Provider>
  );
}

// 3. Any descendant consumes it — no constructor injection
function Page() {
  const { theme } = useContext(ThemeContext);
  return <div className={theme}>...</div>;
}

// 4. Wrap in a custom hook (= injecting the service)
function useTheme() {
  return useContext(ThemeContext);
}
```

### Custom Hooks = Logic-only Services

```jsx
// useLocalStorage.js — reusable across any component
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    return JSON.parse(localStorage.getItem(key)) ?? initialValue;
  });

  const set = (newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, set];
}

// Usage — like injecting a service
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  return <button onClick={() => setTheme('light')}>{theme}</button>;
}
```

### Key Points

- Context is for **low-frequency updates** — theme, auth, locale
- For frequent updates (lists, counters), prefer **Zustand** or **Redux Toolkit**
- Custom hooks (`useTheme()`) are the React equivalent of injecting a service
- Hooks must start with `use` and follow the [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)

---

## Quick Reference Cheat Sheet

| Angular | React |
|---------|-------|
| `@Component` class | `function Component()` |
| `template: \`...\`` | `return <JSX />` |
| `{{ value }}` | `{value}` |
| `[property]="expr"` | `property={expr}` |
| `(event)="handler()"` | `onEvent={handler}` |
| `@Input() prop` | `function Comp({ prop })` |
| Class property | `useState(initial)` |
| `ChangeDetection` | `setState()` call |
| `ngOnInit` | `useEffect(() => {}, [])` |
| `ngOnDestroy` | `return () => cleanup` |
| `ngOnChanges` | `useEffect(() => {}, [dep])` |
| `*ngIf` | `condition && <A />` or ternary |
| `*ngFor` + `trackBy` | `.map()` + `key` |
| `ng-content` | `{children}` prop |
| `@Injectable` service | Custom hook or Context |
| `providedIn: 'root'` | `<Context.Provider>` at root |
| `RouterModule` | `react-router-dom` |
| `HttpClient` + `async` pipe | TanStack Query `useQuery` |
| `ReactiveFormsModule` | `react-hook-form` |
| `NgRx` | Zustand / Redux Toolkit |
| `OnPush` + `trackBy` | `React.memo` + `key` |
| `@ViewChild` | `useRef` |
| Pure pipe | `useMemo` |

---

## Recommended Learning Stack

Once you know the basics, these libraries complete the Angular→React migration:

```
React 19              → Core (replaces Angular framework)
TypeScript            → Already know this ✓
React Router 6        → RouterModule equivalent
TanStack Query        → HttpClient + async pipe equivalent
react-hook-form       → ReactiveFormsModule equivalent
Zustand               → NgRx (simpler API, no boilerplate)
Tailwind CSS          → Component styling
Vitest + RTL          → Jasmine/Karma equivalent
Vite                  → Angular CLI equivalent
```

---

*Generated with Claude · October 2026*
