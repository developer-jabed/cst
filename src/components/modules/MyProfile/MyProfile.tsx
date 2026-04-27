/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Mail, Shield, Edit2, Calendar, Phone, User, Clock,
  ChevronRight, X, GraduationCap, Fingerprint, Users,
  Upload, Save, Lock, CheckCircle, Loader2,
} from "lucide-react";
import { updateProfile } from "@/service/student/student.service";


interface UserInfo {
  id?: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  student?: any;
  [key: string]: any;
}

type ViewTab  = "personal" | "academic" | "contact";
type ModalTab = "personal" | "academic" | "contact";

export default function ProfileClient({ initialUser }: { initialUser: UserInfo }) {
  const [user]          = useState(initialUser);
  const [viewTab, setViewTab]   = useState<ViewTab>("personal");
  const [isEditing, setIsEditing]     = useState(false);
  const [modalTab, setModalTab]       = useState<ModalTab>("personal");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving]       = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);



  const fmt = (d?: string) =>
    d ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(d)) : "—";
  const toDate = (d?: string) => d ? new Date(d).toISOString().split("T")[0] : "";

  const student  = user.student || {};
    console.log(student)
  const initials = user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const openEdit = () => { setIsEditing(true); setModalTab("personal"); setSaveSuccess(false); };
  const closeEdit = () => { if (!isSaving) setIsEditing(false); };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPhotoPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.append("role", user.role);
    if (user.id) fd.append("id", user.id);
    if (fileRef.current?.files?.[0]) fd.append("file", fileRef.current.files[0]);
    try {
      const res = await updateProfile(null, fd);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => { setSaveSuccess(false); setIsEditing(false); }, 2200);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const viewTabs  = [
    { key: "personal" as ViewTab,  label: "Personal",  Icon: User },
    { key: "academic" as ViewTab,  label: "Academic",  Icon: GraduationCap },
    { key: "contact"  as ViewTab,  label: "Contact",   Icon: Phone },
  ];
  const modalTabs = [
    { key: "personal" as ModalTab, label: "Personal",  Icon: User },
    { key: "academic" as ModalTab, label: "Academic",  Icon: GraduationCap },
    { key: "contact"  as ModalTab, label: "Contact",   Icon: Phone },
  ];

  return (
    <div className="pr-root">
      <div className="pr-wrap">

        {/* Top bar */}
        <div className="pr-topbar pr-in">
          <div className="pr-breadcrumb">
            <span>Dashboard</span>
            <ChevronRight size={13} />
            <span className="pr-breadcrumb-current">My Profile</span>
          </div>
          <button className="pr-edit-btn" onClick={openEdit}>
            <Edit2 size={14} /> Edit Profile
          </button>
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
                      ? <Image src={student.profilePhoto} alt={user.name} width={68} height={68} style={{ objectFit: "cover", width: "100%", height: "100%" }} priority />
                      : initials}
                  </div>
                  <div className="pr-avatar-dot" />
                </div>
                <div className="pr-name">{user.name}</div>
                <div className="pr-email"><Mail size={11} />{user.email}</div>
                <div className="pr-chip"><Shield size={10} />{user.role}</div>
                <div className="pr-divider" />
                <div className="pr-stats">
                  {[
                    { label: "Roll No.", value: student.roll || "—", cls: "accent" },
                    { label: "Status",   value: "Active",            cls: "green"  },
                    { label: "Joined",   value: fmt(user.createdAt), cls: ""       },
                    { label: "Year",     value: "2025–26",           cls: ""       },
                  ].map(({ label, value, cls }) => (
                    <div className="pr-stat" key={label}>
                      <div className="pr-stat-label">{label}</div>
                      <div className={`pr-stat-value${cls ? " " + cls : ""}`} style={{ fontSize: label === "Joined" ? 11 : label === "Year" ? 12 : undefined }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Digital ID */}
            <div className="pr-digid pr-in pr-in-2">
              <div className="pr-digid-label"><Fingerprint size={10} />Student ID</div>
              <div className="pr-digid-num">{student.roll || "——"}</div>
              <div className="pr-digid-dept">{student.department?.name || "Computer Science & Technology"}</div>
              <div className="pr-digid-valid"><Calendar size={10} />Valid until June 2027</div>
            </div>

            {/* Activity */}
            <div className="pr-card pr-in pr-in-3">
              <div className="pr-activity-title"><Clock size={13} />Recent Activity</div>
              <div className="pr-timeline">
                {[
                  { label: "Profile viewed",  time: "Just now",       active: true  },
                  { label: "Profile updated", time: fmt(user.updatedAt), active: false },
                  { label: "Account created", time: fmt(user.createdAt), active: false },
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
              <div className="pr-panel-title"><Users size={16} />Student Profile</div>
              <div className="pr-panel-sub">Complete academic and personal information</div>
            </div>

            <div className="pr-tabs">
              {viewTabs.map(({ key, label, Icon }) => (
                <button key={key} className={`pr-tab${viewTab === key ? " active" : ""}`} onClick={() => setViewTab(key)}>
                  <Icon size={12} />{label}
                </button>
              ))}
            </div>

            {viewTab === "personal" && (
              <div className="pr-fields">
                <Field label="Full Name"         value={student.name || user.name} />
                <Field label="Gender"            value={student.gender} />
                <Field label="Date of Birth"     value={fmt(student.birthDate)} />
                <Field label="Date of Birth Number"     value={fmt(student.birthDateNumber)} />
                <Field label="Nid"     value={fmt(student.nid)} />
                <Field label="Father's Name"     value={student.fatherName} />
                <Field label="Mother's Name"     value={student.motherName} />
                <Field label="Last Updated"      value={fmt(user.updatedAt)} />
                <Field label="Present Address"   value={student.presentAddress}   full />
                <Field label="Permanent Address" value={student.permanentAddress} full />
              </div>
            )}
            {viewTab === "academic" && (
              <div className="pr-fields">
                <Field label="Roll Number"      value={student.roll}             mono />
                <Field label="Registration No." value={student.registration}     mono />
                <Field label="Department"       value={student.department?.name} sub={student.department?.shortName} />
                <Field label="Group"            value={student.group?.name}      sub={`Session: ${student.group?.session || "—"}`} />
                <Field label="Academic Year"    value="2025 – 2026" />
                <Field label="Account Role"     value={user.role} />
              </div>
            )}
            {viewTab === "contact" && (
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

      {/* ── EDIT MODAL ── */}
      {isEditing && (
        <div className="em-backdrop" onClick={closeEdit}>
          <div className="em-modal" onClick={e => e.stopPropagation()}>
            <div className="em-stripe" />

            <div className="em-header">
              <div className="em-header-left">
                <div className="em-icon"><User size={20} /></div>
                <div>
                  <div className="em-title">Edit Profile</div>
                  <div className="em-subtitle">Update your personal and academic information</div>
                </div>
              </div>
              <button className="em-close" onClick={closeEdit} type="button"><X size={14} /></button>
            </div>

            {saveSuccess && (
              <div className="em-success-bar">
                <CheckCircle size={16} />Profile updated successfully!
              </div>
            )}

            <div className="em-tabs">
              {modalTabs.map(({ key, label, Icon }) => (
                <button key={key} type="button" className={`em-tab${modalTab === key ? " active" : ""}`} onClick={() => setModalTab(key)}>
                  <Icon size={11} />{label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "contents" }}>
              <div className="em-body">

                {modalTab === "personal" && (
                  <>
                    <div className="em-photo-row">
                      <div className="em-avatar">
                        {(photoPreview || student.profilePhoto)
                          ? <Image src={photoPreview || student.profilePhoto} alt="preview" width={54} height={54} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                          : initials}
                      </div>
                      <div className="em-photo-info">
                        <div className="em-photo-label">Profile Photo</div>
                        <div className="em-photo-hint">JPG, PNG or WEBP · Max 2 MB</div>
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
                      <button type="button" className="em-upload-btn" onClick={() => fileRef.current?.click()}>
                        <Upload size={12} />Upload
                      </button>
                    </div>

                    <div className="em-grid">
                      <div className="em-group"><label className="em-label">Full Name</label>
                        <input className="em-input" name="name" defaultValue={student.name || user.name} placeholder="Full name" /></div>
                      <div className="em-group"><label className="em-label">Gender</label>
                        <select className="em-input" name="gender" defaultValue={student.gender || ""}>
                          <option value="">Select</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select></div>
                      <div className="em-group"><label className="em-label">Date of Birth</label>
                        <input className="em-input" name="birthDate" type="date" defaultValue={toDate(student.birthDate)} /></div>
                      <div className="em-group"><label className="em-label">NID / Birth Reg.</label>
                        <input className="em-input" name="nid" defaultValue={student.nid} placeholder="ID number" /></div>
                      <div className="em-group"><label className="em-label">Fathers Name</label>
                        <input className="em-input" name="fatherName" defaultValue={student.fatherName} placeholder="Father's full name" /></div>
                      <div className="em-group"><label className="em-label">Mothers Name</label>
                        <input className="em-input" name="motherName" defaultValue={student.motherName} placeholder="Mother's full name" /></div>
                      <div className="em-group full"><label className="em-label">Present Address</label>
                        <input className="em-input" name="presentAddress" defaultValue={student.presentAddress} placeholder="House, Road, Area, District" /></div>
                      <div className="em-group full"><label className="em-label">Permanent Address</label>
                        <input className="em-input" name="permanentAddress" defaultValue={student.permanentAddress} placeholder="House, Road, Area, District" /></div>
                    </div>
                  </>
                )}

                {modalTab === "academic" && (
                  <div className="em-grid">
                    <div className="em-group"><label className="em-label">Roll Number</label>
                      <input className="em-input" defaultValue={student.roll} disabled /></div>
                    <div className="em-group"><label className="em-label">Registration No.</label>
                      <input className="em-input" defaultValue={student.registration} disabled /></div>
                    <div className="em-group full"><label className="em-label">Department</label>
                      <input className="em-input" defaultValue={student.department?.name} disabled /></div>
                    <div className="em-group full"><label className="em-label">Group / Session</label>
                      <input className="em-input" defaultValue={`${student.group?.name || "—"} · ${student.group?.session || "—"}`} disabled /></div>
                    <div className="em-group full" style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 14px" }}>
                      <p style={{ fontSize: 12, color: "#92400E", margin: 0 }}>
                        🔒 Academic details are managed by your institution and cannot be edited here.
                      </p>
                    </div>
                  </div>
                )}

                {modalTab === "contact" && (
                  <div className="em-grid">
                    <div className="em-group full"><label className="em-label">Email Address</label>
                      <input className="em-input" defaultValue={user.email} disabled /></div>
                    <div className="em-group"><label className="em-label">Mobile Number</label>
                      <input className="em-input" name="mobile" type="tel" defaultValue={student.mobile} placeholder="+880 1XXX-XXXXXX" /></div>
                    <div className="em-group"><label className="em-label">Fathers Mobile</label>
                      <input className="em-input" name="fatherMobile" type="tel" defaultValue={student.fatherMobile} placeholder="+880 1XXX-XXXXXX" /></div>
                    <div className="em-group"><label className="em-label">Mothers Mobile</label>
                      <input className="em-input" name="motherMobile" type="tel" defaultValue={student.motherMobile} placeholder="+880 1XXX-XXXXXX" /></div>
                  </div>
                )}
              </div>

              <div className="em-footer">
                <div className="em-secure"><Lock size={11} />Encrypted & secure</div>
                <div className="em-actions">
                  <button type="button" className="em-btn-cancel" onClick={closeEdit} disabled={isSaving}>Cancel</button>
                  <button type="submit" className="em-btn-save" disabled={isSaving || modalTab === "academic"}>
                    {isSaving
                      ? <><Loader2 size={13} className="em-spin" />Saving…</>
                      : <><Save size={13} />Save Changes</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, sub, mono = false, full = false }: {
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