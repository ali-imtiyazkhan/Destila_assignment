import { useState } from "react"
import Header from "./components/Header"
import Hero from "./components/Hero"
import ExceptionList from "./components/ExceptionList"
import CalendarSidebar from "./components/CalendarSidebar"
import SummaryCards from "./components/SummaryCards"
import Footer from "./components/Footer"
import Toast, { useToasts } from "./components/Toast"
import { useDarkMode } from "./hooks/useDarkMode"
import { useExceptions } from "./hooks/useExceptions"
import "./App.css"

function App() {
  const { dark, toggle } = useDarkMode()
  const { toasts, show } = useToasts()
  const [summaryKey, setSummaryKey] = useState(0)

  const hook = useExceptions()

  return (
    <div className="app">
      <Header dark={dark} onToggleDark={toggle} />
      <Hero refreshKey={summaryKey} />

      <main className="main-content">
        <div className="container inbox-layout">
          <CalendarSidebar
            dates={hook.dates}
            selectedDate={hook.filterDate}
            onSelectDate={(date) => hook.handleFilterChange("date", date)}
          />
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
              hook={hook}
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
