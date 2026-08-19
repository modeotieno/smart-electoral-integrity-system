import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { FiBarChart2, FiLogOut } from "react-icons/fi";

const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Voters", path: "/dashboard/voters" },
  { name: "Candidates", path: "/dashboard/candidates" },
  { name: "Polling Stations", path: "/dashboard/stations" },
  { name: "Results", path: "/dashboard/results" },
  { name: "Reports", path: "/dashboard/reports" },
];

export default function DashboardLayout() {
  return (
    <div className="dashboard">
      <aside className="dash-sidebar">
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
          <Link to="/login" className="dash-menu logout">
            <FiLogOut />
            Logout
          </Link>
        </div>
      </aside>

      <div className="dash-content-wrap">
        <Outlet />
      </div>
    </div>
  );
}