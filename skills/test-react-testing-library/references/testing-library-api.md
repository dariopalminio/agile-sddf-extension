# React Testing Library API Reference

## render()

```ts
import { render } from '@testing-library/react'

const result = render(ui, options?)
```

### Basic Usage

```tsx
import { render, screen } from "@testing-library/react";

test("renders greeting", () => {
  render(<Greeting name="World" />);
  expect(screen.getByText("Hello, World!")).toBeInTheDocument();
});
```

### Render Options

```ts
render(<Component />, {
  container: document.body.appendChild(document.createElement("div")),
  baseElement: document.body,
  hydrate: false,
  legacyRoot: false, // React 17 mode (not available in React 19+)
  wrapper: AllProviders,
  queries: { ...queries, ...customQueries },
  reactStrictMode: true,
  // React 19 error handlers
  onCaughtError: (error, errorInfo) => {},
  onRecoverableError: (error, errorInfo) => {},
});
```

| Option               | Description                                      |
| -------------------- | ------------------------------------------------ |
| `container`          | DOM element to render into                       |
| `baseElement`        | Element for queries (default: document.body)     |
| `hydrate`            | Use ReactDOM.hydrate for SSR                     |
| `legacyRoot`         | Use React 17 rendering (not in React 19+)        |
| `wrapper`            | Component to wrap around rendered element        |
| `queries`            | Custom queries to use                            |
| `reactStrictMode`    | Enable React StrictMode                          |
| `onCaughtError`      | Callback for errors caught by Error Boundary     |
| `onRecoverableError` | Callback for errors React automatically recovers |

### Render Result

```ts
const {
  container, // DOM container element
  baseElement, // Base element for queries
  debug, // console.log(prettyDOM())
  rerender, // Re-render with new props
  unmount, // Unmount component
  asFragment, // Get DocumentFragment snapshot
  ...queries // All query functions bound to baseElement
} = render(<Component />);
```

### React Error Handlers (v16.2.0+)

Handle errors in tests with React 19 error callbacks:

```tsx
test("catches error boundary errors", async () => {
  const user = userEvent.setup();
  const errors: Error[] = [];

  render(<ComponentWithErrorBoundary />, {
    onCaughtError: (error, errorInfo) => {
      errors.push(error);
      console.log("Caught:", error.message);
      console.log("Component stack:", errorInfo.componentStack);
    },
  });

  // Trigger error and verify
  await user.click(screen.getByRole("button", { name: /throw/i }));
  expect(errors).toHaveLength(1);
});

test("handles recoverable errors", () => {
  const recoverableErrors: Error[] = [];

  render(<HydratedComponent />, {
    hydrate: true,
    onRecoverableError: (error, errorInfo) => {
      recoverableErrors.push(error);
    },
  });

  expect(recoverableErrors).toHaveLength(0);
});
```

---

## screen

Pre-bound queries for document.body:

```ts
import { render, screen } from "@testing-library/react";

render(<Component />);

// All queries available
screen.getByRole("button");
screen.queryByText("Loading");
screen.findByLabelText("Email");

// Debug
screen.debug();
screen.debug(screen.getByRole("button"));

// Playground URL
screen.logTestingPlaygroundURL();
```

---

## rerender()

Update props without remounting:

```tsx
const { rerender } = render(<Counter count={1} />);
expect(screen.getByText("Count: 1")).toBeInTheDocument();

rerender(<Counter count={2} />);
expect(screen.getByText("Count: 2")).toBeInTheDocument();
```

---

## unmount()

```ts
const { unmount } = render(<Component />);
unmount();
// Component is now unmounted, container is empty
```

---

## asFragment()

Create snapshot of current DOM state:

```tsx
const user = userEvent.setup();
const { asFragment } = render(<Component />);

const firstRender = asFragment();
await user.click(screen.getByRole("button"));

// Snapshot diff
expect(firstRender).toMatchDiffSnapshot(asFragment());
```

---

## cleanup()

Unmounts all rendered components. In Vitest it runs automatically when `globals: true`,
because RTL registers itself on the global `afterEach`.

```ts
import { cleanup, render } from "@testing-library/react";

// Only needed when `globals: false` — otherwise it is automatic
import { afterEach } from "vitest";
afterEach(cleanup);

// Or skip auto-cleanup entirely
import "@testing-library/react/dont-cleanup-after-each";
```

> Without cleanup, components from one test stay mounted for the next one and queries start
> failing with "Found multiple elements" — a failure that only shows up when the whole file
> runs, not when the test runs alone.

---

## act()

Wrap state updates:

```ts
import { act } from "@testing-library/react";

await act(async () => {
  // Trigger state updates that RTL does not wrap for you
  result.current.increment();
  await promise;
});
```

**Note:** Most RTL methods handle `act()` automatically — `render`, `rerender` and every
`userEvent` method already wrap their updates. Use `act()` explicitly only when you call
something yourself that triggers a state update, such as a hook method returned by
`renderHook` or advancing fake timers.

---

## renderHook()

Test custom hooks:

```ts
import { renderHook, act } from "@testing-library/react";

test("useCounter", () => {
  const { result } = renderHook(() => useCounter());

  expect(result.current.count).toBe(0);

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

### With Initial Props

```ts
const { result, rerender } = renderHook((props) => useUser(props.id), { initialProps: { id: 1 } });

expect(result.current.name).toBe("User 1");

rerender({ id: 2 });
expect(result.current.name).toBe("User 2");
```

### With Wrapper

```ts
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

const { result } = renderHook(() => useAuth(), { wrapper });
```

### Result Object

```ts
const {
  result, // { current: hookReturnValue }
  rerender, // Re-run hook with new props
  unmount, // Unmount hook
} = renderHook(() => useMyHook());
```

---

## configure()

Set global options:

```ts
import { configure } from "@testing-library/react";

configure({
  testIdAttribute: "data-my-test-id",
  asyncUtilTimeout: 5000,
  defaultHidden: false,
  throwSuggestions: true,
  reactStrictMode: true,
});
```

---

## Custom Render Pattern

```tsx
// test-utils.tsx
import { render, RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";

const AllProviders = ({ children }) => (
  <ThemeProvider>
    <AuthProvider>{children}</AuthProvider>
  </ThemeProvider>
);

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) => render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
```

Usage:

```tsx
import { render, screen } from "./test-utils";

test("works with providers", () => {
  render(<MyComponent />);
  // Component has access to ThemeProvider and AuthProvider
});
```

---

## Vitest Configuration

This skill uses **Vitest + happy-dom**. See `vitest-component.md` for the full config.

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom", // faster than jsdom; swap only if a browser API is missing
    globals: true, // enables RTL auto-cleanup
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

```ts
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
```

> Import the **`/vitest`** entry point, not `@testing-library/jest-dom`. It is the one that
> registers the matchers on Vitest's `expect`; with the generic import `toBeInTheDocument`
> can fail with "is not a function".
