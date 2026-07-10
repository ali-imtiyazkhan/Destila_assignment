import { render, screen } from "@testing-library/react"
import SeverityBadge from "../components/SeverityBadge"

describe("SeverityBadge", () => {
  it("renders high severity badge", () => {
    render(<SeverityBadge severity="high" />)
    const badge = screen.getByText("high")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("high")
  })

  it("renders medium severity badge", () => {
    render(<SeverityBadge severity="medium" />)
    const badge = screen.getByText("medium")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("medium")
  })
})
