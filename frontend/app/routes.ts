import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("grid", "grids/home.tsx"),
  route("grid/create", "grids/create/index.tsx"),
  route("grid/view", "grids/view/index.tsx"),
  route("grid/edit", "grids/edit.tsx"),
  route("grid/assign-leds", "grids/assignLEDs/index.tsx"),
  route("books", "books/index.tsx")
] satisfies RouteConfig;
