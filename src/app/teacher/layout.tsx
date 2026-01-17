"use client";

import { useRouter } from "next/navigation";
import { Home, Users, TrendingUp, LogOut } from "lucide-react";
import { ReactNode } from "react";

export default function TeacherLayout({ children }: { children: ReactNode }) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/logout");
        router.push("/");
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-background)" }}>
            {/* Sidebar */}
            <aside style={{
                width: "280px",
                background: "white",
                borderRight: "1px solid var(--color-border)",
                padding: "2rem 0",
                position: "fixed",
                height: "100vh",
                left: 0,
                top: 0
            }}>
                <div style={{ padding: "0 1.5rem", marginBottom: "3rem" }}>
                    <h1 style={{
                        fontSize: "1.5rem",
                        fontWeight: "800",
                        background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                    }}>
                        교사 모드
                    </h1>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                        Classroom Stock Market
                    </p>
                </div>

                <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0 1rem" }}>
                    <NavLink href="/teacher" icon={<Home size={20} />} label="대시보드" />
                    <NavLink href="/teacher/students" icon={<Users size={20} />} label="학생 관리" />
                    <NavLink href="/teacher/market" icon={<TrendingUp size={20} />} label="시장 & 은행" />
                </nav>

                <div style={{ position: "absolute", bottom: "2rem", width: "100%", padding: "0 1rem" }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: "calc(100% - 2rem)",
                            padding: "0.875rem",
                            background: "transparent",
                            border: "2px solid var(--color-border)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--color-text-muted)",
                            fontSize: "0.95rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            transition: "var(--transition)"
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = "var(--color-danger)";
                            e.currentTarget.style.color = "var(--color-danger)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = "var(--color-border)";
                            e.currentTarget.style.color = "var(--color-text-muted)";
                        }}
                    >
                        <LogOut size={18} />
                        로그아웃
                    </button>
                </div>
            </aside>

            {/* Main Content - Wider and Centered */}
            <main style={{
                marginLeft: "280px",
                flex: 1,
                padding: "3rem",
                maxWidth: "1600px",
                width: "100%"
            }}>
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
    return (
        <a
            href={href}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
                padding: "0.875rem 1rem",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text)",
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: "600",
                transition: "var(--transition)"
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(0, 57, 255, 0.08)";
                e.currentTarget.style.color = "var(--color-primary)";
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--color-text)";
            }}
        >
            {icon}
            {label}
        </a>
    );
}
