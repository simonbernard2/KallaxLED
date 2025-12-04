import { rgbToCSS, isTurnedOff } from "~/utils/utils";
import type { Box as BoxType, LED } from "~/utils/api";

export interface BoxProps {
  box: BoxType
  i: number
  j: number
}

interface LEDNumberProps {
  ledID: number
  active: boolean
}
const LEDNumber = (props: LEDNumberProps) => {
  const background = props.active ? "bg-amber-500" : "bg-neutral-300"
  return (
    <div className={`flex items-center justify-center rounded-full h-6 w-6 text-xs ${background} text-neutral-900`}>
      {props.ledID}
    </div>
  )
}

interface AssignLEDBoxProps extends BoxProps {
  currentLED: LED
  disabled?: boolean
  onClick: (i: number, j: number) => void
}
export const AssignLEDBox = (props: AssignLEDBoxProps) => {
  const { box, currentLED, disabled, i, j, onClick } = props
  let className = "grid grid-cols-4 w-32 h-32 p-1 items-start bg-neutral-500"
  if (!disabled) className += " cursor-pointer "
  const isCurrent = (id: number) => currentLED.id === id
  return (
    <div onClick={() => onClick?.(i, j)} className={className}>
      {box.leds.map((led: LED) =>
        <LEDNumber key={led.id} ledID={led.id} active={isCurrent(led.id)} />)}
    </div>
  )
}


export const PreviewBox = () => {
  return (
    <div className="flex h-16 w-16 p-2 bg-neutral-500"></div>
  )
}

interface NormalBoxProps extends BoxProps {
  onClick?: (i: number, j: number) => void
}

export const NormalBox = (props: NormalBoxProps) => {
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
