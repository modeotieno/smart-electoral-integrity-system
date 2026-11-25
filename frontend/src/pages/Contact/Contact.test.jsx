import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { sendContactMessage } from "../../api/api";
import ContactPage from "./Contact";

vi.mock("../../api/api", () => ({
  sendContactMessage: vi.fn(),
}));

describe("ContactPage", () => {
  afterEach(() => vi.clearAllMocks());

  const fillForm = () => {
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: "Ada Otieno" } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: "Question about SEIS" } });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "Hello, I would like to learn more about the platform." },
    });
  };

  it("submits the contact form and shows success", async () => {
    sendContactMessage.mockResolvedValue({ message: "sent" });
    render(<ContactPage />);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/message has been received/i)).toBeInTheDocument();
    expect(sendContactMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Ada Otieno",
        email: "ada@example.com",
        subject: "Question about SEIS",
      })
    );
    expect(screen.getByLabelText(/your name/i).value).toBe("");
  });

  it("shows the server error when delivery fails", async () => {
    sendContactMessage.mockRejectedValue(new Error("Contact form is not configured yet."));
    render(<ContactPage />);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Contact form is not configured yet.");
    });
  });
});
