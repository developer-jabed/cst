/* eslint-disable @typescript-eslint/no-explicit-any */
// app/my-profile/ProfileClient.tsx
"use client";

import { useState } from "react";
import { User, Mail, Calendar, Shield, Edit } from "lucide-react";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  needPasswordChange?: boolean;
  createdAt?: string;
  updatedAt?: string;
  admin?: any;
  teacher?: any;
  student?: any;
}

export default function ProfileClient({ initialUser }: { initialUser: UserInfo }) {
  const [user] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-white">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-4xl font-bold border-4 border-white/30">
            {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-semibold">{user.name}</h2>
            <p className="text-blue-100 mt-1 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-lg capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Additional Role-Specific Info */}
        {user.role === "STUDENT" && user.student && (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="font-semibold mb-4">Student Information</h3>
            <p><strong>Department:</strong> {user.student.department?.name || "N/A"}</p>
            {/* Add more student fields as needed */}
          </div>
        )}

        {user.role === "TEACHER" && user.teacher && (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="font-semibold mb-4">Teacher Information</h3>
            <p><strong>Department:</strong> {user.teacher.department?.name || "N/A"}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t px-8 py-6 flex gap-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>

        <button
          onClick={() => alert("Change password feature coming soon")}
          className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Change Password
        </button>
      </div>

      {/* Future: Edit Form Modal can go here when isEditing is true */}
    </div>
  );
}