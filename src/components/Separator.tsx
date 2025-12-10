import * as RadixSeparator from '@radix-ui/react-separator'
import React from 'react'

interface SeparatorProps {
  className?: string
}

export function Separator({ className }: SeparatorProps) {
  return <RadixSeparator.Root className={`separator ${className || ''}`} />
}
