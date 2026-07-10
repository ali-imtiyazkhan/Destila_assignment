interface Props {
  severity: "high" | "medium"
}

export default function SeverityBadge({ severity }: Props) {
  return <span className={`severity-badge ${severity}`}>{severity}</span>
}
