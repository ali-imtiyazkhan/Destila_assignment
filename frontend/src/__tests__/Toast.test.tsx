import { render, screen, act, renderHook } from "@testing-library/react"
import Toast, { useToasts } from "../components/Toast"

describe("Toast", () => {
  it("renders success toast", () => {
    render(
      <Toast
        toasts={[{ id: 1, text: "Exception resolved", type: "success" }]}
      />
    )
    expect(screen.getByText("Exception resolved")).toBeInTheDocument()
    expect(screen.getByText("Exception resolved")).toHaveClass("toast-success")
  })

  it("renders error toast", () => {
    render(
      <Toast
        toasts={[{ id: 2, text: "Failed to update", type: "error" }]}
      />
    )
    expect(screen.getByText("Failed to update")).toBeInTheDocument()
    expect(screen.getByText("Failed to update")).toHaveClass("toast-error")
  })

  it("renders multiple toasts", () => {
    render(
      <Toast
        toasts={[
          { id: 1, text: "First", type: "success" },
          { id: 2, text: "Second", type: "error" },
        ]}
      />
    )
    expect(screen.getByText("First")).toBeInTheDocument()
    expect(screen.getByText("Second")).toBeInTheDocument()
  })

  it("renders nothing when empty", () => {
    const { container } = render(<Toast toasts={[]} />)
    expect(container.querySelector(".toast-container")).toBeInTheDocument()
    expect(container.querySelector(".toast")).not.toBeInTheDocument()
  })
})

describe("useToasts", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("show adds a toast", () => {
    const { result } = renderHook(() => useToasts())
    act(() => { result.current.show("Test toast", "success") })
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].text).toBe("Test toast")
  })

  it("auto-removes toast after 3 seconds", () => {
    const { result } = renderHook(() => useToasts())
    act(() => { result.current.show("Auto dismiss", "error") })
    expect(result.current.toasts).toHaveLength(1)

    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current.toasts).toHaveLength(0)
  })
})
