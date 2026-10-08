import type { StepStatus } from './progress'

const labels: Record<StepStatus, string> = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

const toneClasses: Record<StepStatus, string> = {
  todo: '',
  'in-progress': 'bg-[var(--accent)]/20 text-[var(--ink)]',
  done: 'border-transparent bg-[var(--forest)] text-white',
}

const StepStatusBadge = ({ status }: { status: StepStatus }) => (
  <span className={`pill ${toneClasses[status]}`.trim()}>{labels[status]}</span>
)

export default StepStatusBadge
