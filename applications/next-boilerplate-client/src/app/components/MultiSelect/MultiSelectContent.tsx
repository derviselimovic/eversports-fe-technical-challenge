import { useMultiSelectContext } from './MultiSelectContext'

export interface MultiSelectContentProps {
  children: React.ReactNode
  className?: string
}

export function MultiSelectContent({ children, className = '' }: MultiSelectContentProps) {
  const { isOpen } = useMultiSelectContext()

  if (!isOpen) return null

  return <div className={`multiselect-content ${className}`}>{children}</div>
}
