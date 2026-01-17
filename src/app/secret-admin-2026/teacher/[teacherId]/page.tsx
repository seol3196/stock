"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, TrendingUp, DollarSign, School } from "lucide-react";

export default function TeacherManagePage() {
    const params = useParams();
    const router = useRouter();
    const teacherId = params.teacherId as string;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchData();
    }, [teacherId]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin/teachers/${teacherId}`);
            if (res.status === 401) {
                setError("관리자 권한이 없습니다.");
                setLoading(false);
                return;
            }
            if (res.status === 404) {
                setError("교사를 찾을 수 없습니다.");
                setLoading(false);
                return;
            }
            const json = await res.json();
            setData(json);
        } catch (e) {
            setError("데이터 로드 실패");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">로딩 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass-panel p-8 text-center max-w-md">
                    <h1 className="text-2xl font-bold mb-2">오류</h1>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <button onClick={() => router.back()} className="btn btn-primary">
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => router.push("/secret-admin-2026")}
                    className="btn btn-outline mb-6 gap-2"
                >
                    <ArrowLeft size={18} />
                    관리자 페이지로 돌아가기
                </button>

                <div className="glass-panel p-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                            <School size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{data.teacher.username} 교사 페이지</h1>
                            <p className="text-slate-400">학생 및 시장 관리 현황</p>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-panel p-6">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">총 학생 수</p>
                                <h3 className="text-3xl font-bold mt-1">{data.stats.studentCount}명</h3>
                            </div>
                            <div className="p-2 bg-white/5 rounded-lg">
                                <Users className="text-primary" size={24} />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">활성 계정 수</p>
                    </div>

                    <div className="glass-panel p-6">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">상장 주식 수</p>
                                <h3 className="text-3xl font-bold mt-1">{data.stats.stockCount}개</h3>
                            </div>
                            <div className="p-2 bg-white/5 rounded-lg">
                                <TrendingUp className="text-secondary" size={24} />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">거래 가능한 종목</p>
                    </div>

                    <div className="glass-panel p-6">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">경제 규모</p>
                                <h3 className="text-3xl font-bold mt-1">₩{data.stats.totalAssets.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 bg-white/5 rounded-lg">
                                <DollarSign className="text-success" size={24} />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">학생 총 자산</p>
                    </div>
                </div>

                {/* Students List */}
                <h2 className="text-2xl font-bold mb-4">학생 목록</h2>
                <div className="glass-panel overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-900/50 text-xs uppercase text-slate-400 font-semibold">
                                <tr>
                                    <th className="px-6 py-4 text-left">이름 / ID</th>
                                    <th className="px-6 py-4 text-right">보유 현금</th>
                                    <th className="px-6 py-4 text-right">저축액</th>
                                    <th className="px-6 py-4 text-right">총 자산</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.students.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                            등록된 학생이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    data.students.map((student: any) => (
                                        <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">
                                                    {student.name || "이름 없음"}
                                                </div>
                                                <div className="text-xs text-slate-500">@{student.username}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-emerald-400">
                                                ₩{student.cash.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-blue-400">
                                                ₩{student.savings_balance.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold">
                                                ₩{(student.cash + student.savings_balance).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stocks List */}
                <h2 className="text-2xl font-bold mb-4">상장 주식 목록</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.stocks.length === 0 ? (
                        <div className="col-span-3 glass-panel p-8 text-center text-muted-foreground">
                            상장된 주식이 없습니다.
                        </div>
                    ) : (
                        data.stocks.map((stock: any) => (
                            <div key={stock.id} className="glass-panel p-6 border-l-4 border-l-primary/50">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-xs font-bold px-2 py-1 bg-white/10 rounded text-slate-300 mb-2 inline-block">
                                            {stock.code}
                                        </span>
                                        <h3 className="text-xl font-bold">{stock.name}</h3>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="text-xs text-slate-500 uppercase font-semibold">
                                        현재 가격
                                    </label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-2xl font-mono font-bold text-white">
                                            ₩{stock.current_price}
                                        </span>
                                    </div>
                                </div>

                                <div className={`text-xs px-2 py-1 rounded inline-block ${stock.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                                    }`}>
                                    {stock.is_active ? "상장됨" : "상장 폐지"}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Bank Info */}
                <div className="glass-panel p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">은행 정보</h3>
                    <p className="text-slate-400">
                        현재 금리: <span className="text-2xl font-bold text-primary ml-2">{data.teacher.interest_rate}%</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
