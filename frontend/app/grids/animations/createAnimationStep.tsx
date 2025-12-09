import { useEffect, useState } from "react"
import GridComponent from "~/grids/components/grid";
import type { BoxEvent, GridAnimationStep } from "./api"
import { type Color, type Grid } from "~/utils/api";
import { PreviewBox, type BoxProps } from "../components/box";
import { rgbToCSS, isTurnedOff } from "~/utils/utils";
import { applyStep, type BoxesColor } from "./utils";

interface Props {
    grid: Grid,
    boxesColor: BoxesColor;
    step_i: number;
    step: GridAnimationStep;
    onPrev?: () => void;
    onNext: (step: GridAnimationStep) => void;
    rgb: [number, number, number];
}

interface ColoredBoxProps extends BoxProps {
    selectBoxRgb: (i: number, j: number) => [number, number, number];
    onClick: (i: number, j: number) => void;
}

const ColoredBox = ({i, j, selectBoxRgb, onClick}: ColoredBoxProps) => <div className="h-32 w-32 border-2" onClick={() => onClick(i, j)} style={{ backgroundColor: rgbToCSS(selectBoxRgb(i, j))}} />;

export const CreateAnimationStep = (props: Props) => {
  const [step, setStep] = useState<GridAnimationStep>(props.step);
  const [boxesColor, setBoxesColor] = useState(props.boxesColor);

  useEffect(() => {
    setStep(props.step);
    setBoxesColor(props.boxesColor);    
  }, [props.boxesColor, props.step]);

  const selectBoxRgb = (i: number, j: number) => boxesColor[i][j] || [0, 0, 0];

  const handleBoxClick = (i: number, j: number) => {
    let event: BoxEvent = {
        i: i,
        j: j,
        rgb: [0, 0, 0]
    };
    if (isTurnedOff(selectBoxRgb(i, j))) {        
        event.rgb = props.rgb;
    }

    const updated = {...step};
    updated.events.push(event);
    setStep(updated);
    setBoxesColor(applyStep(props.boxesColor, updated));
  };

  return (
    <div className="flex flex-col gap-4 w-lg items-center justify-center">
      <h3>Step {props.step_i + 1}</h3>
      <GridComponent
        grid={props.grid}
        BoxComponent={ColoredBox}
        boxComponentProps={{ selectBoxRgb: selectBoxRgb, onClick: handleBoxClick }}
      />
      <span>
        <button className="mr-2" onClick={props.onPrev} disabled={!props.onPrev}>Prev</button>
        <button onClick={() => props.onNext(step)}>Next</button>
      </span>
    </div>
  )
}