import type { SceneName } from '~/utils/api'
import { hexToRgbTuple } from '~/utils/utils'

/**
 * What each scene's controls look like, as data.
 *
 * The backend already models scene params this way (`SCENE_PARAM_MODELS`, one Pydantic model per
 * scene). Mirroring that here means adding a scene is a new entry in this table rather than another
 * `{sceneName === 'x' && …}` branch and three more `useState` calls in the route.
 *
 * `key` is the API param name, so it must match the backend model field exactly.
 */
export type SceneField =
  | { kind: 'color'; key: string; label: string; initial: string }
  | { kind: 'number'; key: string; label: string; initial: number; step: number; min?: number }
  | { kind: 'select'; key: string; label: string; initial: string; options: { value: string; label: string }[] }

interface SceneDefinition {
  label: string
  fields: SceneField[]
}

export const SCENE_DEFINITIONS: Record<SceneName, SceneDefinition> = {
  off: { label: 'Off', fields: [] },
  solid: {
    label: 'Solid',
    fields: [{ kind: 'color', key: 'rgb', label: 'Solid color', initial: '#c79745' }],
  },
  checkerboard: {
    label: 'Checkerboard',
    fields: [
      { kind: 'color', key: 'color_a', label: 'Color A', initial: '#c79745' },
      { kind: 'color', key: 'color_b', label: 'Color B', initial: '#1d3557' },
    ],
  },
  rainbow: {
    label: 'Rainbow',
    fields: [
      { kind: 'number', key: 'speed', label: 'Speed (cycles/s)', initial: 0.1, step: 0.05, min: 0 },
      { kind: 'number', key: 'scale', label: 'Spread (cycles across shelf)', initial: 1, step: 0.5, min: 0 },
    ],
  },
  swipe: {
    label: 'Color swipe',
    fields: [
      { kind: 'color', key: 'rgb', label: 'Swipe color', initial: '#c79745' },
      { kind: 'number', key: 'speed', label: 'Speed (sweeps/s)', initial: 0.5, step: 0.1, min: 0 },
      {
        kind: 'select',
        key: 'direction',
        label: 'Direction',
        initial: 'right',
        options: [
          { value: 'right', label: 'Left to right' },
          { value: 'left', label: 'Right to left' },
        ],
      },
    ],
  },
}

export const SCENE_NAMES = Object.keys(SCENE_DEFINITIONS) as SceneName[]

export type SceneValues = Record<string, string | number>

export const initialSceneValues = (): Record<SceneName, SceneValues> =>
  Object.fromEntries(
    SCENE_NAMES.map(name => [name, Object.fromEntries(SCENE_DEFINITIONS[name].fields.map(f => [f.key, f.initial]))])
  ) as Record<SceneName, SceneValues>

/** Converts the on-screen field values into the request body the lights API expects. */
export const buildSceneParams = (scene: SceneName, values: SceneValues): Record<string, unknown> =>
  Object.fromEntries(
    SCENE_DEFINITIONS[scene].fields.map(field => [
      field.key,
      field.kind === 'color' ? hexToRgbTuple(String(values[field.key])) : values[field.key],
    ])
  )
