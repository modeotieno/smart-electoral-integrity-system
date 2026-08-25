import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiBarChart2, FiLock, FiLogOut } from "react-icons/fi";
import { logout, getStoredUser, ROLES } from "../../api/api";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", roles: null },
  { name: "Elections", path: "/dashboard/elections", roles: null },
  { name: "Biometric", path: "/dashboard/biometric", roles: null },
  { name: "Voters", path: "/dashboard/voters", roles: null },
  { name: "Candidates", path: "/dashboard/candidates", roles: null },
  { name: "Polling Stations", path: "/dashboard/stations", roles: null },
  { name: "Results", path: "/dashboard/results", roles: null },
  { name: "Reports", path: "/dashboard/reports", roles: null },
];

function isAllowed(roles, userRole) {
  if (!roles) return true;
  return roles.includes(userRole);
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = user?.role || "guest";
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
        <div style={{ padding: "8px 10px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 8 }}>
          <div style={{ fontSize: "0.75rem", color: "#8da49c", textTransform: "uppercase", letterSpacing: "0.08em" }}>Signed in</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.full_name || "Election Official"}</div>
          <div style={{ fontSize: "0.7rem", color: "#cbd5e1", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}><FiLock style={{ width: 12, height: 12 }} />{role}</div>
        </div>

        {menuItems.map((item) => {
          const allowed = isAllowed(item.roles, role);
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                isActive ? "dash-menu selected" : "dash-menu"
              }
              style={!allowed ? { opacity: 0.45 } : undefined}
              title={!allowed ? `Requires: ${item.roles?.join(", ")}` : undefined}
            >
              <FiBarChart2 />
              {item.name}
              {!allowed && <FiLock style={{ marginLeft: "auto", width: 12, height: 12, opacity: 0.7 }} />}
            </NavLink>
          );
        })}

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