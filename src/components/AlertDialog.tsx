'use client'

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import React from 'react'

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  variant?: 'default' | 'destructive'
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Potwierdź',
  cancelText = 'Anuluj',
  onConfirm,
  variant = 'default',
}: AlertDialogProps) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="alert-dialog-overlay" />
        <AlertDialogPrimitive.Content className="alert-dialog-content">
          <AlertDialogPrimitive.Title className="alert-dialog-title">
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="alert-dialog-description">
            {description}
          </AlertDialogPrimitive.Description>
          <div className="alert-dialog-actions">
            <AlertDialogPrimitive.Cancel asChild>
              <button className="btn btn-secondary">{cancelText}</button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <button
                className={`btn ${variant === 'destructive' ? 'btn-danger' : 'btn-primary'}`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}

// Simple error alert (non-blocking toast style)
interface ErrorAlertProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  message: string
}

export function ErrorAlert({ open, onOpenChange, title = 'Błąd', message }: ErrorAlertProps) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="alert-dialog-overlay" />
        <AlertDialogPrimitive.Content className="alert-dialog-content alert-dialog-error">
          <AlertDialogPrimitive.Title className="alert-dialog-title">
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="alert-dialog-description">
            {message}
          </AlertDialogPrimitive.Description>
          <div className="alert-dialog-actions">
            <AlertDialogPrimitive.Action asChild>
              <button className="btn btn-primary">OK</button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
