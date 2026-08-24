import React from "react";

export default function Placeholder({ title }) {
  return (
    <div className="dash-main">
      <div className="dash-heading">
        <div>
          <b>{title}</b>
          <small>Coming soon — module under construction</small>
        </div>
      </div>
      <div className="dash-card">
        <p className="text-muted">
          The <strong>{title}</strong> module is scaffolded. Connect it to the
          backend API (<code>/api/{title.toLowerCase().replace(/\s+/g, "-")}</code>) when ready.
        </p>
      </div>
    </div>
  );
}
