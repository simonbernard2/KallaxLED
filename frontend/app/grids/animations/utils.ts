import type { Box, Grid } from "~/utils/api";
import type { GridAnimationStep } from "./api";

export type BoxesColor = [number, number, number][][];

const off: [number, number, number] = [0, 0, 0];

export const initBoxesColor = (grid: Grid): BoxesColor => grid.boxes.map((row) => row.map(() => off));

export const applyStep = (boxes: BoxesColor, step: GridAnimationStep): BoxesColor => {
    let updated = structuredClone(boxes);
    step.events.forEach((s) => updated[s.i][s.j] = s.rgb);

    return updated;
};