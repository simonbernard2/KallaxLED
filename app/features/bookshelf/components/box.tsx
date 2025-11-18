import { rgbToCSS } from "~/utils/utils";
import type { BoxType } from "../types/bookshelfTypes";

const Box = (props: BoxType) => {
  let backgroundColor = rgbToCSS(props.rgb)
  const { red, green, blue } = props.rgb
  let className = "flex h-32 w-32 p-2 border-2"
  const isOff = [red, green, blue].every(value => value === 0)
  if (isOff) {
    className += " border-dashed"
    backgroundColor = 'transparent'
  }
  return (
    <div className={className} style={{ backgroundColor: backgroundColor }}>
      {isOff && <span>OFF</span>}
    </div>
  )
}

export default Box;
