"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/service/auth/logoutUser";

function getToken() {
  return document.cookie.includes("accessToken");
}

function subscribe() {
  return () => {};
}

const NavbarAuthButtons = () => {
  const isLoggedIn = useSyncExternalStore(subscribe, getToken, () => false);

  const handleLogout = async () => {
    await logoutUser();
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      {isLoggedIn ? (
        <Button variant="destructive" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      ) : (
        <Link href="/login">
          <Button size="sm">Login</Button>
        </Link>
      )}
    </div>
  );
};

export default NavbarAuthButtons;