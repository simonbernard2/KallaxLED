import { useState } from "react"
import useAxios from "axios-hooks"
import { Navigate } from "react-router"
import Input from "~/utils/components/input/input"
import type { GridAnimation, GridAnimationStep } from "./api"
import { CurrentGridProvider, useCurrentGrid } from "../context/currentGridProvider"
import { applyStep, initBoxesColor, type BoxesColor } from "./utils"
import { CreateAnimationStep } from "./createAnimationStep"

const emptyStep = (): GridAnimationStep => ({ events: [], delay_ms: 200});

const CreateAnimation = () => {
  const grid = useCurrentGrid();
  const [name, setName] = useState<string>("My animation")
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<GridAnimationStep[]>([]);
  const [boxesColors, setBoxesColor] = useState<BoxesColor>(initBoxesColor(grid));
  const [rgb] = useState<[number, number, number]>([200, 0, 0]);

  const [
    { data: createAnimationData, loading, },
    createAnimation
  ] = useAxios<GridAnimation, GridAnimation>(
    {
      url: `/grids/${grid.id}/animations`,
      method: "POST"
    },
    { manual: true }
  );

  const handleSave = () => {
    createAnimation({
        data: {
            name: name,
            grid_id: grid.id!,
            steps: steps,
        }
    });
  };

  const handleOnNextStep = (step: GridAnimationStep) => {
    const updatedSteps = structuredClone(steps);
    updatedSteps[currentStepIndex] = step;

    setSteps(updatedSteps);
    setCurrentStepIndex(currentStepIndex + 1);
    setBoxesColor(applyStep(boxesColors, step));
  }

  if (loading) {
    return <div>Creating animation...</div>
  }

  if (createAnimationData) {
    return <Navigate to={`/grids/${grid.id}/animations`} />
  }

  return (
    <div className="flex flex-col gap-4 w-lg items-center justify-center">
      <Input name="gridName" value={name} onChange={(e) => setName(e.target.value)} label="Name" type="text" />
      <CreateAnimationStep
        boxesColor={boxesColors}
        grid={grid}
        step_i={currentStepIndex}
        step={steps[currentStepIndex] || emptyStep()}
        onPrev={currentStepIndex === 0 ? undefined : () => setCurrentStepIndex(currentStepIndex - 1)}
        onNext={handleOnNextStep}
        rgb={rgb}
       />
      <button onClick={handleSave}>Create</button>
    </div>
  )
}

export default () => (
    <CurrentGridProvider>
        <CreateAnimation />
    </CurrentGridProvider>
);
