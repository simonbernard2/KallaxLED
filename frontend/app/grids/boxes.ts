import type { Box, Grid } from '~/utils/api'

/** A box that has been persisted, so it can actually be referenced by a book or an LED assignment. */
export type SavedBox = Box & { id: number }

/**
 * Flattens a grid's rows into the boxes that can be assigned to.
 *
 * `Box.id` is optional on the wire because the create-grid payload builds boxes client-side, so
 * every consumer has to narrow it away first. Doing that in one place keeps the type predicate
 * from being rewritten at each call site.
 */
export const assignableBoxes = (grid: Grid | null | undefined): SavedBox[] =>
  grid?.boxes.flat().filter((box): box is SavedBox => box.id != null) ?? []
