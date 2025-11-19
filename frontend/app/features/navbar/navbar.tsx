import { NavLink } from "react-router";

const NavBar = () => {
  const menuItems = [
    { "path": "/", "name": "Home" },
    { "path": "/bookshelf", "name": "Bookshelf" },
    { "path": "/config", "name": "Config" },
  ]

  return (
    <nav className="
      bg-slate-800 
      px-50 flex 
      justify-center 
      items-center 
      h-24 
      mx-auto 
      px-4 
      text-white 
      gap-2 
      mb-10">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end
          className={({ isActive }) => [
            "px-4 py-2 rounded-md font-semibold transition-colors duration-50",
            isActive ? "bg-red-700 text-white shadow" : "text-slate-200 hover:text-white hover:bg-slate-700",
          ].join(" ")}
        >
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
};

export default NavBar
