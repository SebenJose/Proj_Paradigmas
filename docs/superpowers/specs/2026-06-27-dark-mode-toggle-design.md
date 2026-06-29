# Design Spec: Dark Mode Toggle

This specification details the implementation of a client-side theme provider and a toggle button in the NavBar to switch between Light and Dark modes.

## Problem Statement

The application already has CSS variables defined for both light and dark modes in `globals.css` (using the `.dark` class). However, there is no UI component allowing the user to toggle the theme, nor is there a provider/context to persist and apply the selected theme on page loads.

## Proposed Design

### 1. ThemeProvider (`src/shared/providers/ThemeProvider.tsx`)

We will create a custom React Context to manage the active theme.

**Behavior:**
- **State:** `theme` can be `'light'` or `'dark'`.
- **Initialization:**
  - On mount (`useEffect`), check if `localStorage` has a value for `theme`.
  - If not, check system preferences using `window.matchMedia('(prefers-color-scheme: dark)').matches`.
  - Set the state and add/remove the `.dark` class on the `<html>` element (`document.documentElement.classList`).
- **State Changes:**
  - Whenever the `theme` changes, update both `localStorage` and the `document.documentElement` class list.
- **Hook:** Expose a `useTheme()` hook for easy access.

### 2. Layout Wrapper (`src/app/layout.tsx`)

Wrap the child components in `RootLayout` with the `<ThemeProvider>` to make the theme context available globally.

```tsx
<ThemeProvider>
  <NavBar />
  <MockProvider>{children}</MockProvider>
</ThemeProvider>
```

### 3. NavBar Toggle Button (`src/shared/components/NavBar.tsx`)

Add a theme toggle button inside the right-hand container of the `NavBar` (next to the login/logout buttons).

**UX Details:**
- Use icons from `lucide-react`: `Sun` for dark mode (to toggle back to light) and `Moon` for light mode (to toggle to dark).
- To prevent Next.js hydration mismatch errors (since the theme is resolved purely on the client side), the toggle button should only render the icon after the component has mounted (`mounted` state is true). Before mount, render a skeleton/placeholder or empty space matching the button size.
- Utilize transition classes for smooth rotation and fading animations when toggling.

## Verification Plan

### Manual Verification
1. Open the application in light mode. Verify theme is set to light.
2. Click the theme toggle button in the NavBar. Verify the website transitions smoothly to dark mode (using the `.dark` colors defined in `globals.css`).
3. Reload the page. Verify the theme preference persists.
4. Test system preference detection by clearing local storage and changing OS color theme.
