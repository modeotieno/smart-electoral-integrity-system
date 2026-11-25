import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InstallPWA from "./InstallPWA";

describe("InstallPWA", () => {
  it("shows an install button on first visit", () => {
    render(<InstallPWA />);
    expect(screen.getByRole("button", { name: "Install" })).toBeInTheDocument();
  });

  it("gives install guidance when the browser has no install prompt", () => {
    render(<InstallPWA />);
    fireEvent.click(screen.getByRole("button", { name: "Install" }));
    expect(screen.getByText("Install instructions")).toBeInTheDocument();
    expect(screen.getByText(/Add to Home Screen/)).toBeInTheDocument();
  });

  it("uses the browser install prompt when available", async () => {
    const prompt = vi.fn();
    const userChoice = Promise.resolve({ outcome: "accepted" });
    render(<InstallPWA />);
    const event = new Event("beforeinstallprompt");
    Object.defineProperty(event, "prompt", { value: prompt });
    Object.defineProperty(event, "userChoice", { value: userChoice });
    fireEvent(window, event);
    fireEvent.click(screen.getByRole("button", { name: "Install" }));
    expect(prompt).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Install" })).not.toBeInTheDocument();
    });
  });

  it("can be dismissed", () => {
    render(<InstallPWA />);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss install prompt" }));
    expect(screen.queryByRole("button", { name: "Install" })).not.toBeInTheDocument();
  });

  it("stays hidden when already installed", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    render(<InstallPWA />);
    expect(screen.queryByRole("button", { name: "Install" })).not.toBeInTheDocument();
    delete window.matchMedia;
  });
});
