"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "仪表盘", icon: "📊" },
  { href: "/admin/blog", label: "博客", icon: "📝" },
  { href: "/admin/analytics", label: "数据分析", icon: "📈" },
  { href: "/admin/feedback", label: "用户反馈", icon: "💬" },
  { href: "/admin/api-test", label: "接口测试", icon: "🔌" },
];

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  if (!mounted) {
    return <div className="w-full h-9" />;
  }

  return (
    <button
      onClick={toggle}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <span>{dark ? "☀️" : "🌙"}</span>
      <span>{dark ? "亮色模式" : "暗黑模式"}</span>
    </button>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    fetch("/api/admin/auth/logout", { method: "POST" }).then(() => {
      router.push("/admin/login");
    });
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        onClick={() => setCollapsed(!collapsed)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {!collapsed && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setCollapsed(true)} />
      )}

      <aside
        className={`${
          collapsed ? "-translate-x-full" : "translate-x-0"
        } lg:translate-x-0 fixed lg:sticky top-0 left-0 z-50 h-screen w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform`}
      >
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">EasyToolHub</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">管理后台</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
          <ThemeToggle />
          <a
            href="/en"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span>🌐</span>
            <span>查看网站</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <span>🚪</span>
            <span>退出登录</span>
          </button>
        </div>
      </aside>
    </>
  );
}
