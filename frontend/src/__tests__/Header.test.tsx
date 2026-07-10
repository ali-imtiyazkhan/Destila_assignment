import { render, screen } from "@testing-library/react"
import Header from "../components/Header"

describe("Header", () => {
  it("renders the logo", () => {
    render(<Header dark={false} onToggleDark={() => {}} />)
    expect(screen.getByText("Exception")).toBeInTheDocument()
    expect(screen.getByText("Inbox")).toBeInTheDocument()
  })

  it("renders API Docs link", () => {
    render(<Header dark={false} onToggleDark={() => {}} />)
    const link = screen.getByText("API Docs")
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/docs")
  })
})
