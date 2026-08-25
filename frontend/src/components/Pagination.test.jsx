import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "./Pagination";

describe("Pagination", () => {
  it("renders nothing when totalPages 0", () => {
    const { container } = render(<Pagination page={1} limit={10} total={0} totalPages={0} onPageChange={()=>{}} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows page info and calls onPageChange", () => {
    const onPage = vi.fn();
    render(<Pagination page={2} limit={10} total={25} totalPages={3} onPageChange={onPage} />);
    expect(screen.getByText(/Page/)).toBeInTheDocument();
    // Next button
    const nextBtn = screen.getByText("Next");
    fireEvent.click(nextBtn);
    expect(onPage).toHaveBeenCalledWith(3);

    const prevBtn = screen.getByText("Prev");
    fireEvent.click(prevBtn);
    expect(onPage).toHaveBeenCalledWith(1);
  });

  it("disables prev on first page", () => {
    render(<Pagination page={1} limit={10} total={20} totalPages={2} onPageChange={()=>{}} />);
    const prev = screen.getByText("Prev");
    expect(prev).toBeDisabled();
  });

  it("renders limit selector and triggers onLimitChange", () => {
    const onLimit = vi.fn();
    render(<Pagination page={1} limit={10} total={30} totalPages={3} onPageChange={()=>{}} onLimitChange={onLimit} />);
    const sel = screen.getByDisplayValue("10");
    fireEvent.change(sel, { target: { value: "20" } });
    expect(onLimit).toHaveBeenCalledWith(20);
  });
});
