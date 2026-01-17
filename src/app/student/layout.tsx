"use client";

import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, Landmark, LogOut } from "lucide-react";
import { ReactNode } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
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
                        fontSize: "1.75rem",
                        fontWeight: "800",
                        background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                    }}>
                        학생 포털
                    </h1>
                    <p style={{ fontSize: "1rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                        Classroom Stock Market
                    </p>
                </div>

                <nav style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "0 1rem" }}>
                    <NavLink href="/student" icon={<BarChart3 size={24} />} label="내 포트폴리오" />
                    <NavLink href="/student/trade" icon={<TrendingUp size={24} />} label="주식 거래소" />
                    <NavLink href="/student/bank" icon={<Landmark size={24} />} label="은행 & 저축" />
                </nav>

                <div style={{ position: "absolute", bottom: "2rem", width: "100%", padding: "0 1rem" }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: "calc(100% - 2rem)",
                            padding: "1rem",
                            background: "transparent",
                            border: "2px solid var(--color-border)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--color-text-muted)",
                            fontSize: "1rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            transition: "all 0.2s"
                        }}
                    >
                        <LogOut size={20} />
                        로그아웃
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: "280px", flex: 1 }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem" }}>
                    {children}
                </div>
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
                gap: "1rem",
                padding: "1rem 1.25rem",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text)",
                textDecoration: "none",
                fontSize: "1.1rem",
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
