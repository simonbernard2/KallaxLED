import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("bookshelf", "routes/bookshelf.tsx"),
  route("config", "routes/config.tsx"),
  route("grids", "grids/home.tsx"),
  route("grids/create", "grids/create.tsx"),
  route("grids/:gridId/update", "grids/update.tsx")
] satisfies RouteConfig;
