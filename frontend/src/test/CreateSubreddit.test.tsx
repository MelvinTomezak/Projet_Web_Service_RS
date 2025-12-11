import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { CreateSubreddit } from "../pages/CreateSubreddit";

jest.mock("../api", () => ({
  api: {
    post: jest.fn().mockResolvedValue({ id: "sub1", name: "tech" }),
  },
}));

jest.mock("../supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("CreateSubreddit", () => {
  it("renders the form", () => {
    render(
      <MemoryRouter>
        <CreateSubreddit />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Create a subreddit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name \(slug\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it("disables submit button when name is empty", () => {
    render(
      <MemoryRouter>
        <CreateSubreddit />
      </MemoryRouter>,
    );
    const submitButton = screen.getByRole("button", { name: /Create/i });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when name is provided", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CreateSubreddit />
      </MemoryRouter>,
    );
    const nameInput = screen.getByLabelText(/Name \(slug\)/i);
    await user.type(nameInput, "tech");
    const submitButton = screen.getByRole("button", { name: /Create/i });
    expect(submitButton).not.toBeDisabled();
  });
});

