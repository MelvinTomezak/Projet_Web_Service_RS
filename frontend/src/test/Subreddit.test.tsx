import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Subreddit } from "../pages/Subreddit";

jest.mock("../api", () => ({
  api: {
    get: jest.fn().mockRejectedValue(new Error("API down")),
    delete: jest.fn(),
    post: jest.fn(),
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

describe("Subreddit page", () => {
  it("renders mock posts when API fails", async () => {
    render(
      <MemoryRouter initialEntries={["/r/tech"]}>
        <Routes>
          <Route path="/r/:slug" element={<Subreddit />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/New JS framework/i)).toBeInTheDocument();
    expect(await screen.findByText(/Score:/i)).toBeInTheDocument();
  });
});

