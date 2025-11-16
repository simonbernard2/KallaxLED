import { rgbToCSS } from "~/utils/utils";
import type { BoxType } from "../types/bookshelfTypes";

const Box = (props: BoxType) => {
  const backgroundColor = rgbToCSS(props.rgb)
  return (
    <div className="flex h-32 w-32" style={{ backgroundColor: backgroundColor }}></div>
  )
}

export default Box;
