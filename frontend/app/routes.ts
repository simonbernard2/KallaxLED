import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("grids", "grids/home.tsx"),
  route("grids/create", "grids/create/index.tsx"),
  route("grids/:gridId", "grids/view/index.tsx"),
  route("grids/:gridId/edit", "grids/edit/index.tsx"),
  route("grids/:gridId/edit/:boxId", "boxes/edit.tsx"),
  route("grids/:gridId/assignLEDs", "grids/assignLEDs/index.tsx")
] satisfies RouteConfig;
