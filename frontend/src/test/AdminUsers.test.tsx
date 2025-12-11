import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AdminUsers } from "../pages/AdminUsers";

jest.mock("../api", () => ({
  api: {
    get: jest.fn().mockResolvedValue([
      { id: "user1", username: "alice", roles: ["admin"] },
      { id: "user2", username: "bob", roles: ["member"] },
    ]),
    post: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock("../hooks/useCurrentUser", () => ({
  useCurrentUser: jest.fn().mockReturnValue({
    userId: "user1",
    username: "alice",
    roles: ["admin"],
    loading: false,
  }),
}));

jest.mock("../supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));

describe("AdminUsers", () => {
  it("renders user management page", async () => {
    render(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>,
    );
    expect(await screen.findByText(/User management/i)).toBeInTheDocument();
  });

  it("displays users list", async () => {
    render(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>,
    );
    expect(await screen.findByText(/bob/i)).toBeInTheDocument();
    expect(screen.queryByText(/alice/i)).not.toBeInTheDocument(); // Current user filtered out
  });

  it("shows loading state", () => {
    const { api } = require("../api");
    api.get.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    render(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
});

