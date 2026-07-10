interface Props {
  dark: boolean
  onToggleDark: () => void
}

export default function Header({ dark, onToggleDark }: Props) {
  return (
    <header className="site-header">
      <div className="container">
        <div className="logo">
          Exception<span>Inbox</span>
        </div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={onToggleDark} title="Toggle theme">
            {dark ? "☀️" : "🌙"}
          </button>
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
