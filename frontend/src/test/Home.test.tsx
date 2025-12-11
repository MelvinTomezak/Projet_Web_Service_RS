import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Home } from "../pages/Home";

jest.mock("../api", () => ({
  api: {
    get: jest.fn().mockRejectedValue(new Error("API down")),
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

describe("Home", () => {
  it("renders mock feed when API fails", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(await screen.findByText(/New JS framework/i)).toBeInTheDocument();
    expect(await screen.findByText(/Subreddits/i)).toBeInTheDocument();
  });
});

