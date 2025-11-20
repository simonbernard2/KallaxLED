import { rgbToCSS, isTurnedOff } from "~/utils/utils";
import type { BoxType } from "../types/bookshelfTypes";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "~/store";
import { useEffect, useState } from "react";
import { mutateBoxColor } from "../slices/bookshelfSlice";

const Box = (props: BoxType) => {
  const dispatch = useDispatch();
  const [currentRgb, setCurrentRgb] = useState(props.rgb)
  const backgroundColor = isTurnedOff(currentRgb) ? 'transparent' : rgbToCSS(currentRgb)
  const { selectedColor } = useSelector((state: RootState) => state.colorpicker)

  useEffect(() => {
    setCurrentRgb(props.rgb)
  }, [props.rgb])

  let className = "flex h-32 w-32 p-2 border-2"
  if (isTurnedOff(currentRgb)) className += " border-dashed "
  if (selectedColor) className += " cursor-pointer "

  const handleOnClick = async () => {
    if (!selectedColor) return

    const box: BoxType = {
      id: props.id,
      rgb: selectedColor.rgb
    }
    setCurrentRgb(selectedColor.rgb)
    dispatch(mutateBoxColor(box))
    await fetch(`http://192.168.17.39:5000/update_led/${box.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(box)
    })
  }
  return (
    <div onClick={handleOnClick} className={className} style={{ backgroundColor: backgroundColor }}>
      {isTurnedOff(currentRgb) && <span>OFF</span>}
    </div>
  )
}

export default Box;
