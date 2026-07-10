import { render, screen } from "@testing-library/react"
import Header from "../components/Header"

describe("Header", () => {
  it("renders the logo", () => {
    render(<Header />)
    expect(screen.getByText("Exception")).toBeInTheDocument()
    expect(screen.getByText("Inbox")).toBeInTheDocument()
  })

  it("renders API Docs link", () => {
    render(<Header />)
    const link = screen.getByText("API Docs")
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "http://localhost:8000/docs")
  })
})
