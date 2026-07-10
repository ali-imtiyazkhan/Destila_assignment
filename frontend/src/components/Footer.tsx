export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              Exception<span>Inbox</span>
            </div>
            <p className="footer-tagline">
              A miniature exception management system for manufacturing
              planners — ingest, detect, act.
            </p>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#inbox">Exception Inbox</a></li>
              <li><a href="#inbox">Day Timeline</a></li>
              <li><a href="#inbox">Batch Actions</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li>
                <a href="/docs" target="_blank" rel="noopener noreferrer">
                  API Docs
                </a>
              </li>
              <li>
                <a href="/openapi.json" target="_blank" rel="noopener noreferrer">
                  OpenAPI Spec
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Built With</h4>
            <ul className="footer-tech">
              <li>FastAPI</li>
              <li>React + TypeScript</li>
              <li>SQLite</li>
              <li>Recharts</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} Mini Exception Inbox. Intern Assignment Project.</p>
          <p className="footer-meta">Data derived from Kaggle Store Item Demand Forecasting</p>
        </div>
      </div>
    </footer>
  )
}
