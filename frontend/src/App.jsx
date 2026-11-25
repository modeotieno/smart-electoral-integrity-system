import { BrowserRouter as Router } from "react-router-dom";

import { AppRoutes } from "./routes";
import InstallPWA from "./components/InstallPWA";
import "./App.css";

export default function App() {
  return (
    <Router>
      <AppRoutes />
      <InstallPWA />
    </Router>
  );
}
