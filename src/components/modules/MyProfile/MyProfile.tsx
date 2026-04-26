"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Image from "next/image";
import {
  Mail, Shield, Edit2, Calendar, Phone,
  User, Clock, ChevronRight, X, Sparkles,
  GraduationCap, Fingerprint, Users,
} from "lucide-react";

interface UserInfo {
  id?: string;
  name: string;
  email: string;
  role: string;
  needPasswordChange?: boolean;
  createdAt?: string;
  updatedAt?: string;
  student?: any;
  [key: string]: any;
}

export default function ProfileClient({ initialUser }: { initialUser: UserInfo }) {
  const [user] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "academic" | "contact">("personal");

  const formatDate = (date?: string) => {
    if (!date) return "—";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric", month: "short", day: "numeric",
    }).format(new Date(date));
  };

  const student = user.student || {};
  const initials = user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2);

  const tabs = [
    { key: "personal", label: "Personal", icon: User },
    { key: "academic", label: "Academic", icon: GraduationCap },
    { key: "contact",  label: "Contact",  icon: Phone },
  ] as const;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .pr-root {
          font-family: 'DM Sans', sans-serif;
          /* NO background — inherits from parent layout */
          color: #1E293B;
          width: 100%;
        }

        .pr-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 28px 64px;
        }

        /* ── Top bar ── */
        .pr-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 36px;
        }
        .pr-breadcrumb {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #94A3B8;
          font-family: 'DM Sans', sans-serif;
        }
        .pr-breadcrumb svg { width: 13px; height: 13px; }
        .pr-breadcrumb-current { color: #334155; font-weight: 500; }
        .pr-edit-btn {
          display: flex; align-items: center; gap: 8px;
          background: #6366F1; border: none; color: #fff;
          padding: 9px 20px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 2px 10px rgba(99,102,241,0.30);
          letter-spacing: 0.1px;
        }
        .pr-edit-btn:hover {
          background: #4F46E5;
          transform: translateY(-1px);
          box-shadow: 0 4px 18px rgba(99,102,241,0.4);
        }
        .pr-edit-btn svg { width: 13px; height: 13px; }

        /* ── Grid layout ── */
        .pr-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 18px;
          align-items: start;
        }
        @media (max-width: 860px) { .pr-grid { grid-template-columns: 1fr; } }

        /* ── Shared card style ── */
        .pr-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        /* ── Sidebar column ── */
        .pr-sidebar { display: flex; flex-direction: column; gap: 14px; }

        /* Identity card */
        .pr-idcard-stripe {
          height: 4px;
          background: linear-gradient(90deg, #6366F1 0%, #8B5CF6 55%, #38BDF8 100%);
        }
        .pr-idcard-body { padding: 22px 22px 20px; }

        .pr-avatar-wrap { position: relative; display: inline-block; margin-bottom: 14px; }
        .pr-avatar {
          width: 68px; height: 68px; border-radius: 14px;
          background: linear-gradient(135deg, #EEF2FF, #E0E7FF);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 22px; color: #6366F1;
          border: 1.5px solid rgba(99,102,241,0.18);
          overflow: hidden;
        }
        .pr-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .pr-avatar-dot {
          position: absolute; bottom: -3px; right: -3px;
          width: 18px; height: 18px; border-radius: 5px;
          background: #10B981; border: 2px solid #fff;
          display: flex; align-items: center; justify-content: center;
        }
        .pr-avatar-dot::after {
          content: ''; width: 6px; height: 6px;
          border-radius: 50%; background: rgba(255,255,255,0.9);
        }

        .pr-name {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 17px; color: #0F172A; line-height: 1.25;
          margin-bottom: 4px;
        }
        .pr-email {
          font-size: 12px; color: #64748B;
          display: flex; align-items: center; gap: 5px;
          margin-bottom: 12px;
        }
        .pr-email svg { width: 11px; height: 11px; flex-shrink: 0; }
        .pr-chip {
          display: inline-flex; align-items: center; gap: 5px;
          background: #EEF2FF; border: 1px solid #C7D2FE;
          padding: 3px 10px; border-radius: 6px;
          font-size: 10px; font-weight: 700; color: #6366F1;
          text-transform: uppercase; letter-spacing: 1.2px;
        }
        .pr-chip svg { width: 10px; height: 10px; }

        .pr-divider { height: 1px; background: #F1F5F9; margin: 16px 0; }

        .pr-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .pr-stat {
          background: #F8FAFC; border: 1px solid #E8ECF0;
          border-radius: 10px; padding: 11px 12px;
          transition: border-color 0.15s;
        }
        .pr-stat:hover { border-color: #C7D2FE; }
        .pr-stat-label {
          font-size: 9px; color: #94A3B8;
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .pr-stat-value {
          font-family: 'Syne', sans-serif;
          font-weight: 700; font-size: 13px; color: #1E293B;
        }
        .pr-stat-value.accent { color: #6366F1; }
        .pr-stat-value.green  { color: #10B981; }

        /* Digital ID card — stays dark as visual anchor */
        .pr-digid {
          background: linear-gradient(135deg, #1E1B4B 0%, #2D2A70 55%, #1A3460 100%);
          border-radius: 16px; padding: 20px;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 20px rgba(99,102,241,0.22);
        }
        .pr-digid::before {
          content: ''; position: absolute;
          top: -40px; right: -40px;
          width: 130px; height: 130px; border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }
        .pr-digid::after {
          content: ''; position: absolute;
          bottom: -30px; left: -20px;
          width: 100px; height: 100px; border-radius: 50%;
          background: rgba(14,165,233,0.10);
        }
        .pr-digid-label {
          font-size: 9px; letter-spacing: 2.5px;
          text-transform: uppercase; color: rgba(255,255,255,0.35);
          display: flex; align-items: center; gap: 7px;
          margin-bottom: 12px;
        }
        .pr-digid-label svg { width: 10px; height: 10px; }
        .pr-digid-label::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(255,255,255,0.1);
        }
        .pr-digid-num {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 28px; letter-spacing: 5px; color: #fff;
          line-height: 1; margin-bottom: 4px;
          position: relative; z-index: 1;
        }
        .pr-digid-dept {
          font-size: 11px; color: #93C5FD;
          margin-bottom: 16px; position: relative; z-index: 1;
        }
        .pr-digid-valid {
          font-size: 10px; color: rgba(255,255,255,0.25);
          display: flex; align-items: center; gap: 5px;
          position: relative; z-index: 1;
        }
        .pr-digid-valid svg { width: 10px; height: 10px; }

        /* Activity */
        .pr-activity-title {
          font-family: 'Syne', sans-serif; font-size: 13px;
          font-weight: 700; color: #0F172A;
          display: flex; align-items: center; gap: 7px;
          padding: 18px 18px 0;
          margin-bottom: 14px;
        }
        .pr-activity-title svg { width: 13px; height: 13px; color: #6366F1; }
        .pr-timeline { padding: 0 18px 18px; display: flex; flex-direction: column; }
        .pr-tl-item {
          display: flex; gap: 12px; padding: 10px 0;
          border-bottom: 1px solid #F8FAFC;
        }
        .pr-tl-item:last-child { border-bottom: none; padding-bottom: 0; }
        .pr-tl-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #6366F1; margin-top: 5px; flex-shrink: 0;
          box-shadow: 0 0 5px rgba(99,102,241,0.45);
        }
        .pr-tl-dot.muted { background: #CBD5E1; box-shadow: none; }
        .pr-tl-text { font-size: 12px; color: #64748B; }
        .pr-tl-text strong { color: #334155; font-weight: 500; }
        .pr-tl-time { font-size: 10px; color: #94A3B8; margin-top: 1px; }

        /* ── Main panel ── */
        .pr-panel-hd { padding: 22px 24px 0; margin-bottom: 0; }
        .pr-panel-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 16px; color: #0F172A;
          display: flex; align-items: center; gap: 8px;
        }
        .pr-panel-title svg { width: 16px; height: 16px; color: #6366F1; }
        .pr-panel-sub { font-size: 12px; color: #94A3B8; margin-top: 2px; }

        /* Tabs */
        .pr-tabs {
          display: flex; gap: 0;
          padding: 0 24px; margin-top: 16px;
          border-bottom: 1px solid #F1F5F9;
        }
        .pr-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px 9px;
          font-size: 13px; font-weight: 500; color: #94A3B8;
          cursor: pointer; border: none; background: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px; transition: all 0.18s;
          font-family: 'DM Sans', sans-serif;
          border-radius: 6px 6px 0 0;
        }
        .pr-tab svg { width: 12px; height: 12px; }
        .pr-tab:hover { color: #6366F1; background: #F5F3FF; }
        .pr-tab.active {
          color: #6366F1; border-bottom-color: #6366F1;
          background: transparent;
        }

        /* Fields */
        .pr-fields {
          display: grid; grid-template-columns: 1fr 1fr;
          padding: 18px 18px 22px; gap: 2px;
        }
        @media (max-width: 600px) { .pr-fields { grid-template-columns: 1fr; } }

        .pr-field {
          padding: 12px 10px; border-radius: 8px;
          transition: background 0.12s;
        }
        .pr-field:hover { background: #F8FAFF; }
        .pr-field.full { grid-column: 1 / -1; }
        .pr-field-label {
          font-size: 10px; text-transform: uppercase;
          letter-spacing: 1.1px; color: #94A3B8; margin-bottom: 4px;
        }
        .pr-field-value {
          font-size: 14px; font-weight: 500; color: #334155; line-height: 1.4;
        }
        .pr-field-value.mono {
          font-family: 'Syne', sans-serif;
          font-weight: 700; font-size: 15px; color: #6366F1;
        }
        .pr-field-sub { font-size: 11px; color: #94A3B8; margin-top: 2px; }

        /* ── Modal ── */
        .pr-backdrop {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(15,23,42,0.45);
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: pr-fi 0.18s ease;
        }
        @keyframes pr-fi { from { opacity: 0; } to { opacity: 1; } }
        .pr-modal {
          background: #fff; border: 1px solid #E2E8F0;
          border-radius: 20px; padding: 40px 32px;
          max-width: 400px; width: 100%; text-align: center;
          position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
          animation: pr-su 0.22s ease;
        }
        @keyframes pr-su {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pr-modal-x {
          position: absolute; top: 14px; right: 14px;
          width: 28px; height: 28px; border-radius: 7px;
          background: #F1F5F9; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #94A3B8; transition: all 0.14s;
        }
        .pr-modal-x:hover { background: #E2E8F0; color: #475569; }
        .pr-modal-x svg { width: 14px; height: 14px; }
        .pr-modal-ico {
          width: 56px; height: 56px; border-radius: 14px;
          background: #EEF2FF; border: 1px solid #C7D2FE;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
        }
        .pr-modal-ico svg { width: 24px; height: 24px; color: #6366F1; }
        .pr-modal-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 20px; color: #0F172A; margin-bottom: 8px;
        }
        .pr-modal-desc {
          font-size: 13px; color: #64748B;
          line-height: 1.65; margin-bottom: 24px;
        }
        .pr-modal-btn {
          width: 100%; padding: 12px;
          background: #6366F1; color: #fff; border: none;
          font-size: 14px; font-weight: 500; border-radius: 10px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 2px 10px rgba(99,102,241,0.3);
          transition: all 0.18s;
        }
        .pr-modal-btn:hover { background: #4F46E5; }

        /* Entrance animations */
        .pr-in { animation: pr-fadeUp 0.4s ease both; }
        .pr-in-1 { animation-delay: 0.04s; }
        .pr-in-2 { animation-delay: 0.09s; }
        .pr-in-3 { animation-delay: 0.14s; }
        .pr-in-4 { animation-delay: 0.06s; }
        @keyframes pr-fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pr-root">
        <div className="pr-wrap">

          {/* Top bar */}
          <div className="pr-topbar pr-in">
            <div className="pr-breadcrumb">
              <span>Dashboard</span>
              <ChevronRight />
              <span className="pr-breadcrumb-current">My Profile</span>
            </div>
      
          </div>

          <div className="pr-grid">

            {/* ── SIDEBAR ── */}
            <div className="pr-sidebar">

              {/* Identity card */}
              <div className="pr-card pr-in pr-in-1">
                <div className="pr-idcard-stripe" />
                <div className="pr-idcard-body">
                  <div className="pr-avatar-wrap">
                    <div className="pr-avatar">
                      {student.profilePhoto
                        ? <Image src={student.profilePhoto} alt={user.name} width={68} height={68} priority />
                        : initials}
                    </div>
                    <div className="pr-avatar-dot" />
                  </div>

                  <div className="pr-name">{user.name}</div>
                  <div className="pr-email"><Mail />{user.email}</div>
                  <div className="pr-chip"><Shield />{user.role}</div>

                  <div className="pr-divider" />

                  <div className="pr-stats">
                    <div className="pr-stat">
                      <div className="pr-stat-label">Roll No.</div>
                      <div className="pr-stat-value accent">{student.roll || "—"}</div>
                    </div>
                    <div className="pr-stat">
                      <div className="pr-stat-label">Status</div>
                      <div className="pr-stat-value green">Active</div>
                    </div>
                    <div className="pr-stat">
                      <div className="pr-stat-label">Joined</div>
                      <div className="pr-stat-value" style={{fontSize:11}}>{formatDate(user.createdAt)}</div>
                    </div>
                    <div className="pr-stat">
                      <div className="pr-stat-label">Year</div>
                      <div className="pr-stat-value" style={{fontSize:12}}>2025–26</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital ID — intentionally dark for contrast */}
              <div className="pr-digid pr-in pr-in-2">
                <div className="pr-digid-label">
                  <Fingerprint style={{width:10,height:10}} />Student ID
                </div>
                <div className="pr-digid-num">{student.roll || "——"}</div>
                <div className="pr-digid-dept">
                  {student.department?.name || "Computer Science & Technology"}
                </div>
                <div className="pr-digid-valid">
                  <Calendar />Valid until June 2027
                </div>
              </div>

              {/* Activity */}
              <div className="pr-card pr-in pr-in-3">
                <div className="pr-activity-title"><Clock />Recent Activity</div>
                <div className="pr-timeline">
                  {[
                    { label: "Profile viewed",  time: "Just now",               active: true },
                    { label: "Profile updated", time: formatDate(user.updatedAt), active: false },
                    { label: "Account created", time: formatDate(user.createdAt), active: false },
                  ].map((ev, i) => (
                    <div className="pr-tl-item" key={i}>
                      <div className={`pr-tl-dot${ev.active ? "" : " muted"}`} />
                      <div>
                        <div className="pr-tl-text"><strong>{ev.label}</strong></div>
                        <div className="pr-tl-time">{ev.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── MAIN PANEL ── */}
            <div className="pr-card pr-in pr-in-4">
              <div className="pr-panel-hd">
                <div className="pr-panel-title"><Users />Student Profile</div>
                <div className="pr-panel-sub">Complete academic and personal information</div>
              </div>

              <div className="pr-tabs">
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    className={`pr-tab${activeTab === key ? " active" : ""}`}
                    onClick={() => setActiveTab(key)}
                  >
                    <Icon />{label}
                  </button>
                ))}
              </div>

              {activeTab === "personal" && (
                <div className="pr-fields">
                  <Field label="Full Name"         value={student.name || user.name} />
                  <Field label="Gender"            value={student.gender} />
                  <Field label="Date of Birth"     value={formatDate(student.birthDate)} />
                  <Field label="Father's Name"     value={student.fatherName} />
                  <Field label="Mother's Name"     value={student.motherName} />
                  <Field label="Last Updated"      value={formatDate(user.updatedAt)} />
                  <Field label="Present Address"   value={student.presentAddress}   full />
                  <Field label="Permanent Address" value={student.permanentAddress} full />
                </div>
              )}

              {activeTab === "academic" && (
                <div className="pr-fields">
                  <Field label="Roll Number"      value={student.roll}             mono />
                  <Field label="Registration No." value={student.registration}     mono />
                  <Field label="Department"       value={student.department?.name} sub={student.department?.shortName} />
                  <Field label="Group"            value={student.group?.name}      sub={`Session: ${student.group?.session || "—"}`} />
                  <Field label="Academic Year"    value="2025 – 2026" />
                  <Field label="Account Role"     value={user.role} />
                </div>
              )}

              {activeTab === "contact" && (
                <div className="pr-fields">
                  <Field label="Email Address"     value={user.email} />
                  <Field label="Mobile Number"     value={student.mobile} />
                  <Field label="Present Address"   value={student.presentAddress}   full />
                  <Field label="Permanent Address" value={student.permanentAddress} full />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit modal */}
        {isEditing && (
          <div className="pr-backdrop" onClick={() => setIsEditing(false)}>
            <div className="pr-modal" onClick={e => e.stopPropagation()}>
              <button className="pr-modal-x" onClick={() => setIsEditing(false)}><X /></button>
              <div className="pr-modal-ico"><Sparkles /></div>
              <div className="pr-modal-title">Profile Editing</div>
              <div className="pr-modal-desc">
                Full editing is on the way. You will soon be able to update your personal details, contact info, and profile photo.
              </div>
              <button className="pr-modal-btn" onClick={() => setIsEditing(false)}>Got it</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Field({
  label, value, sub, mono = false, full = false,
}: {
  label: string; value?: any; sub?: string; mono?: boolean; full?: boolean;
}) {
  return (
    <div className={`pr-field${full ? " full" : ""}`}>
      <div className="pr-field-label">{label}</div>
      <div className={`pr-field-value${mono ? " mono" : ""}`}>{value || "—"}</div>
      {sub && <div className="pr-field-sub">{sub}</div>}
    </div>
  );
}