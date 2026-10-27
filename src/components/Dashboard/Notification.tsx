"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  FileText,
  Calendar,
  Users,
  Award,
  AlertTriangle,
  Clock,
  type LucideIcon,
} from "lucide-react";

interface Notification {
  id: string;
  type: "notice" | "event" | "attendance" | "result" | "assignment" | "alert";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Polytechnic Institute Relevant Mock Notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "notice",
    title: "New Notice Published",
    message: "Mid-term Exam Schedule has been published. Check your dashboard.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    read: false,
  },
  {
    id: "2",
    type: "event",
    title: "Tech Fest 2026",
    message:
      "Annual Tech Festival starts from 20th May. Register your team now.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    read: false,
  },
  {
    id: "3",
    type: "attendance",
    title: "Low Attendance Alert",
    message: "Your attendance in Data Structure is below 75%. Please improve.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    read: true,
  },
  {
    id: "4",
    type: "result",
    title: "Semester Result Published",
    message:
      "3rd Semester Diploma Result has been declared. View your result now.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    read: true,
  },
  {
    id: "5",
    type: "assignment",
    title: "Assignment Deadline",
    message: "Database Management System assignment due tomorrow at 11:59 PM.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    read: false,
  },
  {
    id: "6",
    type: "alert",
    title: "Class Cancellation",
    message:
      "Microprocessor class has been cancelled today due to faculty meeting.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
];

// Per-type icon + soft gradient chip
const TYPE_STYLE: Record<
  Notification["type"],
  { icon: LucideIcon; grad: string; glow: string }
> = {
  notice: {
    icon: FileText,
    grad: "from-sky-400 to-cyan-500",
    glow: "shadow-sky-200",
  },
  event: {
    icon: Calendar,
    grad: "from-teal-400 to-emerald-600",
    glow: "shadow-emerald-200",
  },
  attendance: {
    icon: Users,
    grad: "from-amber-400 to-orange-400",
    glow: "shadow-amber-200",
  },
  result: {
    icon: Award,
    grad: "from-lime-400 to-green-500",
    glow: "shadow-lime-200",
  },
  assignment: {
    icon: Clock,
    grad: "from-rose-400 to-pink-500",
    glow: "shadow-rose-200",
  },
  alert: {
    icon: AlertTriangle,
    grad: "from-red-400 to-rose-600",
    glow: "shadow-red-200",
  },
};

export default function NotificationDropdown() {
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="group relative rounded-xl text-emerald-900 transition hover:bg-emerald-50 active:scale-95 data-[state=open]:bg-emerald-50"
        >
          <Bell className="h-5 w-5 origin-top transition duration-300 group-hover:rotate-12" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-[#e6cf94]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-80 rounded-3xl border border-[#e7e2d3] bg-[#fdfcf8] p-2 shadow-2xl shadow-emerald-950/10 sm:w-96"
      >
        <DropdownMenuLabel className="px-3 pb-2 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-serif text-lg font-bold text-[#0b1f1a]">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-gradient-to-r from-[#e6cf94] to-[#c9a24b] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0b1f1a] shadow-sm">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="mt-2 h-0.5 w-10 rounded-full bg-gradient-to-r from-[#c9a24b] to-transparent" />
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[#e7e2d3]" />

        <ScrollArea className="h-[420px] px-1 pt-1">
          {MOCK_NOTIFICATIONS.length === 0 ? (
            <div className="flex flex-col items-center p-10 text-center text-sm text-gray-400">
              <Bell className="mb-2 h-8 w-8" />
              No notifications yet
            </div>
          ) : (
            MOCK_NOTIFICATIONS.map((notification, i) => {
              const s = TYPE_STYLE[notification.type];
              const Icon = s.icon;

              return (
                <DropdownMenuItem
                  key={notification.id}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className={cn(
                    "group relative mb-1 flex cursor-pointer items-start gap-3.5 rounded-2xl p-3.5 transition-all duration-300",
                    "animate-in fade-in slide-in-from-right-3 fill-mode-both duration-500 motion-reduce:animate-none",
                    "hover:translate-x-0.5 focus:bg-emerald-50/80",
                    !notification.read
                      ? "bg-gradient-to-r from-emerald-50 to-transparent ring-1 ring-emerald-100"
                      : "opacity-80 hover:opacity-100"
                  )}
                >
                  {/* Gold unread bar */}
                  {!notification.read && (
                    <span className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-gradient-to-b from-[#e6cf94] to-[#c9a24b]" />
                  )}

                  {/* Colourful icon chip */}
                  <span
                    className={cn(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition duration-300 group-hover:-rotate-6 group-hover:scale-110",
                      s.grad,
                      s.glow
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-tight text-[#0b1f1a]">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="relative mt-1 flex h-2 w-2 shrink-0">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:animate-none" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                      )}
                    </div>

                    <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">
                      {notification.message}
                    </p>

                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                      {formatDistanceToNow(notification.timestamp, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>

        <DropdownMenuSeparator className="bg-[#e7e2d3]" />

        <DropdownMenuItem className="cursor-pointer justify-center rounded-2xl bg-gradient-to-r from-[#064e3b] to-[#059669] py-3 text-sm font-semibold text-white shadow-md shadow-emerald-900/20 transition hover:shadow-lg focus:bg-emerald-700 focus:text-white active:scale-[0.98]">
          View All Notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}