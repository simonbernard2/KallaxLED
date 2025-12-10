import type { BoxProps } from "~/utils/api"

interface EditBoxProps extends BoxProps {
  onClick: (boxId: string) => void
}

const NormalBox = (props: EditBoxProps) => {
  const { box, onClick } = props
  const boxId = box.id ?? "none"

  let className = "flex h-32 w-32 p-2 border-2 text-xs cursor-pointer"

  return (
    <div onClick={() => onClick?.(boxId)} className={className} >
      books: {box.books.length}
    </div>
  )
}

export default NormalBox
