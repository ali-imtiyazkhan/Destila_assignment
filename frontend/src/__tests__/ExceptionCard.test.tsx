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
        selected={false}
        onClick={() => {}}
      />
    )
    expect(screen.getByText("FG-001")).toBeInTheDocument()
  })

  it("renders deficit percentage", () => {
    render(
      <ExceptionCard
        exception={mockException}
        selected={false}
        onClick={() => {}}
      />
    )
    expect(screen.getByText("50%")).toBeInTheDocument()
  })

  it("renders severity badge", () => {
    render(
      <ExceptionCard
        exception={mockException}
        selected={false}
        onClick={() => {}}
      />
    )
    expect(screen.getByText("high")).toBeInTheDocument()
  })

  it("renders status badge", () => {
    render(
      <ExceptionCard
        exception={mockException}
        selected={false}
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
        selected={false}
        onClick={onClick}
      />
    )
    fireEvent.click(screen.getByText("FG-001"))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("applies selected class when selected", () => {
    const { container } = render(
      <ExceptionCard
        exception={mockException}
        selected={true}
        onClick={() => {}}
      />
    )
    expect(container.firstChild).toHaveClass("selected")
  })
})
