import type { ReactNode } from 'react'
import { formatBoxLabel } from '~/grids/box-label'
import type { Book } from '~/utils/api'

interface Props {
  book: Book
  expanded: boolean
  onToggle: () => void
  /** Badge shown on the collapsed row, e.g. a match count. */
  badge?: ReactNode
  /** Controls rendered beside the row; kept outside the toggle so buttons never nest. */
  actions?: ReactNode
  /** Detail revealed when the row is expanded. */
  children?: ReactNode
}

const MAX_COLLAPSED_TAGS = 2

/**
 * One book as a single line, with its detail behind a toggle.
 *
 * Every route used to render books as tall cards, which made even a modest catalog an unreadable
 * scroll. Callers supply their own expanded body and actions; the collapsed line stays uniform.
 */
const BookRow = ({ book, expanded, onToggle, badge, actions, children }: Props) => {
  const extraTagCount = book.user_tags.length - MAX_COLLAPSED_TAGS
  // A row with nothing to reveal stays inert rather than opening onto an empty panel.
  const collapsible = Boolean(children)
  const Summary = collapsible ? 'button' : 'div'

  return (
    <article className="surface-card p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <Summary
          {...(collapsible
            ? { type: 'button' as const, 'aria-expanded': expanded, 'aria-label': book.title, onClick: onToggle }
            : {})}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span
            aria-hidden="true"
            className={[
              'text-xs text-[var(--ink-muted)] transition-transform',
              collapsible ? '' : 'opacity-0',
              expanded ? 'rotate-90' : '',
            ].join(' ')}
          >
            ▶
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-[var(--ink)]">{book.title}</span>
            <span className="block truncate text-sm text-[var(--ink-muted)]">{book.author}</span>
          </span>

          <span className="hidden shrink-0 flex-wrap items-center justify-end gap-2 sm:flex">
            {badge}
            {book.box ? (
              <span className="pill bg-[var(--forest)]/10 text-[var(--forest-ink)]">{formatBoxLabel(book.box)}</span>
            ) : (
              <span className="pill">Unassigned</span>
            )}
            {book.user_tags.slice(0, MAX_COLLAPSED_TAGS).map(tag => (
              <span key={tag} className="pill">
                {tag}
              </span>
            ))}
            {extraTagCount > 0 && <span className="pill">+{extraTagCount}</span>}
          </span>
        </Summary>

        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {expanded && collapsible && (
        <div className="mt-4 border-t border-[var(--surface-border)] pt-4">{children}</div>
      )}
    </article>
  )
}

export default BookRow
