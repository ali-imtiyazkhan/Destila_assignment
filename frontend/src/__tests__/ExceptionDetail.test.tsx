import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ExceptionDetail from "../components/ExceptionDetail"
import type { ExceptionDetail as ExceptionDetailType } from "../types"

const mockDetail: ExceptionDetailType = {
  id: 1,
  product_code: "FG-001",
  plant: "PLANT-1",
  date: "2017-01-05",
  planned_units: 100,
  units_produced: 50,
  deficit_pct: 50,
  severity: "high",
  status: "open",
  trend: [
    { date: "2017-01-04", planned_units: 100, units_produced: 85 },
    { date: "2017-01-03", planned_units: 100, units_produced: 90 },
    { date: "2017-01-02", planned_units: 100, units_produced: 95 },
    { date: "2017-01-01", planned_units: 100, units_produced: 100 },
  ],
}

function mockFetch(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

describe("ExceptionDetail", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch(mockDetail))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("renders loading state initially", () => {
    vi.stubGlobal("fetch", () => new Promise(() => {}))
    render(
      <ExceptionDetail
        id={1}
        onClose={() => {}}
        onStatusChange={() => {}}
      />
    )
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("renders exception detail after fetch", async () => {
    render(
      <ExceptionDetail
        id={1}
        onClose={() => {}}
        onStatusChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("FG-001")).toBeInTheDocument()
    })
    expect(screen.getByText("2017-01-05")).toBeInTheDocument()
    expect(screen.getByText("50%")).toBeInTheDocument()
  })

  it("renders trend chart data", async () => {
    render(
      <ExceptionDetail
        id={1}
        onClose={() => {}}
        onStatusChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("7-Day Trend")).toBeInTheDocument()
    })
  })

  it("shows acknowledge and resolve buttons", async () => {
    render(
      <ExceptionDetail
        id={1}
        onClose={() => {}}
        onStatusChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Acknowledge")).toBeInTheDocument()
      expect(screen.getByText("Resolve")).toBeInTheDocument()
    })
  })

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn()
    render(
      <ExceptionDetail
        id={1}
        onClose={onClose}
        onStatusChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("✕")).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText("✕"))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("handles fetch error gracefully", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")))
    render(
      <ExceptionDetail
        id={1}
        onClose={() => {}}
        onStatusChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Could not load details")).toBeInTheDocument()
    })
  })

  it("calls onStatusChange after status update", async () => {
    vi.stubGlobal("fetch", mockFetch(mockDetail))
    const onStatusChange = vi.fn()

    render(
      <ExceptionDetail
        id={1}
        onClose={() => {}}
        onStatusChange={onStatusChange}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Acknowledge")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Acknowledge"))

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith(1, "acknowledged")
    })
  })
})
