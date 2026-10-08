import { Link, useParams } from 'react-router'

import { guideSteps } from '~/install/guide'
import GuideBlocks from '~/install/guide-blocks'
import { progressKey, stepStatus, toggleItem, useInstallProgress } from '~/install/progress'
import StepStatusBadge from '~/install/step-status-badge'

const navLinkClassName =
  'button-base bg-transparent text-[var(--ink-muted)] ring-1 ring-[var(--surface-border)] hover:bg-[var(--surface-hover)]'
const primaryLinkClassName = 'button-base bg-[var(--accent-strong)] text-[var(--accent-ink)] hover:bg-[var(--accent)]'

export default function ManageInstallStep() {
  const { step: slug } = useParams()
  const checked = useInstallProgress()

  const index = guideSteps.findIndex(step => step.slug === slug)
  const step = guideSteps[index]

  if (!step) {
    return (
      <section className="panel-strong">
        <p className="section-kicker">Installation guide</p>
        <h2 className="section-heading mt-2">Step not found</h2>
        <p className="mt-3 text-sm text-[var(--ink-muted)]">That step does not exist in the guide.</p>
        <Link to="/manage/install" className={`${navLinkClassName} mt-5`}>
          Back to the guide
        </Link>
      </section>
    )
  }

  const previous = guideSteps[index - 1]
  const next = guideSteps[index + 1]

  return (
    <div className="flex flex-col gap-6">
      <section className="panel-strong">
        <Link to="/manage/install" className="text-sm font-semibold text-[var(--forest-ink)] hover:underline">
          ← All steps
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="section-kicker">
            Step {index + 1} of {guideSteps.length}
            {step.duration && ` · about ${step.duration}`}
          </p>
          <StepStatusBadge status={stepStatus(step, checked)} />
        </div>
        <h2 className="section-heading mt-2">{step.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">{step.summary}</p>
      </section>

      <section className="panel">
        <GuideBlocks blocks={step.blocks} />
      </section>

      {step.checklist.length > 0 && (
        <section className="panel">
          <h3 className="text-lg font-bold text-[var(--ink)]">Checklist</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {step.checklist.map(item => (
              <li key={item.id}>
                <label className="surface-card flex min-h-12 cursor-pointer items-center gap-3 px-4 py-3 text-sm text-[var(--ink)] hover:bg-[var(--surface-hover)]">
                  <input
                    type="checkbox"
                    className="size-5 shrink-0 accent-[var(--forest)]"
                    checked={checked.has(progressKey(step.slug, item.id))}
                    onChange={() => toggleItem(step.slug, item.id)}
                  />
                  {item.label}
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="Guide steps" className="flex flex-wrap justify-between gap-2">
        {previous ? (
          <Link to={`/manage/install/${previous.slug}`} className={navLinkClassName}>
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/manage/install/${next.slug}`} className={primaryLinkClassName}>
            Next: {next.title} →
          </Link>
        ) : (
          <Link to="/manage/install" className={primaryLinkClassName}>
            Back to overview
          </Link>
        )}
      </nav>
    </div>
  )
}
