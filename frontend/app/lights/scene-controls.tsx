import { SCENE_DEFINITIONS, SCENE_NAMES, type SceneValues } from '~/lights/scene-definitions'
import type { SceneName } from '~/utils/api'

interface SceneControlsProps {
  scene: SceneName
  onSceneChange: (scene: SceneName) => void
  values: SceneValues
  onValueChange: (key: string, value: string | number) => void
  /**
   * Called after a color changes. Screen swatches never match emitted light, so the shelf itself is
   * the preview — but only colors re-push, matching the original behaviour where dragging a number
   * field did not touch the strip.
   */
  onColorPreview: () => void
}

const SceneControls = ({ scene, onSceneChange, values, onValueChange, onColorPreview }: SceneControlsProps) => (
  <div className="mt-4 flex flex-col gap-4">
    <label className="field">
      <span className="field-label">Scene</span>
      <select className="field-input" value={scene} onChange={event => onSceneChange(event.target.value as SceneName)}>
        {SCENE_NAMES.map(name => (
          <option key={name} value={name}>
            {SCENE_DEFINITIONS[name].label}
          </option>
        ))}
      </select>
    </label>

    {SCENE_DEFINITIONS[scene].fields.map(field => (
      <label className="field" key={field.key}>
        <span className="field-label">{field.label}</span>

        {field.kind === 'color' && (
          <input
            className="field-input h-12 p-2"
            type="color"
            value={String(values[field.key])}
            onChange={event => {
              onValueChange(field.key, event.target.value)
              onColorPreview()
            }}
          />
        )}

        {field.kind === 'number' && (
          <input
            className="field-input"
            type="number"
            step={field.step}
            min={field.min}
            value={Number(values[field.key])}
            onChange={event => onValueChange(field.key, Number(event.target.value) || 0)}
          />
        )}

        {field.kind === 'select' && (
          <select
            className="field-input"
            value={String(values[field.key])}
            onChange={event => onValueChange(field.key, event.target.value)}
          >
            {field.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </label>
    ))}
  </div>
)

export default SceneControls
