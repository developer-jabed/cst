"use client";

import { Badge } from "@/components/ui/badge";
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
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  FileText,
  Calendar,
  Users,
  Award,
  AlertTriangle,
  Clock,
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

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "notice":
      return <FileText className="h-4 w-4 text-blue-600" />;
    case "event":
      return <Calendar className="h-4 w-4 text-violet-600" />;
    case "attendance":
      return <Users className="h-4 w-4 text-amber-600" />;
    case "result":
      return <Award className="h-4 w-4 text-emerald-600" />;
    case "assignment":
      return <Clock className="h-4 w-4 text-rose-600" />;
    case "alert":
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

export default function NotificationDropdown() {
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 rounded-3xl p-2 shadow-xl border border-gray-100 dark:border-gray-700"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-3">
          <span className="font-semibold text-lg">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <ScrollArea className="h-[420px] px-1">
          {MOCK_NOTIFICATIONS.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            MOCK_NOTIFICATIONS.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-3.5 p-3.5 rounded-2xl cursor-pointer mb-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  !notification.read
                    ? "bg-violet-50/70 dark:bg-violet-950/30"
                    : ""
                }`}
              >
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-tight">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-violet-600 shrink-0 mt-1.5" />
                    )}
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {notification.message}
                  </p>

                  <p className="text-[10px] text-gray-500">
                    {formatDistanceToNow(notification.timestamp, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-center justify-center py-3 text-sm font-medium text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/50 rounded-2xl cursor-pointer">
          View All Notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
