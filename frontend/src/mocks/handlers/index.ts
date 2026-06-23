import { reviewHandlers } from "./reviews";
import { listHandlers } from "./lists";
import { dashboardHandlers } from "./dashboard";

export const handlers = [...reviewHandlers, ...listHandlers, ...dashboardHandlers];
