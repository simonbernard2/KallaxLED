import { rgbToCSS, isTurnedOff } from "~/utils/utils";
import type { BoxType } from "../types/bookshelfTypes";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "~/store";
import { useState } from "react";
import { mutateBoxColor } from "../slices/bookshelfSlice";

const Box = (props: BoxType) => {
  const dispatch = useDispatch();
  const color = isTurnedOff(props.rgb) ? 'transparent' : rgbToCSS(props.rgb)
  const [backgroundColor, setBackgroundColor] = useState(color)
  const { selectedColor } = useSelector((state: RootState) => state.colorpicker)

  let className = "flex h-32 w-32 p-2 border-2"
  if (isTurnedOff(props.rgb)) className += " border-dashed "
  if (selectedColor) className += " cursor-pointer "

  const handleOnClick = () => {
    if (!selectedColor) return

    const box: BoxType = {
      id: props.id,
      rgb: selectedColor.rgb
    }
    setBackgroundColor(rgbToCSS(selectedColor.rgb))
    dispatch(mutateBoxColor(box))
  }
  return (
    <div onClick={handleOnClick} className={className} style={{ backgroundColor: backgroundColor }}>
      {isTurnedOff(props.rgb) && <span>OFF</span>}
    </div>
  )
}

export default Box;
