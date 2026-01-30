"use client";

import { useRouter } from "next/navigation";
import { Home, Users, TrendingUp, LogOut, Menu, X, Trophy } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";

export default function TeacherLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [username, setUsername] = useState<string>("");
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    // Fetch user session on mount
    useEffect(() => {
        fetch('/api/session')
            .then(res => res.json())
            .then(data => {
                if (data.username) {
                    setUsername(data.username);
                    // Check if user is admin
                    if (data.username === "admin") {
                        setIsAdmin(true);
                    }
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
                    {username && (
                        <>
                            <p style={{
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "#1e40af",
                                marginTop: "0.75rem",
                                padding: "0.5rem",
                                background: "#eff6ff",
                                borderRadius: "var(--radius-sm)"
                            }}>
                                {username}님 안녕하세요
                            </p>
                            {isAdmin && (
                                <button
                                    onClick={() => router.push("/secret-admin-2026")}
                                    style={{
                                        width: "100%",
                                        marginTop: "0.5rem",
                                        padding: "0.5rem",
                                        background: "linear-gradient(135deg, #dc2626, #991b1b)",
                                        border: "none",
                                        borderRadius: "var(--radius-sm)",
                                        color: "white",
                                        fontSize: "0.8rem",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        transition: "var(--transition)",
                                        boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)"
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(220, 38, 38, 0.3)";
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(220, 38, 38, 0.2)";
                                    }}
                                >
                                    🔐 관리자 페이지
                                </button>
                            )}
                        </>
                    )}
                </div>

                <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0 1rem" }}>
                    <NavLink href="/teacher" icon={<Home size={20} />} label="대시보드" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink href="/teacher/students" icon={<Users size={20} />} label="학생 관리" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink href="/teacher/market" icon={<TrendingUp size={20} />} label="시장 & 은행" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink href="/teacher/ranking" icon={<Trophy size={20} />} label="학생 랭킹" onClick={() => setMobileMenuOpen(false)} />
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

            {/* Main Content - Wider and Centered */}
            <main className="main-content" style={{
                marginLeft: "280px",
                flex: 1,
                padding: "3rem",
                maxWidth: "1600px",
                width: "100%"
            }}>
                <div className="main-content-inner">
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
