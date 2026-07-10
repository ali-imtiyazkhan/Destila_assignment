import { useState } from "react"

export interface ToastMessage {
  id: number
  text: string
  type: "success" | "error"
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const show = (text: string, type: "success" | "error" = "success") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  return { toasts, show }
}

export default function Toast({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.text}
        </div>
      ))}
    </div>
  )
}
