# Jest tests overview

## Stack
- Jest + ts-jest + babel-jest (jsdom)
- @testing-library/react / jest-dom / user-event
- Polyfill TextEncoder/TextDecoder in `src/setupTests.ts`
- CSS mocked via `src/test/__mocks__/styleMock.ts`
- Supabase client mocked in tests to avoid real auth calls

## Tests

### `src/test/Home.test.tsx`
- Mock `api.get` to throw → triggers fallback mock data.
- Render `<Home />` in a MemoryRouter.
- Assertions: mock post title (“New JS framework”) and “Subreddits” are present.

### `src/test/Subreddit.test.tsx`
- Mock `api` + Supabase.
- Render `<Subreddit />` at route `/r/tech` with MemoryRouter/Routes.
- Assertions: mock post title is present, score is displayed (fallback data).

### `src/test/PostDetail.test.tsx`
- Mock `api` + Supabase.
- Render `<PostDetail />` at route `/posts/p1`.
- Assertions: mock post title present; ensures another post title (“Global event”) is absent; comments and form are rendered.

## Commands
- `npm test` (from `frontend/`).

## Files touched
- `frontend/package.json` (Jest deps + script)
- Configs: `babel.config.cjs`, `jest.config.ts`, `src/setupTests.ts`, `src/test/__mocks__/styleMock.ts`
- Tests: `src/test/{Home,Subreddit,PostDetail}.test.tsx`

