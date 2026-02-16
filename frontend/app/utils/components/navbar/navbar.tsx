import { NavLink } from 'react-router'

const NavBar = () => {
  const menuItems = [
    { path: '/', name: 'Home' },
    { path: '/grid', name: 'Grid' },
    { path: '/books', name: 'Books' },
  ]

  return (
    <nav
      className="
      bg-gray-100
      dark:bg-neutral-800
      shadow-lg/10
      dark:shadow-lg/40
      border
      border-white
      dark:border-neutral-700
      sm:rounded-full
      px-50 
      flex 
      sm:w-2xl
      justify-center
      items-center 
      h-24 
      gap-4 
      mb-10
      sm:mt-10
      "
    >
      {menuItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end
          className={({ isActive }) =>
            [
              'px-4 py-2 rounded-xl font-semibold transition duration-200',
              isActive
                ? 'bg-neutral-400 dark:bg-neutral-200 text-white dark:text-neutral-900 font-bold shadow-[0px_0px_15px_2px] dark:shadow-[0px_0px_10px_2px] shadow-neutral-400 dark:shadow-neutral-400'
                : 'text-neutral-400 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700',
            ].join(' ')
          }
        >
          {item.name}
        </NavLink>
      ))}
    </nav>
  )
}

export default NavBar
