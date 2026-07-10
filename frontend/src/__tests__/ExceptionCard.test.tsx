import { render, screen, fireEvent } from "@testing-library/react"
import ExceptionCard from "../components/ExceptionCard"
import type { ExceptionItem } from "../types"

const mockException: ExceptionItem = {
  id: 1,
  product_code: "FG-001",
  plant: "PLANT-1",
  date: "2017-01-05",
  planned_units: 100,
  units_produced: 50,
  deficit_pct: 50,
  severity: "high",
  status: "open",
}

describe("ExceptionCard", () => {
  it("renders product code", () => {
    render(
      <ExceptionCard
        exception={mockException}
        detailSelected={false}
        onClick={() => {}}
      />
    )
    expect(screen.getByText("FG-001")).toBeInTheDocument()
  })

  it("renders deficit percentage", () => {
    render(
      <ExceptionCard
        exception={mockException}
        detailSelected={false}
        onClick={() => {}}
      />
    )
    expect(screen.getByText("50%")).toBeInTheDocument()
  })

  it("renders severity badge", () => {
    render(
      <ExceptionCard
        exception={mockException}
        detailSelected={false}
        onClick={() => {}}
      />
    )
    expect(screen.getByText("high")).toBeInTheDocument()
  })

  it("renders status badge", () => {
    render(
      <ExceptionCard
        exception={mockException}
        detailSelected={false}
        onClick={() => {}}
      />
    )
    expect(screen.getByText("open")).toBeInTheDocument()
  })

  it("calls onClick when clicked", () => {
    const onClick = vi.fn()
    render(
      <ExceptionCard
        exception={mockException}
        detailSelected={false}
        onClick={onClick}
      />
    )
    fireEvent.click(screen.getByText("FG-001"))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("applies selected class when detailSelected", () => {
    const { container } = render(
      <ExceptionCard
        exception={mockException}
        detailSelected={true}
        onClick={() => {}}
      />
    )
    expect(container.firstChild).toHaveClass("selected")
  })

  it("checkbox reflects checked prop independently of detailSelected", () => {
    render(
      <ExceptionCard
        exception={mockException}
        detailSelected={false}
        checked={true}
        showCheckbox
        onToggleSelect={() => {}}
        onClick={() => {}}
      />
    )
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })
})
