import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { App } from "../App";

jest.mock("../api", () => ({
  api: {
    get: jest.fn().mockResolvedValue({ user: { roles: ["member"], username: "testuser" } }),
  },
}));

const mockSignIn = jest.fn().mockResolvedValue({ error: null });
const mockSignUp = jest.fn().mockResolvedValue({ data: { user: { user_metadata: { username: "testuser" } } }, error: null });
const mockSignOut = jest.fn().mockResolvedValue({ error: null });

jest.mock("../supabaseClient", () => {
  const mockSignIn = jest.fn().mockResolvedValue({ error: null });
  const mockSignUp = jest.fn().mockResolvedValue({ data: { user: { user_metadata: { username: "testuser" } } }, error: null });
  const mockSignOut = jest.fn().mockResolvedValue({ error: null });
  return {
    supabase: {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
        signInWithPassword: mockSignIn,
        signUp: mockSignUp,
        signOut: mockSignOut,
      },
    },
  };
});

describe("App (Auth)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form by default", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Reddit-like Auth/i)).toBeInTheDocument();
    // There are two "Sign in" buttons: tab and submit button
    // Check that both exist
    const buttons = screen.getAllByRole("button", { name: /Sign in/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    // Verify the submit button (auth-button) is present
    const submitButton = buttons.find((btn) => btn.className.includes("auth-button"));
    expect(submitButton).toBeInTheDocument();
  });

  it("switches to signup mode", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    const signupTab = screen.getByRole("button", { name: /Sign up/i });
    await user.click(signupTab);
    expect(screen.getByRole("button", { name: /Create account/i })).toBeInTheDocument();
  });

  it("displays email and password inputs", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });
});

