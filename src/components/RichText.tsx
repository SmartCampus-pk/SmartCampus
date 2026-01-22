import React from 'react'
import { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react'

interface RichTextProps {
  content: any
  className?: string
}

export function RichText({ content, className = '' }: RichTextProps) {
  if (!content) return null

  return (
    <div className={`richtext-content ${className}`}>
      <PayloadRichText data={content} />
    </div>
  )
}
