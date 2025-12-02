# Project Standards & Best Practices

## 1. Folder Structure
- **`src/pages`**: Route components only. Each page should have its own folder if it has sub-components. (Renamed from `views`)
- **`src/components`**: Reusable UI components. Must be generic and not contain business logic.
- **`src/hooks`**: Custom React hooks. Naming convention: `useHookName.js`.
- **`src/utils`**: Pure functions. No React code (JSX) allowed here.
- **`src/services`**: API calls and external services.
- **`src/context`**: Global state providers.

## 2. Naming Conventions
- **Components**: PascalCase (e.g., `DashboardCard.js`).
- **Functions/Variables**: camelCase (e.g., `handleSubmit`, `userData`).
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`).
- **Files**: Match the primary export name.

## 3. Component Structure
Components should follow this order:
1. Imports (React -> 3rd Party -> Local)
2. Component Definition
3. Hooks & State
4. Helper Functions (inside component)
5. Return (JSX)
6. PropTypes / Exports

## 4. State Management
- Use **Local State** (`useState`) for UI state (modals, inputs).
- Use **Context** for global state (Theme, Auth).
- Avoid prop-drilling more than 2 levels; use Context or Composition instead.

## 5. Styling (MUI)
- Use the `sx` prop for one-off styles.
- Use `styled()` API for reusable styled components.
- Avoid inline `style={{ ... }}` objects for performance.
