import { useState } from 'react'

/**
 * CollapsibleSection - A collapsible wrapper for grouped content
 * @param {string} title - Section title
 * @param {boolean} defaultOpen - Whether to start expanded
 * @param {ReactNode} children - Content to show when expanded
 */
function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-700/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
      >
        <h2 className="text-lg font-semibold text-gray-200">{title}</h2>
        <span
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      <div
        className={`
          transition-all duration-300 ease-out
          ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
          overflow-hidden
        `}
      >
        <div className="p-4 bg-gray-900/30">
          {children}
        </div>
      </div>
    </div>
  )
}

export default CollapsibleSection
