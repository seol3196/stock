"use client";

import { useState, useEffect } from "react";
import { Search, Edit, UserPlus, Trash2, Settings, Wallet } from "lucide-react";

export default function StudentManagementPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [allStocks, setAllStocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: "", username: "", password: "" });

    // Modals
    const [accountModalData, setAccountModalData] = useState<any>(null);
    const [assetModalData, setAssetModalData] = useState<any>(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [studentRes, stockRes] = await Promise.all([
                fetch("/api/teacher/students"),
                fetch("/api/teacher/stocks")
            ]);

            if (!studentRes.ok) {
                console.error("Student fetch failed");
                return;
            }
            if (!stockRes.ok) {
                console.error("Stock fetch failed");
                return;
            }

            const studentsData = await studentRes.json();
            const stocksData = await stockRes.json();

            setStudents(studentsData);
            setAllStocks(stocksData);
        } catch (e) {
            console.error("Fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/teacher/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStudent),
            });
            if (res.ok) {
                setShowAddModal(false);
                setNewStudent({ name: "", username: "", password: "" });
                fetchAllData();
            } else {
                alert("생성 실패");
            }
        } catch (err) {
            alert("오류 발생");
        }
    };

    const handleUpdateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountModalData) return;
        try {
            await fetch(`/api/teacher/students/${accountModalData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...accountModalData, type: 'ACCOUNT' }),
            });
            setAccountModalData(null);
            fetchAllData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assetModalData) return;
        try {
            // assetModalData should reflect the structure expected by API { type: 'ASSET', cash, savings, portfolio }
            await fetch(`/api/teacher/students/${assetModalData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: 'ASSET',
                    cash: assetModalData.cash,
                    savings: assetModalData.savingsBalance,
                    portfolio: assetModalData.portfolio
                }),
            });
            setAssetModalData(null);
            fetchAllData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteStudent = async (id: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            await fetch(`/api/teacher/students/${id}`, { method: "DELETE" });
            fetchAllData();
        } catch (err) { console.error(err); }
    }

    // Helper to prep asset modal
    const openAssetModal = (student: any) => {
        // Merge student portfolio with all stocks (so we can add missing stocks)
        const combinedPortfolio = allStocks.map(stock => {
            const existing = student.portfolio.find((p: any) => p.stockId === stock.id);
            return {
                stockId: stock.id,
                name: stock.name,
                code: stock.code,
                currentPrice: stock.currentPrice,
                quantity: existing ? existing.quantity : 0
            };
        });

        setAssetModalData({
            id: student.id,
            name: student.name,
            cash: student.cash,
            savingsBalance: student.savingsBalance,
            portfolio: combinedPortfolio
        });
    };

    const filteredStudents = students.filter(s =>
        s.name.includes(searchTerm) || s.username.includes(searchTerm)
    );

    return (
        <div style={{ color: '#0f172a' }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#0f172a' }}>학생 관리</h1>
                    <p style={{ color: '#64748b' }}>학생들의 계정과 자산을 통합 관리합니다.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        background: '#2563eb', color: 'white', border: 'none', padding: '0.875rem 1.5rem',
                        borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.25)'
                    }}
                >
                    <UserPlus size={20} /> 학생 등록
                </button>
            </div>

            <div style={{ marginBottom: '2rem', position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                <input
                    type="text" placeholder="이름 또는 아이디로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%', padding: '1rem 1rem 1rem 3rem', fontSize: '1rem', border: '1px solid #e2e8f0',
                        borderRadius: '16px', outline: 'none', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', color: '#334155'
                    }}
                />
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '0.875rem' }}>이름 / ID</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: '#64748b', fontSize: '0.875rem' }}>보유 현금</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: '#64748b', fontSize: '0.875rem' }}>총 자산 (순)</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: '600', color: '#64748b', fontSize: '0.875rem' }}>자산 관리</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: '600', color: '#64748b', fontSize: '0.875rem' }}>계정 관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student, idx) => {
                            const stockValue = student.portfolio?.reduce((acc: any, p: any) => acc + (p.quantity * p.stock.currentPrice), 0) || 0;
                            const total = (student.cash || 0) + (student.savingsBalance || 0) + stockValue;

                            return (
                                <tr key={student.id} style={{ borderBottom: idx !== filteredStudents.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>{student.name}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>@{student.username}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontFamily: 'monospace', fontSize: '1rem', fontWeight: '600', color: '#334155' }}>
                                        ₩{student.cash?.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: '700', color: '#2563eb' }}>
                                        ₩{total.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                        <button
                                            onClick={() => openAssetModal(student)}
                                            style={{
                                                padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#2563eb',
                                                cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.25rem'
                                            }}
                                        >
                                            <Wallet size={16} /> 자산 조정
                                        </button>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                            <button onClick={() => setAccountModalData(student)} title="정보 수정"
                                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer' }}>
                                                <Settings size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteStudent(student.id)} title="삭제"
                                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Asset Management Modal */}
            {assetModalData && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '700px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#1e293b' }}>💰 자산 관리</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{assetModalData.name} 학생의 자산을 직접 수정합니다.</p>

                        <form onSubmit={handleUpdateAsset}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>현금 (Cash)</label>
                                    <input type="number" required value={assetModalData.cash}
                                        onChange={e => setAssetModalData({ ...assetModalData, cash: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', fontWeight: 'bold' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>예금 (Savings)</label>
                                    <input type="number" required value={assetModalData.savingsBalance}
                                        onChange={e => setAssetModalData({ ...assetModalData, savingsBalance: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', fontWeight: 'bold' }} />
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>주식 보유량 수정</h3>
                            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1rem', border: '1px solid #e2e8f0', maxHeight: '300px', overflowY: 'auto' }}>
                                {assetModalData.portfolio.map((item: any, idx: number) => (
                                    <div key={item.stockId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: idx !== assetModalData.portfolio.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                                        <div>
                                            <div style={{ fontWeight: '700', color: '#334155' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.currentPrice?.toLocaleString()}원</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input type="number" min="0" value={item.quantity}
                                                onChange={(e) => {
                                                    const newPortfolio = [...assetModalData.portfolio];
                                                    newPortfolio[idx].quantity = Number(e.target.value);
                                                    setAssetModalData({ ...assetModalData, portfolio: newPortfolio });
                                                }}
                                                style={{ width: '80px', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'right', fontWeight: 'bold' }}
                                            />
                                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>주</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setAssetModalData(null)}
                                    style={{ padding: '0.875rem 2rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>
                                    취소
                                </button>
                                <button type="submit"
                                    style={{ padding: '0.875rem 3rem', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                    변경 저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Account Modal (Existing + Password) */}
            {accountModalData && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -12px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem', color: '#1e293b' }}>⚙️ 계정 설정</h2>
                        <form onSubmit={handleUpdateAccount}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>이름</label>
                                <input type="text" required value={accountModalData.name}
                                    onChange={e => setAccountModalData({ ...accountModalData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', background: '#f8fafc', color: '#1e293b' }} />
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>비밀번호 (변경 시 입력)</label>
                                <input type="text" placeholder="입력하지 않으면 유지됨"
                                    onChange={e => setAccountModalData({ ...accountModalData, password: e.target.value })}
                                    style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', background: '#f8fafc', color: '#1e293b' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={() => setAccountModalData(null)}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>
                                    취소
                                </button>
                                <button type="submit"
                                    style={{ padding: '0.75rem 2rem', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                                    저장하기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -12px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem', color: '#1e293b' }}>✨ 새 학생 등록</h2>
                        <form onSubmit={handleAddStudent}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>이름</label>
                                <input type="text" required placeholder="예: 김철수" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', background: '#f8fafc', color: '#1e293b' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>아이디</label>
                                <input type="text" required placeholder="영문 숫자" value={newStudent.username} onChange={e => setNewStudent({ ...newStudent, username: e.target.value })} style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', background: '#f8fafc', color: '#1e293b' }} />
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>비밀번호</label>
                                <input type="text" required value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', background: '#f8fafc', color: '#1e293b' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>취소</button>
                                <button type="submit" style={{ padding: '0.75rem 2rem', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '600', cursor: 'pointer' }}>등록하기</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
