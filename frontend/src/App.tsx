import { useState } from "react"
import Header from "./components/Header"
import Hero from "./components/Hero"
import ExceptionList from "./components/ExceptionList"
import SummaryCards from "./components/SummaryCards"
import Footer from "./components/Footer"
import Toast, { useToasts } from "./components/Toast"
import { useDarkMode } from "./hooks/useDarkMode"
import "./App.css"

function App() {
  const { dark, toggle } = useDarkMode()
  const { toasts, show } = useToasts()
  const [summaryKey, setSummaryKey] = useState(0)

  return (
    <div className="app">
      <Header dark={dark} onToggleDark={toggle} />
      <Hero refreshKey={summaryKey} />

      <main className="main-content">
        <div className="container">
          <section id="inbox" className="inbox-section">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">Operations</span>
                <h2 className="section-title">Exception Inbox</h2>
                <p className="section-desc">
                  Exceptions grouped by day — newest first, worst deficit first within each day.
                </p>
              </div>
            </div>

            <SummaryCards refreshKey={summaryKey} />
            <ExceptionList
              onToast={show}
              onDataChange={() => setSummaryKey((k) => k + 1)}
            />
          </section>
        </div>
      </main>

      <Footer />
      <Toast toasts={toasts} />
    </div>
  )
}

export default App
