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
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
<<<<<<< Updated upstream
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
=======
        // ランダムに画像を選択
        const randomImage = Math.random() < 0.5 ? "/images/boy.png" : "/images/girl.png"

        return (
          <Toast key={id} {...props} className="p-8 min-h-[70vh]">
            <div className="flex flex-col items-center gap-6 text-center h-full">
              <img
                src={randomImage}
                alt="担当者"
                className="w-full max-w-md h-auto object-cover shadow-2xl rounded-lg border border-gray-200"
              />
              <div className="grid gap-3 flex-1">
                {title && <ToastTitle className="text-2xl font-bold">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-lg">{description}</ToastDescription>
                )}
              </div>
>>>>>>> Stashed changes
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
