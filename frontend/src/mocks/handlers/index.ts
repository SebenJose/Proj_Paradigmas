import { listHandlers } from "./lists";
import { dashboardHandlers } from "./dashboard";

export const handlers = [...listHandlers, ...dashboardHandlers];
