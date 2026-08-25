import { describe, it, expect, beforeEach } from "vitest";
import { hasRole, getRole, ROLES, can } from "./api";

describe("RBAC helpers", () => {
  beforeEach(() => localStorage.clear());

  it("getRole returns stored role", () => {
    localStorage.setItem("seis_user", JSON.stringify({ role: "citizen" }));
    expect(getRole()).toBe("citizen");
  });

  it("hasRole checks allowed roles", () => {
    localStorage.setItem("seis_user", JSON.stringify({ role: "returning_officer" }));
    expect(hasRole(...ROLES.CAN_CREATE_CANDIDATE)).toBe(true);
    expect(hasRole(...ROLES.CAN_VERIFY_RESULT)).toBe(true);
    expect(hasRole("presiding_officer")).toBe(false);
  });

  it("citizen cannot create election", () => {
    localStorage.setItem("seis_user", JSON.stringify({ role: "citizen" }));
    expect(hasRole(...ROLES.CAN_CREATE_ELECTION)).toBe(false);
    expect(can("CAN_CREATE_ELECTION")).toBe(false);
  });

  it("presiding_officer can submit but not verify", () => {
    localStorage.setItem("seis_user", JSON.stringify({ role: "presiding_officer" }));
    expect(can("CAN_SUBMIT_RESULT")).toBe(true);
    expect(can("CAN_VERIFY_RESULT")).toBe(false);
  });

  it("election_administrator can do everything", () => {
    localStorage.setItem("seis_user", JSON.stringify({ role: "election_administrator" }));
    expect(can("CAN_CREATE_ELECTION")).toBe(true);
    expect(can("CAN_CREATE_CANDIDATE")).toBe(true);
    expect(can("CAN_CREATE_STATION")).toBe(true);
    expect(can("CAN_SUBMIT_RESULT")).toBe(true);
    expect(can("CAN_VERIFY_RESULT")).toBe(true);
  });
});
