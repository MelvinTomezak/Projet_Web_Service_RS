# Tests Documentation

This directory contains all Jest tests for the Reddit-like frontend application. The tests use React Testing Library for component testing and Jest for the test runner.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Setup](#test-setup)
- [Test Files](#test-files)
  - [Home.test.tsx](#hometesttsx)
  - [Subreddit.test.tsx](#subreddittesttsx)
  - [PostDetail.test.tsx](#postdetailtesttsx)
  - [CreatePost.test.tsx](#createposttesttsx)
  - [CreateSubreddit.test.tsx](#createsubreddittesttsx)
  - [AdminUsers.test.tsx](#adminuserstesttsx)
  - [App.test.tsx](#apptesttsx)
- [Mocking Strategy](#mocking-strategy)
- [Running Tests](#running-tests)
- [Best Practices](#best-practices)

## 🎯 Overview

All tests follow a consistent pattern:
- **Mock external dependencies** (API, Supabase, React Router)
- **Render components** in isolation using `MemoryRouter`
- **Assert UI elements** using React Testing Library queries
- **Test user interactions** with `@testing-library/user-event`

## ⚙️ Test Setup

### Configuration Files

- **`jest.config.ts`**: Jest configuration with TypeScript support
- **`setupTests.ts`**: Global test setup with polyfills and test library imports
- **`__mocks__/styleMock.ts`**: Mock for CSS imports

### Dependencies

- `jest`: Test runner
- `@testing-library/react`: React component testing utilities
- `@testing-library/jest-dom`: Custom Jest matchers for DOM assertions
- `@testing-library/user-event`: User interaction simulation
- `ts-jest`: TypeScript support for Jest

## 📁 Test Files

### Home.test.tsx

**Purpose**: Tests the home page component that displays the global feed.

**What it tests**:
- ✅ Renders mock feed when API fails
- ✅ Displays fallback content from mock data

**Mocks**:
- `api.get`: Rejected promise (simulates API failure)
- `supabase.auth`: Mocked session management

**Test Cases**:
1. **"renders mock feed when API fails"**
   - Verifies that when the API fails, the component falls back to mock data
   - Checks for presence of "New JS framework" post
   - Checks for "Subreddits" section

**Key Assertions**:
```typescript
expect(await screen.findByText(/New JS framework/i)).toBeInTheDocument();
expect(await screen.findByText(/Subreddits/i)).toBeInTheDocument();
```

---

### Subreddit.test.tsx

**Purpose**: Tests the subreddit page component that displays posts for a specific subreddit.

**What it tests**:
- ✅ Renders mock posts when API fails
- ✅ Displays score information

**Mocks**:
- `api.get`: Rejected promise (simulates API failure)
- `api.delete`: Mocked delete function
- `api.post`: Mocked post function
- `supabase.auth`: Mocked session management
- React Router: `MemoryRouter` with route `/r/:slug`

**Test Cases**:
1. **"renders mock posts when API fails"**
   - Verifies fallback to mock data when API fails
   - Checks for post content ("New JS framework")
   - Checks for score display ("Score:")

**Key Assertions**:
```typescript
expect(await screen.findByText(/New JS framework/i)).toBeInTheDocument();
expect(await screen.findByText(/Score:/i)).toBeInTheDocument();
```

---

### PostDetail.test.tsx

**Purpose**: Tests the post detail page component that displays a single post and its comments.

**What it tests**:
- ✅ Renders mock post when API fails
- ✅ Verifies correct post is displayed (not other posts)

**Mocks**:
- `api.get`: Rejected promise (simulates API failure)
- `api.delete`: Mocked delete function
- `api.post`: Mocked post function
- `supabase.auth`: Mocked session management
- React Router: `MemoryRouter` with route `/posts/:id`

**Test Cases**:
1. **"renders mock post when API fails"**
   - Verifies fallback to mock data
   - Checks for correct post title ("New JS framework")
   - Verifies other posts are not displayed

**Key Assertions**:
```typescript
expect(await screen.findByText(/New JS framework/i)).toBeInTheDocument();
expect(screen.queryByText(/Global event/i)).not.toBeInTheDocument();
```

---

### CreatePost.test.tsx

**Purpose**: Tests the create post page component.

**What it tests**:
- ✅ Renders form with subreddit selection
- ✅ Displays loading state while fetching subreddits
- ✅ Shows message when no subreddits are available

**Mocks**:
- `api.get`: Returns mock subreddits list
- `api.post`: Mocked post creation
- `supabase.auth`: Mocked session management
- `react-router-dom.useNavigate`: Mocked navigation

**Test Cases**:
1. **"renders the form with subreddit selection"**
   - Verifies form title is displayed
   - Checks for title input field
   - Checks for content textarea

2. **"displays loading state while fetching subreddits"**
   - Verifies loading message appears immediately

3. **"shows message when no subreddits available"**
   - Mocks empty subreddits array
   - Verifies appropriate message is shown

**Key Assertions**:
```typescript
expect(await screen.findByText(/Create a post/i)).toBeInTheDocument();
expect(await screen.findByLabelText(/Post title/i)).toBeInTheDocument();
expect(screen.getByText(/Loading subreddits/i)).toBeInTheDocument();
expect(await screen.findByText(/No subreddit available/i)).toBeInTheDocument();
```

**Note**: This test may show React `act()` warnings. These are non-blocking warnings about async state updates and don't affect test results.

---

### CreateSubreddit.test.tsx

**Purpose**: Tests the create subreddit page component.

**What it tests**:
- ✅ Renders the form correctly
- ✅ Disables submit button when name is empty
- ✅ Enables submit button when name is provided

**Mocks**:
- `api.post`: Mocked subreddit creation
- `supabase.auth`: Mocked session management
- `react-router-dom.useNavigate`: Mocked navigation
- `@testing-library/user-event`: User interaction simulation

**Test Cases**:
1. **"renders the form"**
   - Verifies form title
   - Checks for name input
   - Checks for description textarea

2. **"disables submit button when name is empty"**
   - Verifies button is disabled initially

3. **"enables submit button when name is provided"**
   - Simulates user typing in name field
   - Verifies button becomes enabled

**Key Assertions**:
```typescript
expect(screen.getByText(/Create a subreddit/i)).toBeInTheDocument();
expect(screen.getByLabelText(/Name \(slug\)/i)).toBeInTheDocument();
expect(submitButton).toBeDisabled();
expect(submitButton).not.toBeDisabled();
```

---

### AdminUsers.test.tsx

**Purpose**: Tests the admin users management page component.

**What it tests**:
- ✅ Renders user management page
- ✅ Displays users list (excluding current user)
- ✅ Shows loading state

**Mocks**:
- `api.get`: Returns mock users list
- `api.post`: Mocked role update
- `useCurrentUser`: Mocked current user hook
- `supabase.auth`: Mocked session management

**Test Cases**:
1. **"renders user management page"**
   - Verifies page title is displayed

2. **"displays users list"**
   - Verifies other users are displayed
   - Verifies current user is filtered out

3. **"shows loading state"**
   - Mocks a promise that never resolves
   - Verifies loading message appears

**Key Assertions**:
```typescript
expect(await screen.findByText(/User management/i)).toBeInTheDocument();
expect(await screen.findByText(/bob/i)).toBeInTheDocument();
expect(screen.queryByText(/alice/i)).not.toBeInTheDocument();
expect(screen.getByText(/Loading/i)).toBeInTheDocument();
```

---

### App.test.tsx

**Purpose**: Tests the authentication component (login/signup page).

**What it tests**:
- ✅ Renders login form by default
- ✅ Switches to signup mode
- ✅ Displays email and password inputs

**Mocks**:
- `api.get`: Mocked user info endpoint
- `supabase.auth.signInWithPassword`: Mocked login
- `supabase.auth.signUp`: Mocked signup
- `supabase.auth.signOut`: Mocked logout
- `supabase.auth.getSession`: Mocked session retrieval
- `supabase.auth.onAuthStateChange`: Mocked auth state listener

**Test Cases**:
1. **"renders login form by default"**
   - Verifies page title
   - Checks for "Sign in" buttons (tab and submit button)
   - Verifies submit button has correct class

2. **"switches to signup mode"**
   - Simulates clicking signup tab
   - Verifies button text changes to "Create account"

3. **"displays email and password inputs"**
   - Verifies form inputs are present

**Key Assertions**:
```typescript
expect(screen.getByText(/Reddit-like Auth/i)).toBeInTheDocument();
const buttons = screen.getAllByRole("button", { name: /Sign in/i });
const submitButton = buttons.find((btn) => btn.className.includes("auth-button"));
expect(screen.getByRole("button", { name: /Create account/i })).toBeInTheDocument();
expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
```

**Note**: This test handles multiple buttons with the same text by finding the submit button by its class name.

---

## 🎭 Mocking Strategy

### Common Mocks

All tests mock the following dependencies:

1. **API Client** (`../api`)
   - Mocks `api.get`, `api.post`, `api.delete`
   - Returns mock data or rejects to simulate failures

2. **Supabase Client** (`../supabaseClient`)
   - Mocks `supabase.auth.getSession`
   - Mocks `supabase.auth.onAuthStateChange`
   - Returns null session by default

3. **React Router** (`react-router-dom`)
   - Uses `MemoryRouter` for isolated routing
   - Mocks `useNavigate` when needed

### Mock Patterns

```typescript
// API mock pattern
jest.mock("../api", () => ({
  api: {
    get: jest.fn().mockResolvedValue([...]),
    post: jest.fn().mockResolvedValue({ id: "..." }),
    delete: jest.fn(),
  },
}));

// Supabase mock pattern
jest.mock("../supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      })),
    },
  },
}));
```

## 🚀 Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run a specific test file
```bash
npm test -- Home.test.tsx
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="renders"
```

## 📝 Best Practices

### 1. Use Semantic Queries
Prefer queries that reflect how users interact with the UI:
- `getByRole` for buttons, links, headings
- `getByLabelText` for form inputs
- `getByText` for visible text content

### 2. Use Async Queries
Use `findBy*` or `waitFor` for async operations:
```typescript
expect(await screen.findByText(/Loading/i)).toBeInTheDocument();
```

### 3. Test User Interactions
Use `@testing-library/user-event` for realistic interactions:
```typescript
const user = userEvent.setup();
await user.type(input, "text");
await user.click(button);
```

### 4. Isolate Components
Use `MemoryRouter` to test components in isolation without full app routing.

### 5. Mock External Dependencies
Always mock:
- API calls
- Authentication
- Navigation
- External services

### 6. Test Behavior, Not Implementation
Focus on what users see and do, not internal component state.

## 🐛 Troubleshooting

### Tests failing with "act()" warnings
These are React warnings about async state updates. They don't break tests but can be fixed by:
- Using `waitFor` for async assertions
- Wrapping state updates in `act()`

### Tests timing out
- Increase timeout: `jest.setTimeout(10000)`
- Check for infinite loops in mocks
- Verify async operations complete

### Mocks not working
- Ensure mocks are defined before imports
- Check mock function names match actual exports
- Verify mock return values match expected types

## 📊 Test Coverage

Current test coverage includes:
- ✅ All main page components
- ✅ Form rendering and validation
- ✅ Loading states
- ✅ Error handling (fallback to mock data)
- ✅ User interactions (clicking, typing)
- ✅ Authentication UI

**Areas for future expansion**:
- Integration tests for full user flows
- API error handling tests
- Form submission tests
- Navigation tests
- Role-based UI visibility tests

