"use client";

import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, Landmark, LogOut, Menu, X, BookOpen } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [displayName, setDisplayName] = useState<string>("");

    // Fetch user session on mount
    useEffect(() => {
        fetch('/api/session')
            .then(res => res.json())
            .then(data => {
                // Prefer name over username for display
                if (data.name) {
                    setDisplayName(data.name);
                } else if (data.username) {
                    setDisplayName(data.username);
                }
            })
            .catch(() => { });
    }, []);

    const handleLogout = async () => {
        await fetch("/api/logout");
        router.push("/");
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-background)" }}>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                    display: "none",
                    position: "fixed",
                    top: "1rem",
                    left: "1rem",
                    zIndex: 1001,
                    background: "white",
                    border: "2px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
                className="mobile-menu-btn"
            >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                style={{
                    width: "280px",
                    background: "white",
                    borderRight: "1px solid var(--color-border)",
                    padding: "2rem 0",
                    position: "fixed",
                    height: "100vh",
                    left: 0,
                    top: 0,
                    zIndex: 1000,
                    transition: "transform 0.3s ease"
                }}
                className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
            >
                <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
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
                    {displayName && (
                        <p style={{
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color: "#1e40af",
                            marginTop: "0.75rem",
                            padding: "0.5rem",
                            background: "#eff6ff",
                            borderRadius: "var(--radius-sm)"
                        }}>
                            {displayName}님 안녕하세요
                        </p>
                    )}
                </div>

                <nav style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "0 1rem" }}>
                    <NavLink href="/student" icon={<BarChart3 size={24} />} label="내 포트폴리오" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink href="/student/trade" icon={<TrendingUp size={24} />} label="주식 거래소" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink href="/student/bank" icon={<Landmark size={24} />} label="은행 & 저축" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink href="/student/learn" icon={<BookOpen size={24} />} label="주식공부하기" onClick={() => setMobileMenuOpen(false)} />
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

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                        display: "none",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 999
                    }}
                    className="mobile-overlay"
                />
            )}

            {/* Main Content */}
            <main className="main-content" style={{ marginLeft: "280px", flex: 1 }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem" }} className="main-content-inner">
                    {children}
                </div>
            </main>

            <style jsx>{`
                @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: block !important;
                    }
                    
                    .sidebar {
                        transform: translateX(-100%);
                    }
                    
                    .sidebar.mobile-open {
                        transform: translateX(0);
                    }
                    
                    .mobile-overlay {
                        display: block !important;
                    }
                    
                    .main-content {
                        margin-left: 0 !important;
                    }
                    
                    .main-content-inner {
                        padding: 5rem 1rem 2rem 1rem !important;
                    }
                }
            `}</style>
        </div>
    );
}

function NavLink({ href, icon, label, onClick }: { href: string; icon: ReactNode; label: string; onClick?: () => void }) {
    return (
        <a
            href={href}
            onClick={onClick}
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
