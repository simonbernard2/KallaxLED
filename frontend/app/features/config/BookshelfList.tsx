type Led = {
  id: number;
  rgb: [number, number, number];
};

type Box = {
  leds: Led[];
};

type Bookshelf = {
  id: string;
  name: string;
  boxes: Box[][];
};

type BookshelfListProps = {
  list: Bookshelf[];
};

const BookshelfList = ({ list }: BookshelfListProps) => {
  return (
    <ul>
      {list.map((e) => (
        <li key={e.id} > {e.name} </li>
      ))}
    </ul>
  )
}

export default BookshelfList
