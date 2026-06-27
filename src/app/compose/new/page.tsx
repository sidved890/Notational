'use client'

import { CompositionProvider } from '@/context/CompositionContext'
import Editor from '@/components/Editor'

export default function NewCompositionPage() {
  return (
    <CompositionProvider>
      <Editor cloudId={null} />
    </CompositionProvider>
  )
}
