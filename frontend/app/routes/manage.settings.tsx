import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, setPageSize, usePageSize } from '~/utils/settings'

export default function ManageSettings() {
  const pageSize = usePageSize()

  return (
    <div className="flex flex-col gap-6">
      <section className="panel">
        <p className="section-kicker">Settings</p>
        <h2 className="mt-2 text-xl font-bold text-[var(--ink)]">Display preferences</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
          These apply to this device only, so a phone and a desktop can each show the amount of shelf that suits them.
        </p>

        <label className="field mt-5 max-w-xs">
          <span className="field-label">Results per page</span>
          <select
            className="field-input"
            value={pageSize}
            onChange={event => setPageSize(Number(event.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option} books{option === DEFAULT_PAGE_SIZE ? ' (default)' : ''}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-2 text-xs text-[var(--ink-muted)]">
          Applies to search results and the manage catalog. Saved as you pick it.
        </p>
      </section>
    </div>
  )
}
