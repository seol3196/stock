import db from "@/lib/db";
import { Users, TrendingUp, Coins } from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TeacherDashboard() {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        redirect("/");
    }

    const teacherId = session.id as string;

    // 이 교사가 만든 학생 수만 카운트
    const studentCount = db.prepare('SELECT COUNT(*) as count FROM students WHERE teacher_id = ?').get(teacherId) as { count: number };

    // 이 교사가 상장한 주식 수만 카운트
    const stockCount = db.prepare('SELECT COUNT(*) as count FROM stocks WHERE teacher_id = ?').get(teacherId) as { count: number };

    // 이 교사의 학생들의 총 자산만 계산 (현금 + 예금)
    const totalMoney = db.prepare(`
    SELECT 
      SUM(cash) as total_cash,
      SUM(savings_balance) as total_savings
    FROM students
    WHERE teacher_id = ?
  `).get(teacherId) as { total_cash: number | null; total_savings: number | null };

    // 이 교사의 학생들이 보유한 주식 평가액 계산
    const totalStockValue = db.prepare(`
    SELECT COALESCE(SUM(so.quantity * s.current_price), 0) as total_stock_value
    FROM stock_ownership so
    JOIN stocks s ON so.stock_id = s.id
    JOIN students st ON so.student_id = st.id
    WHERE st.teacher_id = ?
  `).get(teacherId) as { total_stock_value: number };

    const totalAssets = (totalMoney.total_cash || 0) + (totalMoney.total_savings || 0) + (totalStockValue.total_stock_value || 0);

    return (
        <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 md:mb-8 lg:mb-12">대시보드</h1>

            {/* Stats Grid - Horizontal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
                <StatCard
                    title="총 학생 수"
                    value={studentCount.count}
                    unit="명"
                    icon={<Users size={32} />}
                    desc="활성 계정 수"
                    color="var(--color-primary)"
                />
                <StatCard
                    title="상장 주식"
                    value={stockCount.count}
                    unit="개"
                    icon={<TrendingUp size={32} />}
                    desc="거래 가능한 종목"
                    color="var(--color-secondary)"
                />
                <StatCard
                    title="경제 규모"
                    value={totalAssets.toLocaleString()}
                    unit="₩"
                    icon={<Coins size={32} />}
                    desc="학생 총 자산"
                    color="var(--color-success)"
                />
            </div>

            {/* Quick Actions Only */}
            <div className="card">
                <h2 style={{ fontSize: "clamp(1.125rem, 3vw, 1.5rem)", fontWeight: "700", marginBottom: "1rem" }}>빠른 실행</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="/teacher/students" className="btn btn-outline" style={{ padding: "clamp(0.75rem, 2vw, 1rem)", fontSize: "clamp(0.875rem, 2vw, 1rem)" }}>
                        학생 계정 생성
                    </a>
                    <a href="/teacher/market" className="btn btn-outline" style={{ padding: "clamp(0.75rem, 2vw, 1rem)", fontSize: "clamp(0.875rem, 2vw, 1rem)" }}>
                        새 종목 상장
                    </a>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, unit, icon, desc, color }: any) {
    return (
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "relative", zIndex: 1 }}>
                {/* Mobile-optimized horizontal layout */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "clamp(0.75rem, 2vw, 1rem)"
                }}>
                    {/* Left: Label and Value */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                            fontSize: "clamp(0.7rem, 2vw, 0.875rem)",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "var(--color-text-muted)",
                            marginBottom: "clamp(0.25rem, 1vw, 0.5rem)"
                        }}>{title}</p>

                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", flexWrap: "wrap", marginBottom: "clamp(0.25rem, 1vw, 0.5rem)" }}>
                            {unit === "₩" && <span style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", fontWeight: "700", color }}></span>}
                            <h3 style={{
                                fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
                                fontWeight: "800",
                                lineHeight: 1,
                                color: color,
                                margin: 0
                            }}>{value}</h3>
                            {unit !== "₩" && <span style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", fontWeight: "700", color }}>{unit}</span>}
                        </div>

                        <p style={{ fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)", color: "var(--color-text-muted)" }}>{desc}</p>
                    </div>

                    {/* Right: Icon */}
                    <div style={{
                        padding: "clamp(0.5rem, 1.5vw, 0.75rem)",
                        background: `${color}15`,
                        borderRadius: "var(--radius-md)",
                        color: color,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
}
