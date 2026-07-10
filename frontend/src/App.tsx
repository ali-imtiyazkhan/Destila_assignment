import Header from "./components/Header"
import ExceptionList from "./components/ExceptionList"
import "./App.css"

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="container">
          <h1 style={{ marginBottom: "0.5rem", fontSize: "var(--text-h3)" }}>
            Exception Inbox
          </h1>
          <p
            style={{
              marginBottom: "2rem",
              color: "var(--color-text-light)",
            }}
          >
            Plan-vs-actual deficit exceptions detected by the system.
          </p>
          <ExceptionList />
        </div>
      </main>
      <footer className="site-footer">
        <div className="container">
          Mini Exception Inbox &mdash; Intern Assignment
        </div>
      </footer>
    </div>
  )
}

export default App
