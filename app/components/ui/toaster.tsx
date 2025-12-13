'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider swipeDirection="up">
      {toasts.map(function ({ id, title, description, action, duration, ...props }) {
        return (
          <Toast
            key={id}
            duration={typeof duration === 'number' ? duration : 4000}
            {...props}
          >
            <div className="grid gap-1">
              <ToastTitle>{title && String(title).trim() ? title : "Erro"}</ToastTitle>
              <ToastDescription>{description && String(description).trim() ? description : "Ocorreu um erro inesperado."}</ToastDescription>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
