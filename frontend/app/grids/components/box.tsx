import { rgbToCSS, isTurnedOff } from "~/utils/utils";
import type { Box as BoxType } from "~/utils/api";

interface Props {
  box: BoxType,
  onClick?: () => void
}
const Box = (props: Props) => {
  const { box, onClick } = props
  const isEmpty = box.leds.length === 0
  const currentRGB: [number, number, number] = isEmpty ? [0, 0, 0] : box.leds[0].rgb
  let className = "flex h-32 w-32 p-2 border-2"
  if (isEmpty || isTurnedOff(box.leds[0].rgb)) className += " border-dashed "
  if (onClick) className += " cursor-pointer "
  const backgroundColor = rgbToCSS(currentRGB)

  return (
    <div onClick={onClick} className={className} style={{ backgroundColor: backgroundColor }}>
      {isTurnedOff(currentRGB) && <span>OFF</span>}
    </div>
  )
}

export default Box;
