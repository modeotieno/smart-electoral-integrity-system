import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchElections, fetchCandidates, fetchStations, fetchUsers } from "./api";

describe("paginated api helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it("fetchElections builds pagination QS and returns envelope when paginated", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ elections: [{ id: 1 }], data: [{ id: 1 }], pagination: { page: 1, limit: 10, total: 1, total_pages: 1 } }),
    });
    const data = await fetchElections({ page: 1, limit: 10, search: "test" });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("page=1"));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("search=test"));
    expect(data.pagination).toBeDefined();
  });

  it("fetchElections returns array when no pagination opts", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ elections: [{ id: 1, name: "A" }] }),
    });
    const data = await fetchElections();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].name).toBe("A");
  });

  it("fetchUsers sends auth header", async () => {
    localStorage.setItem("seis_token", "tok123");
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 0 } }),
    });
    await fetchUsers({ page: 1, limit: 5 });
    const headers = global.fetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe("Bearer tok123");
  });

  it("throws on error response", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "failed" }),
    });
    await expect(fetchCandidates()).rejects.toThrow("failed");
  });
});
