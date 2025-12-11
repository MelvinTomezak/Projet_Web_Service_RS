import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { CreatePost } from "../pages/CreatePost";

jest.mock("../api", () => ({
  api: {
    get: jest.fn().mockResolvedValue([
      { id: "sub1", name: "tech", description: "Technology" },
      { id: "sub2", name: "gaming", description: "Gaming" },
    ]),
    post: jest.fn().mockResolvedValue({ id: "post1" }),
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

describe("CreatePost", () => {
  it("renders the form with subreddit selection", async () => {
    render(
      <MemoryRouter>
        <CreatePost />
      </MemoryRouter>,
    );
    expect(await screen.findByText(/Create a post/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/Post title/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/Content/i)).toBeInTheDocument();
  });

  it("displays loading state while fetching subreddits", () => {
    render(
      <MemoryRouter>
        <CreatePost />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Loading subreddits/i)).toBeInTheDocument();
  });

  it("shows message when no subreddits available", async () => {
    const { api } = require("../api");
    api.get.mockResolvedValueOnce([]);
    render(
      <MemoryRouter>
        <CreatePost />
      </MemoryRouter>,
    );
    expect(await screen.findByText(/No subreddit available/i)).toBeInTheDocument();
  });
});

