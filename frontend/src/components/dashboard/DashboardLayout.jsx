import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiBarChart2, FiLogOut } from "react-icons/fi";
import { logout } from "../../api/api";

const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Voters", path: "/dashboard/voters" },
  { name: "Candidates", path: "/dashboard/candidates" },
  { name: "Polling Stations", path: "/dashboard/stations" },
  { name: "Results", path: "/dashboard/results" },
  { name: "Reports", path: "/dashboard/reports" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="dash-portal">
      <aside className="dash-portal-sidebar">
        <div className="dash-logo">
          <span className="mini-fingerprint" />
          SEIS
        </div>

        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              isActive ? "dash-menu selected" : "dash-menu"
            }
          >
            <FiBarChart2 />
            {item.name}
          </NavLink>
        ))}

        <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
          <button type="button" onClick={handleLogout} className="dash-menu logout" style={{ width: "100%", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", color: "inherit" }}>
            <FiLogOut />
            Logout
          </button>
        </div>
      </aside>

      <div className="dash-portal-content">
        <Outlet />
      </div>
    </div>
  );
}