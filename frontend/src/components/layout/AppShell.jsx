import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const SIDEBAR_WIDTH = 256; // w-64

export function AppShell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // phone
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true); // laptop

  // Topbar ke menu icon par click: laptop par collapse/expand, phone par drawer
  const handleToggle = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setDesktopSidebarOpen((v) => !v);
    } else {
      setMobileSidebarOpen((v) => !v);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        desktopOpen={desktopSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/*
        Spacer: sidebar `fixed` hai, is liye ye khali box uski jagah ghera rehta hai.
        padding/margin ki jagah `width` use ki hai, taake CSS reset ka asar na ho.
        Sirf laptop (lg+) par dikhta hai.
      */}
      <div
        aria-hidden="true"
        className="hidden lg:block shrink-0 transition-[width] duration-200 ease-in-out"
        style={{ width: desktopSidebarOpen ? SIDEBAR_WIDTH : 0 }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleMobile={handleToggle} />

        <main
          className="flex-1 w-full max-w-7xl animate-fade-in"
          style={{ padding: "24px", marginLeft: "auto", marginRight: "auto" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
