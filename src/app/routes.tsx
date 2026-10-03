import { createBrowserRouter } from "react-router";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import WasteTracking from "./pages/WasteTracking";
import BSFMonitoring from "./pages/BSFMonitoring";
import CompostMonitoring from "./pages/CompostMonitoring";
import BiogasTracking from "./pages/BiogasTracking";
import WASHMonitoring from "./pages/WASHMonitoring";
import MapView from "./pages/MapView";
import AdminPanel from "./pages/AdminPanel";
import Community from "./pages/Community";
import Marketplace from "./pages/MarketPlace";
import { PhotoCheck } from "./pages/PhotoCheck";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "waste", Component: WasteTracking },
      { path: "bsf", Component: BSFMonitoring },
      { path: "compost", Component: CompostMonitoring },
      { path: "biogas", Component: BiogasTracking },
      { path: "wash", Component: WASHMonitoring },
      { path: "map", Component: MapView },
      { path: "photo-check", Component: PhotoCheck },
      { path: "community", Component: Community },
      { path: "marketplace", Component: Marketplace },
      { path: "admin", Component: AdminPanel },
      { path: "*", Component: NotFound },
    ],
  },
]);
