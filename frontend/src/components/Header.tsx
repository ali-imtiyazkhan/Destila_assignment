export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="logo">
          Exception<span>Inbox</span>
        </div>
        <div className="header-actions">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            className="btn btn-outline btn-sm"
          >
            API Docs
          </a>
        </div>
      </div>
    </header>
  )
}
