import { Link } from 'react-router'

import { guideSteps } from '~/install/guide'
import {
  completedStepCount,
  nextIncompleteStep,
  resetProgress,
  stepStatus,
  useInstallProgress,
} from '~/install/progress'
import StepStatusBadge from '~/install/step-status-badge'
import Button from '~/utils/components/button/button'

export default function ManageInstall() {
  const checked = useInstallProgress()
  const done = completedStepCount(guideSteps, checked)
  const total = guideSteps.length
  const resumeStep = nextIncompleteStep(guideSteps, checked)
  const started = checked.size > 0

  const onReset = () => {
    if (window.confirm('Clear every ticked item in the installation guide on this device?')) resetProgress()
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="panel-strong">
        <p className="section-kicker">Installation guide</p>
        <h2 className="section-heading mt-2">Install the LEDs on your shelf</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
          A step-by-step walkthrough from a working strip on the bench to every Kallax box lighting up. No electronics
          experience needed. Tick items off as you go; progress is saved on this device.
        </p>

        <div className="mt-5">
          <p className="text-sm font-semibold text-[var(--ink-muted)]">
            {done} of {total} steps done
          </p>
          <div
            role="progressbar"
            aria-label="Installation progress"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
            className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-border)]"
          >
            <div
              className="h-full rounded-full bg-[var(--forest)] transition-all"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {resumeStep ? (
            <Link
              to={`/manage/install/${resumeStep.slug}`}
              className="button-base bg-[var(--accent-strong)] text-[var(--accent-ink)] hover:bg-[var(--accent)]"
            >
              {started ? `Continue: ${resumeStep.title}` : 'Start the guide'}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-[var(--forest-ink)]">Every step is done. Enjoy your shelf!</p>
          )}
          {started && (
            <Button tone="ghost" onClick={onReset}>
              Reset progress
            </Button>
          )}
        </div>
      </section>

      <ol className="grid gap-4 lg:grid-cols-2">
        {guideSteps.map((step, index) => (
          <li key={step.slug}>
            <Link
              to={`/manage/install/${step.slug}`}
              className="panel flex h-full flex-col gap-3 hover:bg-[var(--surface-hover)]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="section-kicker">Step {index + 1}</p>
                <StepStatusBadge status={stepStatus(step, checked)} />
              </div>
              <h3 className="text-xl font-bold text-[var(--ink)]">{step.title}</h3>
              <p className="text-sm leading-6 text-[var(--ink-muted)]">{step.summary}</p>
              {step.duration && (
                <p className="mt-auto text-xs font-semibold text-[var(--ink-muted)]">About {step.duration}</p>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
