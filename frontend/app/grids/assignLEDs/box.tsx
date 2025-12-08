import type { BoxProps, LED } from "~/utils/api"

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
const AssignLEDBox = (props: AssignLEDBoxProps) => {
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

export default AssignLEDBox
