import { rgbToCSS, isTurnedOff } from "~/utils/utils";
import type { Box as BoxType } from "~/utils/api";


interface LEDPreviewProps {
  ledID: number
}
const LEDPreview = (props: LEDPreviewProps) => {
  return (
    <div className={"flex items-center justify-center rounded-full h-6 w-6 text-xs bg-neutral-300"}>
      {props.ledID}
    </div>
  )
}

interface BoxProps {
  box: BoxType,
  preview: boolean,
  showLEDs?: boolean,
  currentLedID?: number,
  onClick?: () => void
}

const Box = (props: BoxProps) => {
  const { box, onClick, preview, showLEDs } = props
  const isEmpty = box.leds.length === 0
  const currentRGB: [number, number, number] = isEmpty ? [0, 0, 0] : box.leds[0].rgb
  let className = preview ? "flex h-16 w-16 p-2" : "flex h-32 w-32 p-2 border-2"
  if (showLEDs) {
    className = "grid grid-cols-4 w-32 h-32 p-1 items-start"
  }
  if (isEmpty || isTurnedOff(box.leds[0].rgb)) className += " border-dashed "
  if (onClick) className += " cursor-pointer "
  const backgroundColor = preview ? rgbToCSS([125, 125, 125]) : rgbToCSS(currentRGB)

  return (
    <div onClick={onClick} className={className} style={{ backgroundColor: backgroundColor }}>
      {!showLEDs && !preview && isTurnedOff(currentRGB) && <span>OFF</span>}
      {showLEDs && box.leds.map((led) => <LEDPreview key={led.id} ledID={led.id} />)}
    </div>
  )
}

export default Box;
