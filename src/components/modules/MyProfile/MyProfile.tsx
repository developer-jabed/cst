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

type ViewTab = "personal" | "academic" | "contact";
type ModalTab = "personal" | "academic" | "contact";

export default function ProfileClient({ initialUser }: { initialUser: UserInfo }) {
  const [user] = useState(initialUser);
  const [viewTab, setViewTab] = useState<ViewTab>("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>("personal");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fmt = (d?: string) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const toDate = (d?: string) => (d ? new Date(d).toISOString().split("T")[0] : "");

  const student = user.student || {};
  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const openEdit = () => {
    setIsEditing(true);
    setModalTab("personal");
    setSaveSuccess(false);
  };
  const closeEdit = () => {
    if (!isSaving) setIsEditing(false);
  };

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
        setTimeout(() => {
          setSaveSuccess(false);
          setIsEditing(false);
        }, 2200);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const viewTabs = [
    { key: "personal" as ViewTab, label: "Personal", Icon: User },
    { key: "academic" as ViewTab, label: "Academic", Icon: GraduationCap },
    { key: "contact" as ViewTab, label: "Contact", Icon: Phone },
  ];

  const modalTabs = [
    { key: "personal" as ModalTab, label: "Personal", Icon: User },
    { key: "academic" as ModalTab, label: "Academic", Icon: GraduationCap },
    { key: "contact" as ModalTab, label: "Contact", Icon: Phone },
  ];

  return (
    <>
      {/* Top bar */}
      <div className="st-fade mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Dashboard</span>
          <ChevronRight size={14} className="opacity-60" />
          <span className="font-semibold text-foreground">My Profile</span>
        </div>

        <button
          onClick={openEdit}
          className="group/btn inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:border-transparent hover:bg-gradient-to-br hover:from-primary hover:to-emerald-600 hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/30 active:scale-95"
        >
          <Edit2 size={14} />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* ───────── Sidebar ───────── */}
        <div className="space-y-5">
          {/* Identity Card */}
          <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="relative">
                <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-xl font-black text-primary-foreground shadow-lg shadow-primary/30">
                  {student.profilePhoto ? (
                    <Image
                      src={student.profilePhoto}
                      alt={user.name}
                      width={72}
                      height={72}
                      className="h-full w-full object-cover"
                      priority
                    />
                  ) : (
                    initials
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card bg-emerald-500" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
                <p className="mt-0.5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Mail size={12} />
                  {user.email}
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <Shield size={11} />
                {user.role}
              </span>

              {/* Stats grid */}
              <div className="mt-2 grid w-full grid-cols-2 gap-2.5">
                {[
                  { label: "Roll No.", value: student.roll || "—", accent: true },
                  { label: "Status", value: "Active", accent: false },
                  { label: "Joined", value: fmt(user.createdAt), accent: false },
                  { label: "Year", value: "2025–26", accent: false },
                ].map(({ label, value, accent }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-gradient-to-br from-secondary/80 to-secondary/40 p-2.5 ring-1 ring-border"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>
                    <p
                      className={`mt-0.5 text-sm font-bold tabular-nums ${
                        accent ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Digital ID */}
          <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
            <div className="h-1.5 w-full bg-gradient-to-r from-gold to-amber-400" />
            <div className="space-y-2 p-5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Fingerprint size={11} />
                Student ID
              </div>
              <p className="text-2xl font-black tracking-tight text-foreground">
                {student.roll || "——"}
              </p>
              <p className="text-xs text-muted-foreground">
                {student.department?.name || "Computer Science & Technology"}
              </p>
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                <Calendar size={11} />
                Valid until June 2027
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
            <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 to-blue-400" />
            <div className="p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                <Clock size={14} className="text-primary" />
                Recent Activity
              </div>
              <div className="space-y-4">
                {[
                  { label: "Profile viewed", time: "Just now", active: true },
                  { label: "Profile updated", time: fmt(user.updatedAt), active: false },
                  { label: "Account created", time: fmt(user.createdAt), active: false },
                ].map((ev, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="relative flex flex-col items-center">
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                          ev.active ? "bg-primary ring-4 ring-primary/20" : "bg-border"
                        }`}
                      />
                      {i < 2 && <span className="mt-1 w-px flex-1 bg-border" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-semibold text-foreground">{ev.label}</p>
                      <p className="text-xs text-muted-foreground">{ev.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ───────── Main Panel ───────── */}
        <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />

          <div className="p-6">
            <div className="mb-5">
              <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Users size={18} className="text-primary" />
                Student Profile
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Complete academic and personal information
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-1 rounded-xl bg-secondary/50 p-1 ring-1 ring-border">
              {viewTabs.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setViewTab(key)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                    viewTab === key
                      ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {viewTab === "personal" && (
                <>
                  <Field label="Full Name" value={student.name || user.name} />
                  <Field label="Gender" value={student.gender} />
                  <Field label="Date of Birth" value={fmt(student.birthDate)} />
                  <Field label="Date of Birth Number" value={fmt(student.birthDateNumber)} />
                  <Field label="NID" value={student.nid} />
                  <Field label="Father's Name" value={student.fatherName} />
                  <Field label="Mother's Name" value={student.motherName} />
                  <Field label="Last Updated" value={fmt(user.updatedAt)} />
                  <Field label="Present Address" value={student.presentAddress} full />
                  <Field label="Permanent Address" value={student.permanentAddress} full />
                </>
              )}

              {viewTab === "academic" && (
                <>
                  <Field label="Roll Number" value={student.roll} mono />
                  <Field label="Registration No." value={student.registration} mono />
                  <Field
                    label="Department"
                    value={student.department?.name}
                    sub={student.department?.shortName}
                  />
                  <Field
                    label="Group"
                    value={student.group?.name}
                    sub={`Session: ${student.group?.session || "—"}`}
                  />
                  <Field label="Academic Year" value="2025 – 2026" />
                  <Field label="Account Role" value={user.role} />
                </>
              )}

              {viewTab === "contact" && (
                <>
                  <Field label="Email Address" value={user.email} />
                  <Field label="Mobile Number" value={student.mobile} />
                  <Field label="Present Address" value={student.presentAddress} full />
                  <Field label="Permanent Address" value={student.permanentAddress} full />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ───────── Edit Modal ───────── */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={closeEdit}
        >
          <div
            className="theme-card relative max-h-[90vh] w-full max-w-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30">
                  <User size={18} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Edit Profile</h3>
                  <p className="text-xs text-muted-foreground">
                    Update your personal and academic information
                  </p>
                </div>
              </div>
              <button
                onClick={closeEdit}
                type="button"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-2 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle size={16} />
                Profile updated successfully!
              </div>
            )}

            {/* Modal tabs */}
            <div className="flex gap-1 border-b border-border bg-secondary/30 px-4 pt-3">
              {modalTabs.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setModalTab(key)}
                  className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-xs font-semibold transition-all ${
                    modalTab === key
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex max-h-[60vh] flex-col">
              <div className="flex-1 overflow-y-auto p-6">
                {modalTab === "personal" && (
                  <>
                    {/* Photo row */}
                    <div className="mb-6 flex items-center gap-4 rounded-xl bg-secondary/40 p-4 ring-1 ring-border">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-lg font-bold text-primary-foreground">
                        {photoPreview || student.profilePhoto ? (
                          <Image
                            src={photoPreview || student.profilePhoto}
                            alt="preview"
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Profile Photo</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG or WEBP · Max 2 MB</p>
                      </div>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhoto}
                      />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
                      >
                        <Upload size={12} />
                        Upload
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InputGroup label="Full Name" name="name" defaultValue={student.name || user.name} />
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Gender
                        </label>
                        <select
                          name="gender"
                          defaultValue={student.gender || ""}
                          className="w-full rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Select</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <InputGroup label="Date of Birth" name="birthDate" type="date" defaultValue={toDate(student.birthDate)} />
                      <InputGroup label="NID / Birth Reg." name="nid" defaultValue={student.nid} placeholder="ID number" />
                      <InputGroup label="Father's Name" name="fatherName" defaultValue={student.fatherName} />
                      <InputGroup label="Mother's Name" name="motherName" defaultValue={student.motherName} />
                      <InputGroup label="Present Address" name="presentAddress" defaultValue={student.presentAddress} full />
                      <InputGroup label="Permanent Address" name="permanentAddress" defaultValue={student.permanentAddress} full />
                    </div>
                  </>
                )}

                {modalTab === "academic" && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputGroup label="Roll Number" defaultValue={student.roll} disabled />
                    <InputGroup label="Registration No." defaultValue={student.registration} disabled />
                    <InputGroup label="Department" defaultValue={student.department?.name} disabled full />
                    <InputGroup
                      label="Group / Session"
                      defaultValue={`${student.group?.name || "—"} · ${student.group?.session || "—"}`}
                      disabled
                      full
                    />
                    <div className="col-span-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      🔒 Academic details are managed by your institution and cannot be edited here.
                    </div>
                  </div>
                )}

                {modalTab === "contact" && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputGroup label="Email Address" defaultValue={user.email} disabled full />
                    <InputGroup label="Mobile Number" name="mobile" type="tel" defaultValue={student.mobile} placeholder="+880 1XXX-XXXXXX" />
                    <InputGroup label="Father's Mobile" name="fatherMobile" type="tel" defaultValue={student.fatherMobile} placeholder="+880 1XXX-XXXXXX" />
                    <InputGroup label="Mother's Mobile" name="motherMobile" type="tel" defaultValue={student.motherMobile} placeholder="+880 1XXX-XXXXXX" />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-6 py-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock size={12} />
                  Encrypted & secure
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeEdit}
                    disabled={isSaving}
                    className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || modalTab === "academic"}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition hover:shadow-lg hover:shadow-primary/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ───────────────────────── Helpers ───────────────────────── */

function Field({
  label,
  value,
  sub,
  mono = false,
  full = false,
}: {
  label: string;
  value?: any;
  sub?: string;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-gradient-to-br from-secondary/60 to-secondary/30 p-3.5 ring-1 ring-border transition hover:ring-primary/30 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold text-foreground ${
          mono ? "font-mono tabular-nums text-primary" : ""
        }`}
      >
        {value || "—"}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function InputGroup({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  disabled = false,
  full = false,
}: {
  label: string;
  name?: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}