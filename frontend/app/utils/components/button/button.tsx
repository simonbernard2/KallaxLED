interface Props {
  onClick?: () => void
  color?: "green" | "red"
  type?: "submit" | "reset" | "button"
  disabled?: boolean
  children?: React.ReactNode
}

const Button = (props: Props) => {
  const { type, onClick, color, disabled, children } = props
  let buttonColor;
  switch (color) {
    case "green":
      buttonColor = "bg-green-600"
      break
    case "red":
      buttonColor = "bg-red-600"
      break
    default:
      buttonColor = "bg-neutral-600"
  }
  return (
    <button type={type} onClick={onClick} className={`${buttonColor} px-2 py-1 rounded ${disabled ? "opacity-50" : "cursor-pointer"}`} >
      {children}
    </button >
  )
}

export default Button
