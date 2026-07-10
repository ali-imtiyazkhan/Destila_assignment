interface Props {
  dark: boolean
  onToggleDark: () => void
}

export default function Header({ dark, onToggleDark }: Props) {
  return (
    <header className="site-header">
      <div className="container">
        <a href="#" className="logo">
          Exception<span>Inbox</span>
        </a>

        <nav className="header-nav">
          <a href="#inbox">Inbox</a>
          <a href="/docs" target="_blank" rel="noopener noreferrer">API</a>
        </nav>

        <div className="header-actions">
          <button className="theme-toggle" onClick={onToggleDark} title="Toggle theme">
            {dark ? "☀️" : "🌙"}
          </button>
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            API Docs
          </a>
        </div>
      </div>
    </header>
  )
}
