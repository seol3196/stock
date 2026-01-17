"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, UserPlus, Users, School } from "lucide-react";

export default function AdminPage() {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState("");

    const [newTeacher, setNewTeacher] = useState({
        username: "",
        password: "",
    });

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const res = await fetch("/api/admin/teachers");
            if (res.status === 401) {
                setError("관리자 권한이 없습니다.");
                setLoading(false);
                return;
            }
            const data = await res.json();
            setTeachers(data);
        } catch (e) {
            setError("데이터 로드 실패");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/teachers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTeacher),
            });

            if (res.ok) {
                setShowAddModal(false);
                setNewTeacher({ username: "", password: "" });
                fetchTeachers();
                alert("교사 계정이 생성되었습니다.");
            } else {
                const data = await res.json();
                alert(data.error || "교사 생성 실패");
            }
        } catch (e) {
            console.error(e);
            alert("오류가 발생했습니다.");
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
                    <ShieldCheck className="mx-auto mb-4 text-red-500" size={48} />
                    <h1 className="text-2xl font-bold mb-2">접근 거부</h1>
                    <p className="text-slate-400">{error}</p>
                    <a href="/" className="btn btn-primary mt-6 inline-block">
                        홈으로 돌아가기
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="glass-panel p-6 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">관리자 페이지</h1>
                            <p className="text-slate-400">교사 계정 관리</p>
                        </div>
                    </div>
                </div>

                {/* Teachers List */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">교사 목록</h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary gap-2"
                    >
                        <UserPlus size={18} />
                        교사 추가
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teachers.map((teacher, index) => (
                        <div key={teacher.id} className="glass-panel p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                                    <School size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">{teacher.username}</h3>
                                        {index === 0 && (
                                            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                                                관리자
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">ID: {teacher.id.slice(0, 8)}...</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">학생 수</div>
                                    <div className="font-mono font-bold">{teacher.student_count}명</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">금리</div>
                                    <div className="font-mono font-bold">{teacher.interest_rate}%</div>
                                </div>
                            </div>

                            <a
                                href={`/secret-admin-2026/teacher/${teacher.id}`}
                                className="btn btn-primary w-full mt-4 text-sm"
                            >
                                페이지 관리
                            </a>
                        </div>
                    ))}
                </div>

                {/* Add Teacher Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="glass-panel w-full max-w-md p-6 animate-fade-in">
                            <h2 className="text-xl font-bold mb-4">새 교사 계정 생성</h2>
                            <form onSubmit={handleCreateTeacher} className="space-y-4">
                                <div>
                                    <label className="block text-sm mb-1">아이디 (ID)</label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={newTeacher.username}
                                        onChange={(e) =>
                                            setNewTeacher({ ...newTeacher, username: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">비밀번호</label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={newTeacher.password}
                                        onChange={(e) =>
                                            setNewTeacher({ ...newTeacher, password: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="btn btn-outline"
                                    >
                                        취소
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        생성
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Back to Dashboard */}
                <div className="mt-8 text-center">
                    <a href="/teacher" className="text-primary hover:underline">
                        ← 교사 대시보드로 돌아가기
                    </a>
                </div>
            </div>
        </div>
    );
}
