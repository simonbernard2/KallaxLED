import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  // grids
  route("grids", "grids/home.tsx"),
  route("grids/create", "grids/create/create.tsx"),
  route("grids/:gridId", "grids/view/view.tsx"),
  route("grids/:gridId/edit", "grids/edit.tsx"),
  route("grids/:gridId/assignLEDs", "grids/assignLEDs/index.tsx"),
  // animations
  route("grids/:gridId/animations", "grids/animations/home.tsx"),
  route("grids/:gridId/animations/create", "grids/animations/create.tsx"),
] satisfies RouteConfig;
