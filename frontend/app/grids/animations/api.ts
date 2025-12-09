export interface BoxEvent {
    i: number;
    j: number;
    rgb: [number, number, number];
}

export interface GridAnimationStep {
    events: BoxEvent[];
    delay_ms: number;
}

export interface GridAnimation {
    id?: string;
    grid_id: string;
    name: string;
    steps: GridAnimationStep[];
}
