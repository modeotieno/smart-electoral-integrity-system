import React from "react";
import { FiBarChart2 } from "react-icons/fi";

export default function DashboardOverview() {
  return (
    <div className="dash-main">
      <div className="dash-heading">
        <div>
          <b>Welcome, Election Official</b>
          <small>General overview of the election</small>
        </div>
      </div>

      <div className="dash-cards">
        <div>
          <small>Registered Voters</small>
          <b>2.5M+</b>
        </div>

        <div>
          <small>Candidates</small>
          <b>18</b>
        </div>

        <div>
          <small>Polling Stations</small>
          <b>1,250</b>
        </div>
      </div>
    </div>
  );
}