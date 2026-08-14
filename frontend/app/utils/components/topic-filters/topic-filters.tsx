import Input from '~/utils/components/input/input'
import type { Topic } from '~/utils/api'

interface TopicFiltersProps {
  /** Unique per rendered instance — the mobile and desktop copies must not share an input id. */
  name: string
  topics: Topic[]
  filter: string
  onFilterChange: (value: string) => void
  onSelect: (topicPath: string) => void
}

/**
 * Topic quick-filter input plus the matching pills.
 *
 * Rendered twice — once inside the mobile `<details>`, once in the desktop aside — because the two
 * live in different places in the layout. Sharing the markup keeps the empty states and the pill
 * styling from drifting apart.
 */
const TopicFilters = ({ name, topics, filter, onFilterChange, onSelect }: TopicFiltersProps) => (
  <>
    <Input
      name={name}
      label="Filter topics"
      type="search"
      placeholder="e.g. cards"
      value={filter}
      onChange={event => onFilterChange(event.target.value)}
    />
    <div className="mt-4 flex flex-wrap gap-2">
      {topics.map(topic => (
        <button
          key={topic.id}
          type="button"
          className="pill hover:border-[var(--accent-strong)] hover:text-[var(--ink)]"
          onClick={() => onSelect(topic.path)}
        >
          {topic.name}
        </button>
      ))}
      {topics.length === 0 && (
        <p className="text-sm text-[var(--ink-muted)]">
          {filter ? 'No topics match that filter.' : 'Import archive metadata to build the topic list.'}
        </p>
      )}
    </div>
  </>
)

export default TopicFilters
