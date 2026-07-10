import { render, screen, fireEvent } from "@testing-library/react"
import ExceptionDayGroup from "../components/ExceptionDayGroup"
import type { ExceptionItem } from "../types"

const exceptions: ExceptionItem[] = [
  {
    id: 1,
    product_code: "FG-001",
    plant: "PLANT-1",
    date: "2017-01-05",
    planned_units: 100,
    units_produced: 50,
    deficit_pct: 50,
    severity: "high",
    status: "open",
  },
  {
    id: 2,
    product_code: "FG-002",
    plant: "PLANT-1",
    date: "2017-01-05",
    planned_units: 200,
    units_produced: 190,
    deficit_pct: 5,
    severity: "medium",
    status: "open",
  },
]

describe("ExceptionDayGroup", () => {
  it("renders the formatted date", () => {
    render(
      <ExceptionDayGroup
        date="2017-01-05"
        exceptions={exceptions}
        selectedIds={new Set()}
        onToggleSelect={() => {}}
        selectedId={null}
        onSelect={() => {}}
      />
    )
    expect(screen.getByText("Thursday, January 5, 2017")).toBeInTheDocument()
  })

  it("shows exception count", () => {
    render(
      <ExceptionDayGroup
        date="2017-01-05"
        exceptions={exceptions}
        selectedIds={new Set()}
        onToggleSelect={() => {}}
        selectedId={null}
        onSelect={() => {}}
      />
    )
    expect(screen.getByText("2 exceptions")).toBeInTheDocument()
  })

  it("shows 1 exception singular", () => {
    render(
      <ExceptionDayGroup
        date="2017-01-05"
        exceptions={[exceptions[0]]}
        selectedIds={new Set()}
        onToggleSelect={() => {}}
        selectedId={null}
        onSelect={() => {}}
      />
    )
    expect(screen.getByText("1 exception")).toBeInTheDocument()
  })

  it("toggles body on header click", () => {
    render(
      <ExceptionDayGroup
        date="2017-01-05"
        exceptions={exceptions}
        selectedIds={new Set()}
        onToggleSelect={() => {}}
        selectedId={null}
        onSelect={() => {}}
      />
    )
    expect(screen.getByText("FG-001")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Thursday, January 5, 2017"))
    expect(screen.queryByText("FG-001")).not.toBeInTheDocument()
  })
})
