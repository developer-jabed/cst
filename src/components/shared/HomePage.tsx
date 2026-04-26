"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --ink: #1a1f2e;
          --ink-mid: #4a5168;
          --ink-faint: #8b91a6;
          --gold: #b5832a;
          --gold-dim: rgba(181,131,42,0.1);
          --gold-rule: rgba(181,131,42,0.25);
          --bg: #f0ede6;
          --bg2: #e8e4db;
          --bg3: #faf9f6;
          --white: #ffffff;
          --rule: rgba(26,31,46,0.08);
          --rule-mid: rgba(26,31,46,0.14);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; color: var(--ink); background: var(--bg); overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu  { animation: fadeUp 0.6s ease both; }
        .fu1 { animation-delay: 0.05s; }
        .fu2 { animation-delay: 0.15s; }
        .fu3 { animation-delay: 0.25s; }
        .fu4 { animation-delay: 0.35s; }
        .fu5 { animation-delay: 0.45s; }
        .fu6 { animation-delay: 0.55s; }

        /* ── HERO ── */
        .hero { background: var(--bg3); border-bottom: 1px solid var(--rule); display: grid; grid-template-columns: 1fr 1fr; min-height: 90vh; }
        .hero-left { padding: 100px 4rem 5rem 5rem; display: flex; flex-direction: column; justify-content: center; border-right: 1px solid var(--rule); }
        .eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 1.75rem; }
        .eyebrow-line { width: 28px; height: 1px; background: var(--gold); }
        .eyebrow-txt { font-size: 10px; font-weight: 500; letter-spacing: 3.5px; text-transform: uppercase; color: var(--gold); }
        .hero-h1 { font-family: 'Playfair Display', serif; font-size: clamp(2.4rem, 4.5vw, 3.8rem); font-weight: 700; color: var(--ink); line-height: 1.1; letter-spacing: -0.5px; margin-bottom: 1.25rem; }
        .hero-h1 em { font-style: italic; color: var(--gold); }
        .hero-sub { font-size: 14.5px; font-weight: 300; color: var(--ink-mid); line-height: 1.85; max-width: 400px; margin-bottom: 2.5rem; }
        .hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }
        .btn-p { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: #fff; background: var(--gold); padding: 13px 26px; border: none; cursor: pointer; transition: opacity 0.2s, box-shadow 0.2s; }
        .btn-p:hover { opacity: 0.88; box-shadow: 0 6px 24px rgba(181,131,42,0.3); }
        .btn-g { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; color: var(--ink-mid); background: transparent; border: 1px solid var(--rule-mid); padding: 12px 22px; cursor: pointer; transition: all 0.2s; }
        .btn-g:hover { color: var(--ink); border-color: var(--ink-mid); }

        .hero-right { padding: 100px 4rem 5rem; display: flex; flex-direction: column; justify-content: center; gap: 1.25rem; background: var(--bg); }
        .hcard { border: 1px solid var(--rule); padding: 20px; background: var(--white); transition: border-color 0.2s, box-shadow 0.2s; }
        .hcard:hover { border-color: var(--gold-rule); box-shadow: 0 4px 20px rgba(26,31,46,0.06); }
        .hcard-lbl { font-size: 9px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 5px; }
        .hcard-ttl { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 5px; line-height: 1.3; }
        .hcard-txt { font-size: 12px; color: var(--ink-faint); line-height: 1.6; font-weight: 300; }

        /* ── STATS ── */
        .stats { background: var(--ink); }
        .stats-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); }
        .stat { padding: 2.75rem 2rem; border-right: 1px solid rgba(255,255,255,0.06); text-align: center; }
        .stat:last-child { border-right: none; }
        .stat-n { font-family: 'Playfair Display', serif; font-size: 2.6rem; font-weight: 600; color: var(--gold); line-height: 1; margin-bottom: 6px; letter-spacing: -1px; }
        .stat-l { font-size: 10px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.3); }

        /* ── ABOUT ── */
        .about { background: var(--bg2); padding: 5.5rem 0; }
        .about-inner { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: grid; grid-template-columns: 1fr 1.6fr; gap: 5rem; align-items: center; }
        .sec-lbl { display: flex; align-items: center; gap: 10px; margin-bottom: 1.25rem; }
        .sec-line { width: 26px; height: 1px; background: var(--gold); }
        .sec-tag { font-size: 10px; font-weight: 500; letter-spacing: 3.5px; text-transform: uppercase; color: var(--gold); }
        .about-h2 { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 3vw, 2.5rem); font-weight: 600; color: var(--ink); line-height: 1.2; }
        .about-body { font-size: 14px; color: var(--ink-mid); line-height: 1.85; font-weight: 300; margin-bottom: 1rem; }
        .pillars { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px; background: var(--rule); border: 1px solid var(--rule); margin-top: 1.25rem; }
        .pillar { background: var(--white); padding: 18px 14px; text-align: center; transition: background 0.15s; }
        .pillar:hover { background: var(--gold-dim); }
        .pillar-ico { color: var(--gold); margin-bottom: 6px; display: flex; justify-content: center; }
        .pillar-nm { font-size: 10px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink); }

        /* ── PROGRAMS ── */
        .programs { background: var(--bg3); padding: 5.5rem 0; }
        .sec-head { max-width: 1200px; margin: 0 auto 3rem; padding: 0 2rem; display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; }
        .sec-h2 { font-family: 'Playfair Display', serif; font-size: clamp(1.6rem, 2.8vw, 2.2rem); font-weight: 600; color: var(--ink); letter-spacing: -0.3px; }
        .view-all { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink-mid); border-bottom: 1px solid var(--rule-mid); padding-bottom: 3px; transition: color 0.2s, gap 0.2s; }
        .view-all:hover { color: var(--gold); gap: 9px; border-bottom-color: var(--gold-rule); }
        .progs { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--rule); border: 1px solid var(--rule); }
        .prog { background: var(--white); padding: 1.75rem; display: flex; flex-direction: column; position: relative; transition: background 0.2s; overflow: hidden; }
        .prog::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: var(--gold); transform: scaleX(0); transform-origin: left; transition: transform 0.3s ease; }
        .prog:hover { background: var(--bg); }
        .prog:hover::after { transform: scaleX(1); }
        .prog-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem; }
        .prog-ico { width: 38px; height: 38px; border: 1px solid var(--rule-mid); display: flex; align-items: center; justify-content: center; color: var(--gold); }
        .prog-code { font-size: 9px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--ink-faint); background: var(--bg); border: 1px solid var(--rule); padding: 4px 8px; }
        .prog-ttl { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600; color: var(--ink); line-height: 1.3; margin-bottom: 8px; }
        .prog-desc { font-size: 12.5px; color: var(--ink-mid); line-height: 1.75; font-weight: 300; flex: 1; margin-bottom: 1.1rem; }
        .prog-meta { display: flex; gap: 14px; padding-top: 0.9rem; border-top: 1px solid var(--rule); }
        .prog-mi { font-size: 11px; color: var(--ink-faint); }
        .prog-mi strong { color: var(--ink-mid); font-weight: 500; display: block; font-size: 12px; margin-bottom: 1px; }

        /* ── BENTO ── */
        .bento { background: var(--bg2); padding: 5.5rem 0; }
        .bento-grid { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: grid; grid-template-columns: repeat(12, 1fr); gap: 10px; }
        .bc { background: var(--white); border: 1px solid var(--rule); padding: 1.75rem; position: relative; transition: border-color 0.2s, box-shadow 0.2s; overflow: hidden; }
        .bc:hover { border-color: var(--rule-mid); box-shadow: 0 6px 30px rgba(26,31,46,0.05); }
        .bc.s5 { grid-column: span 5; }
        .bc.s7 { grid-column: span 7; }
        .bc.s4 { grid-column: span 4; }
        .bc.s6 { grid-column: span 6; }
        .bc.sage { background: #dde8df; border-color: transparent; }
        .bc-tag { font-size: 9px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }
        .bc-n { font-family: 'Playfair Display', serif; font-size: 3.5rem; font-weight: 600; color: var(--gold); line-height: 1; margin-bottom: 4px; letter-spacing: -2px; }
        .bc-ttl { font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 600; color: var(--ink); line-height: 1.25; margin-bottom: 8px; }
        .bc.sage .bc-ttl { color: #1a2d1c; }
        .bc-body { font-size: 13px; color: var(--ink-mid); line-height: 1.75; font-weight: 300; }
        .bc.sage .bc-body { color: #3a5040; }
        .bc-quote { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-style: italic; color: #2d4030; line-height: 1.6; margin-bottom: 1rem; }
        .bc-attr { font-size: 11px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: #4a7050; }
        .bc-list { display: flex; flex-direction: column; margin-top: 0.9rem; }
        .bc-li { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--rule); font-size: 12px; color: var(--ink-mid); }
        .bc-li:last-child { border-bottom: none; }
        .bc-dot { width: 4px; height: 4px; background: var(--gold); flex-shrink: 0; }

        /* ── NEWS ── */
        .news { background: var(--bg3); padding: 5.5rem 0; }
        .news-grid { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--rule); border: 1px solid var(--rule); }
        .ncard { background: var(--white); padding: 1.75rem; display: flex; flex-direction: column; transition: background 0.2s; }
        .ncard:hover { background: var(--bg); }
        .ntop { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.9rem; }
        .ntag { font-size: 9px; font-weight: 500; letter-spacing: 2.5px; text-transform: uppercase; color: var(--gold); background: var(--gold-dim); border: 1px solid var(--gold-rule); padding: 4px 10px; }
        .ndate { font-size: 11px; color: var(--ink-faint); font-weight: 300; }
        .nttl { font-family: 'Playfair Display', serif; font-size: 15.5px; font-weight: 600; color: var(--ink); line-height: 1.4; margin-bottom: 8px; }
        .nexc { font-size: 12.5px; color: var(--ink-mid); line-height: 1.7; font-weight: 300; flex: 1; margin-bottom: 1.1rem; }
        .nrd { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink-faint); transition: color 0.2s; }
        .ncard:hover .nrd { color: var(--gold); }

        /* ── CTA ── */
        .cta { background: var(--bg2); padding: 5.5rem 0; border-top: 1px solid var(--rule); }
        .cta-inner { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: grid; grid-template-columns: 1.2fr 1fr; gap: 4rem; align-items: center; }
        .cta-h2 { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 3vw, 2.7rem); font-weight: 700; color: var(--ink); line-height: 1.15; letter-spacing: -0.5px; margin-bottom: 0.9rem; }
        .cta-h2 em { font-style: italic; color: var(--gold); }
        .cta-sub { font-size: 13.5px; color: var(--ink-mid); line-height: 1.8; font-weight: 300; max-width: 420px; }
        .cta-right { display: flex; flex-direction: column; gap: 10px; border-left: 1px solid var(--rule); padding-left: 3.5rem; }
        .cta-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 1px solid var(--rule); text-decoration: none; transition: all 0.2s; background: var(--white); }
        .cta-item:hover { background: var(--gold-dim); border-color: var(--gold-rule); }
        .cta-ico { width: 34px; height: 34px; border: 1px solid var(--gold-rule); display: flex; align-items: center; justify-content: center; color: var(--gold); flex-shrink: 0; }
        .cta-ttl { font-size: 12.5px; font-weight: 500; color: var(--ink); margin-bottom: 2px; }
        .cta-s { font-size: 11px; color: var(--ink-faint); font-weight: 300; }
        .cta-arr { color: var(--gold-rule); font-size: 14px; }
        .cta-item:hover .cta-arr { color: var(--gold); }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; min-height: auto; }
          .hero-left { padding: 90px 2rem 3rem; }
          .hero-right { display: none; }
          .stats-inner { grid-template-columns: repeat(2, 1fr); }
          .about-inner { grid-template-columns: 1fr; gap: 2rem; }
          .progs { grid-template-columns: repeat(2, 1fr); }
          .bc.s5, .bc.s7, .bc.s4, .bc.s6 { grid-column: span 12; }
          .news-grid { grid-template-columns: 1fr; }
          .cta-inner { grid-template-columns: 1fr; }
          .cta-right { border-left: none; padding-left: 0; border-top: 1px solid var(--rule); padding-top: 1.5rem; }
          .sec-head { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
        }
        @media (max-width: 600px) {
          .progs { grid-template-columns: 1fr; }
          .pillars { grid-template-columns: 1fr; }
          .stats-inner { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <main>

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-left">
            <div className="eyebrow fu fu1">
              <div className="eyebrow-line" />
              <span className="eyebrow-txt">Est. 1998 · Dhaka, Bangladesh</span>
            </div>
            <h1 className="hero-h1 fu fu2">
              Where Curiosity<br />Becomes <em>Discovery</em>
            </h1>
            <p className="hero-sub fu fu3">
              C·S·T Institute has guided over a generation of scholars through rigorous science and technology education — building careers, advancing research, and shaping the future of Bangladesh.
            </p>
            <div className="hero-btns fu fu4">
              <Link href="/admissions" className="btn-p">Apply Now →</Link>
              <Link href="/programs" className="btn-g">Explore Programs</Link>
            </div>
          </div>
          <div className="hero-right">
            {[
              { lbl: "Academic Excellence", ttl: "Ranked among Bangladesh's top science institutes", txt: "Consistent recognition for research output, graduate outcomes, and faculty distinction since 2004." },
              { lbl: "Research", ttl: "Active research across six core disciplines", txt: "Faculty and graduate students publish in international peer-reviewed journals every semester." },
              { lbl: "Community", ttl: "A network of 12,000+ alumni worldwide", txt: "Our graduates lead research labs, companies, and policy bodies across Bangladesh and beyond." },
            ].map((c, i) => (
              <div key={i} className={`hcard fu fu${i + 2}`}>
                <div className="hcard-lbl">{c.lbl}</div>
                <div className="hcard-ttl">{c.ttl}</div>
                <div className="hcard-txt">{c.txt}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="stats">
          <div className="stats-inner">
            {[
              { n: "4800+", l: "Students Enrolled" },
              { n: "26",    l: "Years of Excellence" },
              { n: "94%",   l: "Graduate Employment" },
              { n: "180+",  l: "Faculty Members" },
            ].map((s) => (
              <div key={s.l} className="stat">
                <div className="stat-n">{s.n}</div>
                <div className="stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section className="about">
          <div className="about-inner">
            <div>
              <div className="sec-lbl"><div className="sec-line" /><span className="sec-tag">Our Mission</span></div>
              <h2 className="about-h2">Principled education.<br />Enduring impact.</h2>
            </div>
            <div>
              <p className="about-body">
                Founded in 1998, C·S·T Institute was established with a singular conviction: that rigorous, principled scientific education is the foundation of a societys progress. Over twenty-six years, we have cultivated that conviction into a living institution — defined by scholarship, graduate achievement, and research depth.
              </p>
              <p className="about-body">
                Our faculty bring international experience to the classroom. Our laboratories are equipped for contemporary research. Our programmes are designed not merely to confer degrees, but to develop scientists, technologists, and thinkers who make a genuine difference.
              </p>
              <div className="pillars">
                {[
                  { name: "Teaching",  icon: <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" /> },
                  { name: "Research",  icon: <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.4 2.798H4.198c-1.43 0-2.4-1.798-1.4-2.798L4.2 15.3" /> },
                  { name: "Community", icon: <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /> },
                ].map((p) => (
                  <div key={p.name} className="pillar">
                    <div className="pillar-ico">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">{p.icon}</svg>
                    </div>
                    <div className="pillar-nm">{p.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PROGRAMS ── */}
        <section className="programs">
          <div className="sec-head">
            <div>
              <div className="sec-lbl"><div className="sec-line" /><span className="sec-tag">Academics</span></div>
              <h2 className="sec-h2">Programmes of Study</h2>
            </div>
            <Link href="/programs" className="view-all">All Programmes ›</Link>
          </div>
          <div className="progs">
            {[
              { code: "BSc", ttl: "Mathematics & Statistics", desc: "Rigorous foundations in pure and applied mathematics, statistical modelling, and computational methods.", dur: "4 Years", seats: "60 Seats" },
              { code: "BSc", ttl: "Chemistry",                desc: "From organic synthesis to analytical chemistry — a comprehensive journey through molecular science.", dur: "4 Years", seats: "60 Seats" },
              { code: "BSc", ttl: "Biology & Life Sciences",  desc: "Exploring living systems at every scale — cellular, ecological, and evolutionary biology.", dur: "4 Years", seats: "60 Seats" },
              { code: "BSc", ttl: "Computer Science",         desc: "Algorithms, systems design, AI, and software engineering for the technology-driven world.", dur: "4 Years", seats: "80 Seats" },
              { code: "MSc", ttl: "Environmental Science",    desc: "Interdisciplinary study of Earth systems, climate, and sustainable resource management.", dur: "2 Years", seats: "40 Seats" },
              { code: "MSc", ttl: "Physics",                  desc: "Advanced theoretical and experimental physics including quantum mechanics and condensed matter.", dur: "2 Years", seats: "40 Seats" },
            ].map((p) => (
              <div key={p.ttl} className="prog">
                <div className="prog-head">
                  <div className="prog-ico">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.4 2.798H4.198c-1.43 0-2.4-1.798-1.4-2.798L4.2 15.3" />
                    </svg>
                  </div>
                  <div className="prog-code">{p.code}</div>
                </div>
                <div className="prog-ttl">{p.ttl}</div>
                <div className="prog-desc">{p.desc}</div>
                <div className="prog-meta">
                  <div className="prog-mi"><strong>{p.dur}</strong>Duration</div>
                  <div className="prog-mi"><strong>{p.seats}</strong>Intake</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BENTO ── */}
        <section className="bento">
          <div className="sec-head">
            <div>
              <div className="sec-lbl"><div className="sec-line" /><span className="sec-tag">Campus Life</span></div>
              <h2 className="sec-h2">Life at C·S·T</h2>
            </div>
          </div>
          <div className="bento-grid">
            <div className="bc s5">
              <div className="bc-tag">Research Output</div>
              <div className="bc-n">340+</div>
              <div className="bc-ttl">Publications in the last five years</div>
              <div className="bc-body">Our faculty and graduate students publish consistently in peer-reviewed international journals across all disciplines.</div>
            </div>
            <div className="bc s7 sage" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="bc-tag">Student Voice</div>
                <div className="bc-quote"> The rigour of the programme challenged me in ways I did not expect — and prepared me for a research career I could not have imagined.</div>
              </div>
              <div className="bc-attr">Dr. Nusrat Jahan · MSc Biology  19 · Now at ICDDR,B</div>
            </div>
            <div className="bc s4">
              <div className="bc-tag">Facilities</div>
              <div className="bc-ttl">Modern Laboratories</div>
              <div className="bc-body">Eight fully-equipped research labs, a dedicated computing cluster, and a central library with 60,000+ volumes.</div>
            </div>
            <div className="bc s4">
              <div className="bc-tag">Scholarships</div>
              <div className="bc-n" style={{ fontSize: "2.8rem" }}>৳2Cr+</div>
              <div className="bc-body">In merit and need-based scholarships awarded annually to qualifying students.</div>
            </div>
            <div className="bc s4">
              <div className="bc-tag">Student Clubs</div>
              <div className="bc-ttl">14 Active Societies</div>
              <div className="bc-list">
                {["Science Olympiad Team", "Robotics & AI Club", "Debate Society", "Environmental Forum"].map((c) => (
                  <div key={c} className="bc-li"><div className="bc-dot" />{c}</div>
                ))}
              </div>
            </div>
            <div className="bc s6">
              <div className="bc-tag">Industry Linkages</div>
              <div className="bc-ttl">Partnerships with Leading Institutions</div>
              <div className="bc-body">Formal partnerships with Dhaka University, BUET, and three international universities facilitate student exchange, joint research, and co-supervision of postgraduate work.</div>
            </div>
            <div className="bc s6">
              <div className="bc-tag">Career Outcomes</div>
              <div className="bc-n" style={{ fontSize: "2.8rem" }}>94%</div>
              <div className="bc-ttl">Graduate Employment Rate</div>
              <div className="bc-body">Within 12 months of graduation, measured across the last three cohorts. Our career services office supports students from year one.</div>
            </div>
          </div>
        </section>

        {/* ── NEWS ── */}
        <section className="news">
          <div className="sec-head">
            <div>
              <div className="sec-lbl"><div className="sec-line" /><span className="sec-tag">Latest</span></div>
              <h2 className="sec-h2">News &amp; Announcements</h2>
            </div>
            <Link href="/news" className="view-all">All News ›</Link>
          </div>
          <div className="news-grid">
            {[
              { tag: "Research",   date: "April 18, 2026", ttl: "CST Researchers Publish Findings on Adaptive Neural Systems in Nature Communications", exc: "A collaborative team from the Department of Computer Science and Biology has achieved a major milestone in bio-inspired computing." },
              { tag: "Admissions", date: "April 10, 2026", ttl: "Undergraduate Admissions Open for Academic Year 2026–27",                           exc: "Applications are now being accepted for all undergraduate programmes. Merit-based scholarships available for qualifying students." },
              { tag: "Events",     date: "March 29, 2026", ttl: "Annual Science Symposium Draws 600 Attendees from Across the Region",                exc: "The 14th Annual CST Science Symposium featured keynote addresses by distinguished researchers and over 80 student presentations." },
            ].map((n) => (
              <Link key={n.ttl} href="/news" className="ncard">
                <div className="ntop">
                  <span className="ntag">{n.tag}</span>
                  <span className="ndate">{n.date}</span>
                </div>
                <div className="nttl">{n.ttl}</div>
                <div className="nexc">{n.exc}</div>
                <div className="nrd">Read More →</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta">
          <div className="cta-inner">
            <div>
              <div className="sec-lbl" style={{ marginBottom: "1rem" }}><div className="sec-line" /><span className="sec-tag">Join Us</span></div>
              <h2 className="cta-h2">Begin your journey<br />toward <em>excellence</em></h2>
              <p className="cta-sub">Applications for the 2026–27 academic year are now open. Take the first step toward a distinguished education at C·S·T Institute.</p>
            </div>
            <div className="cta-right">
              {[
                { ttl: "Undergraduate Admissions", s: "BSc programmes · September intake",    href: "/admissions" },
                { ttl: "Postgraduate Admissions",  s: "MSc & MPhil · Rolling applications",  href: "/admissions/postgraduate" },
                { ttl: "Research Opportunities",   s: "PhD positions & faculty fellowships",  href: "/research" },
                { ttl: "Contact Admissions",       s: "Speak with our team directly",         href: "/contact" },
              ].map((item) => (
                <Link key={item.ttl} href={item.href} className="cta-item">
                  <div className="cta-ico">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="cta-ttl">{item.ttl}</div>
                    <div className="cta-s">{item.s}</div>
                  </div>
                  <span className="cta-arr">›</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
    </>
  );
}