import type { BoxProps } from "~/utils/api"
import { isTurnedOff, rgbToCSS } from "~/utils/utils"

interface NormalBoxProps extends BoxProps {
  onClick?: (i: number, j: number) => void
}

const NormalBox = (props: NormalBoxProps) => {
  const { box, onClick } = props

  const isEmpty = box.leds.length === 0
  let className = "flex h-32 w-32 p-2 border-2"
  if (isEmpty || isTurnedOff(box.leds[0].rgb)) className += " border-dashed "
  if (onClick) className += " cursor-pointer "

  const currentRGB: [number, number, number] = isEmpty ? [0, 0, 0] : box.leds[0].rgb
  const backgroundColor = rgbToCSS(currentRGB)

  return (
    <div onClick={() => onClick?.(props.i, props.j)} className={className} style={{ backgroundColor: backgroundColor }}>
      {isTurnedOff(currentRGB) && <span>OFF</span>}
    </div>
  )
}

export default NormalBox
