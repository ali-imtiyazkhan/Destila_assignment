import Header from "./components/Header"
import ExceptionList from "./components/ExceptionList"
import SummaryCards from "./components/SummaryCards"
import Toast, { useToasts } from "./components/Toast"
import { useDarkMode } from "./hooks/useDarkMode"
import "./App.css"

function App() {
  const { dark, toggle } = useDarkMode()
  const { toasts, show } = useToasts()

  return (
    <div className="app">
      <Header dark={dark} onToggleDark={toggle} />
      <main className="main-content">
        <div className="container">
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "0.5rem" }}>
            <h1 style={{ fontSize: "var(--text-h3)" }}>
              Exception Inbox
            </h1>
          </div>
          <p style={{ marginBottom: "1.5rem", color: "var(--color-text-light)" }}>
            Plan-vs-actual deficit exceptions detected by the system.
          </p>
          <SummaryCards />
          <div style={{ marginTop: "1.5rem" }}>
            <ExceptionList onToast={show} />
          </div>
        </div>
      </main>
      <footer className="site-footer">
        <div className="container">
          Mini Exception Inbox &mdash; Intern Assignment
        </div>
      </footer>
      <Toast toasts={toasts} />
    </div>
  )
}

export default App
