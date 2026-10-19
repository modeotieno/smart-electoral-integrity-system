import React from "react";

export function VotingScene() {
  return (
    <section className="section voting-section">
      <div className="section-heading">
        <span className="eyebrow">LIVE DEMO</span>
        <h2>See Democracy in Action</h2>
        <p>
          Watch citizens securely cast their ballots — every vote encrypted,
          verified and counted in real time.
        </p>
      </div>

      <div className="voting-frame">
        <div className="voting-frame-bar">
          <span className="voting-live">
            <span className="voting-live-dot" /> LIVE
          </span>
          <span className="voting-frame-title">
            Polling Station 1250 — National General Election
          </span>
          <span className="voting-frame-time">08:00 – 17:00</span>
        </div>

        <svg
          className="voting-svg"
          viewBox="0 0 640 360"
          role="img"
          aria-label="Animated scene of people voting at a polling station"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vs-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b1220" />
              <stop offset="100%" stopColor="#111c31" />
            </linearGradient>
            <linearGradient id="vs-box" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#20c77a" />
              <stop offset="100%" stopColor="#16a66a" />
            </linearGradient>
            <linearGradient id="vs-shirt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="vs-shirt2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="vs-shirt3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect width="640" height="360" fill="url(#vs-sky)" rx="12" />
          <ellipse cx="320" cy="330" rx="300" ry="26" fill="#0a101c" opacity="0.7" />

          {/* Polling booth with privacy curtain (left) */}
          <g className="vs-booth">
            <rect x="40" y="120" width="120" height="150" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <rect x="52" y="136" width="96" height="110" rx="6" fill="#0f172a" />
            <path className="vs-curtain" d="M52 136 h96 v18 q-24 10 -48 0 q-24 10 -48 0 z" fill="#16a66a" opacity="0.9" />
            <rect x="66" y="176" width="68" height="10" rx="3" fill="#334155" />
            <rect x="86" y="196" width="28" height="36" rx="4" fill="#475569" />
            <text x="100" y="290" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="1.5">BOOTH</text>
          </g>

          {/* Queue person 3 (back of line) */}
          <g className="vs-voter vs-voter-b" transform="translate(196,0)">
            <ellipse cx="0" cy="318" rx="26" ry="7" fill="#000" opacity="0.35" />
            <rect x="-14" y="252" width="10" height="52" rx="5" fill="#334155" />
            <rect x="4" y="252" width="10" height="52" rx="5" fill="#334155" />
            <rect x="-20" y="188" width="40" height="72" rx="14" fill="url(#vs-shirt3)" />
            <rect x="-26" y="196" width="10" height="46" rx="5" fill="#fbbf24" />
            <rect x="16" y="196" width="10" height="46" rx="5" fill="#fbbf24" />
            <circle cx="0" cy="168" r="18" fill="#fcd9b8" />
            <path d="M-18 164 a18 14 0 0 1 36 0 v-4 a18 12 0 0 0 -36 0 z" fill="#1f2937" />
          </g>

          {/* Queue person 2 */}
          <g className="vs-voter vs-voter-a" transform="translate(268,0)">
            <ellipse cx="0" cy="318" rx="28" ry="7" fill="#000" opacity="0.35" />
            <rect x="-15" y="250" width="11" height="54" rx="5" fill="#1e3a5f" />
            <rect x="4" y="250" width="11" height="54" rx="5" fill="#1e3a5f" />
            <rect x="-22" y="182" width="44" height="76" rx="15" fill="url(#vs-shirt2)" />
            <rect x="-29" y="190" width="11" height="50" rx="5" fill="#c4b5fd" />
            <rect x="18" y="190" width="11" height="50" rx="5" fill="#c4b5fd" />
            <circle cx="0" cy="160" r="19" fill="#e8b48a" />
            <path d="M-19 156 a19 14 0 0 1 38 0 v-5 a19 12 0 0 0 -38 0 z" fill="#27272a" />
            {/* phone in hand */}
            <rect x="20" y="232" width="12" height="18" rx="3" fill="#0ea5e9" />
          </g>

          {/* Active voter dropping ballot */}
          <g className="vs-voter vs-active" transform="translate(400,0)">
            <ellipse cx="0" cy="318" rx="30" ry="8" fill="#000" opacity="0.4" />
            <rect x="-16" y="248" width="12" height="56" rx="6" fill="#0f172a" />
            <rect x="4" y="248" width="12" height="56" rx="6" fill="#0f172a" />
            <rect x="-24" y="176" width="48" height="80" rx="16" fill="url(#vs-shirt)" />
            <rect x="-31" y="184" width="12" height="52" rx="6" fill="#93c5fd" />
            {/* static arm */}
            <rect x="19" y="184" width="12" height="44" rx="6" fill="#93c5fd" />
            <circle cx="25" cy="232" r="7" fill="#fcd9b8" />
            {/* animated arm holding ballot */}
            <g className="vs-arm">
              <rect x="-36" y="120" width="12" height="60" rx="6" fill="#93c5fd" transform="rotate(-35 -30 150)" />
              <circle cx="-8" cy="122" r="7" fill="#fcd9b8" />
            </g>
            <circle cx="0" cy="152" r="20" fill="#fcd9b8" />
            <path d="M-20 148 a20 15 0 0 1 40 0 v-5 a20 13 0 0 0 -40 0 z" fill="#3f2d1e" />
            {/* face */}
            <circle cx="-6" cy="154" r="1.8" fill="#1f2937" />
            <circle cx="7" cy="154" r="1.8" fill="#1f2937" />
            <path d="M-5 162 q6 5 12 0" stroke="#1f2937" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </g>

          {/* Ballot paper falling into the box */}
          <g className="vs-ballot">
            <rect x="466" y="176" width="30" height="40" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M472 186 h18 M472 193 h18 M472 200 h12" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M486 204 l4 4 l8 -9" stroke="#16a66a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Ballot box */}
          <g className="vs-box">
            <rect x="450" y="230" width="90" height="70" rx="8" fill="url(#vs-box)" />
            <rect x="450" y="222" width="90" height="16" rx="5" fill="#0f9d58" />
            <rect x="472" y="226" width="46" height="6" rx="3" fill="#06281a" />
            <rect x="462" y="248" width="66" height="6" rx="3" fill="#0e8a56" opacity="0.8" />
            <text x="495" y="278" textAnchor="middle" fill="#eafff4" fontSize="12" fontWeight="800" letterSpacing="2">VOTE</text>
          </g>

          {/* Polling official with clipboard (right) */}
          <g className="vs-official">
            <ellipse cx="580" cy="318" rx="26" ry="7" fill="#000" opacity="0.35" />
            <rect x="-14" y="252" width="10" height="52" rx="5" fill="#334155" transform="translate(580,0)" />
            <rect x="4" y="252" width="10" height="52" rx="5" fill="#334155" transform="translate(580,0)" />
            <rect x="-20" y="188" width="40" height="70" rx="14" fill="#e2e8f0" transform="translate(580,0)" />
            <circle cx="580" cy="168" r="18" fill="#d9a06a" />
            <path d="M562 164 a18 13 0 0 1 36 0 v-4 a18 11 0 0 0 -36 0 z" fill="#4b5563" />
            <rect x="548" y="208" width="22" height="28" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M553 216 h12 M553 222 h12 M553 228 h8" stroke="#16a66a" strokeWidth="1.6" strokeLinecap="round" />
            {/* badge */}
            <circle cx="592" cy="210" r="6" fill="#16a66a" />
            <path d="M589 210 l2 2 l4 -4" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </g>

          {/* Floating verified check badge */}
          <g className="vs-check">
            <circle cx="495" cy="140" r="22" fill="#0b1220" stroke="#16a66a" strokeWidth="2.5" />
            <path d="M485 140 l7 7 l14 -14" stroke="#20c77a" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Secure connection line box -> official */}
          <path className="vs-signal" d="M540 260 q20 10 40 -20" stroke="#20c77a" strokeWidth="2" fill="none" strokeDasharray="4 6" strokeLinecap="round" />
        </svg>

        <div className="voting-frame-footer">
          <div className="voting-meter">
            <span>Ballots cast</span>
            <div className="voting-meter-bar">
              <div className="voting-meter-fill" />
            </div>
            <b>1,842,301 / 2,500,000</b>
          </div>
          <div className="voting-tags">
            <span className="voting-tag">End-to-end encrypted</span>
            <span className="voting-tag">Cryptographically verified</span>
            <span className="voting-tag">99.9% uptime</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VotingScene;
