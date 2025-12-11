import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PostDetail } from "../pages/PostDetail";

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

describe("PostDetail page", () => {
  it("renders mock post when API fails", async () => {
    render(
      <MemoryRouter initialEntries={["/posts/p1"]}>
        <Routes>
          <Route path="/posts/:id" element={<PostDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/New JS framework/i)).toBeInTheDocument();
    expect(screen.queryByText(/Global event/i)).not.toBeInTheDocument();
  });
});

