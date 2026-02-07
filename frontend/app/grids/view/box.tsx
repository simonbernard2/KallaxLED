import type { BoxProps } from "~/utils/api"

interface NormalBoxProps extends BoxProps {
  onClick?: (i: number, j: number) => void
}

const NormalBox = (props: NormalBoxProps) => {
  const { box, onClick } = props

  const hasLeds = box.leds.length > 0
  let className = "flex h-32 w-32 p-2 border-2 items-center justify-center text-sm"
  if (!hasLeds) className += " border-dashed text-neutral-400 "
  if (onClick) className += " cursor-pointer "

  return (
    <div onClick={() => onClick?.(props.i, props.j)} className={className}>
      {hasLeds ? `${box.leds.length} LEDs` : "No LEDs"}
    </div>
  )
}

export default NormalBox
