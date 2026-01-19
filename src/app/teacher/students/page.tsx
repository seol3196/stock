"use client";

import { useState, useEffect } from "react";
import { Search, Wallet, UserPlus, Users, Trash2, Settings, X, ArrowRight, Loader2 } from "lucide-react";

export default function StudentManagementPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [allStocks, setAllStocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // UI State
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Modal Data
    const [accountModalData, setAccountModalData] = useState<any>(null);
    const [assetModalData, setAssetModalData] = useState<any>(null);

    // Batch Wizard
    const [batchStep, setBatchStep] = useState(1);
    const [batchRawNames, setBatchRawNames] = useState("");
    const [batchConfig, setBatchConfig] = useState({ prefix: "student", startNum: 1, password: "1234" });
    const [batchList, setBatchList] = useState<any[]>([]);

    // Single Add
    const [newStudent, setNewStudent] = useState({ name: "", username: "", password: "" });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/teacher/students");
            const stockRes = await fetch("/api/teacher/stocks");

            if (res.ok) setStudents(await res.json());
            if (stockRes.ok) setAllStocks(await stockRes.json());
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    // 1. DELETE
    const handleDeleteStudent = async (id: string, name: string) => {
        console.log("Request delete for:", id);
        // NO CONFIRM - Direct Action for debugging
        try {
            const res = await fetch(`/api/teacher/students/${id}`, { method: "DELETE" });
            const data = await res.json();

            console.log("Delete response:", data);

            if (!res.ok) {
                alert("삭제 실패: " + (data.error || "알 수 없는 오류"));
                return;
            }

            // Success
            fetchAllData();
        } catch (e: any) {
            console.error("Delete exception:", e);
            alert("통신 오류: " + e.message);
        }
    };

    // 2. UPDATE ASSET
    const handleUpdateAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assetModalData) return;

        console.log("Updating asset:", assetModalData);

        try {
            const res = await fetch(`/api/teacher/students/${assetModalData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: 'ASSET',
                    cash: assetModalData.cash,
                    savings: assetModalData.savingsBalance,
                    portfolio: assetModalData.portfolio
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                console.error("Update failed:", data);
                alert("자산 수정 실패: " + (data.error || "서버 오류"));
                return;
            }

            alert("자산이 저장되었습니다.");
            setAssetModalData(null);
            fetchAllData();
        } catch (e: any) {
            console.error("Update exception:", e);
            alert("통신 오류: " + e.message);
        }
    };

    // 3. UPDATE ACCOUNT
    const handleUpdateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountModalData) return;

        try {
            const res = await fetch(`/api/teacher/students/${accountModalData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...accountModalData, type: 'ACCOUNT' }),
            });

            if (!res.ok) {
                const data = await res.json();
                alert("계정 수정 실패: " + data.error);
                return;
            }

            alert("계정 정보가 수정되었습니다.");
            setAccountModalData(null);
            fetchAllData();
        } catch (e: any) {
            alert("오류: " + e.message);
        }
    };

    // 4. BATCH
    const handleBatchProcess = () => {
        const names = batchRawNames.split('\n').map(n => n.trim()).filter(n => n);
        if (names.length === 0) { alert("입력된 이름이 없습니다."); return; }

        const list = names.map((name, idx) => ({
            id: idx, name,
            username: `${batchConfig.prefix}${batchConfig.startNum + idx}`,
            password: batchConfig.password
        }));
        setBatchList(list);
        setBatchStep(2);
    };

    const handleBatchSubmit = async () => {
        if (batchList.length === 0) return;
        try {
            const res = await fetch("/api/teacher/students/batch", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ students: batchList }),
            });
            const data = await res.json();
            alert(data.message);

            setBatchList([]);
            setShowBatchModal(false);
            setBatchStep(1);
            setBatchRawNames("");
            fetchAllData();
        } catch (e: any) { alert("일괄 등록 오류: " + e.message); }
    };

    // 5. SINGLE ADD
    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/teacher/students", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStudent)
            });
            if (res.ok) {
                setShowAddModal(false);
                setNewStudent({ name: "", username: "", password: "" });
                fetchAllData();
            } else { alert("등록 실패"); }
        } catch { alert("오류"); }
    };

    // Helper
    const openAssetModal = (student: any) => {
        const combined = allStocks.map(stock => {
            const exist = student.portfolio.find((p: any) => p.stockId === stock.id);
            return {
                stockId: stock.id, name: stock.name, code: stock.code, currentPrice: stock.currentPrice,
                quantity: exist ? exist.quantity : 0
            };
        });
        setAssetModalData({
            id: student.id, name: student.name, cash: student.cash || 0, savingsBalance: student.savingsBalance || 0,
            portfolio: combined
        });
    };

    const filtered = students.filter(s => s.name.includes(searchTerm) || s.username.includes(searchTerm));

    return (
        <div style={{ color: '#0f172a' }}>
            <div className="header-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 className="page-title" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', margin: 0 }}>학생 관리</h1>
                    <div className="button-group" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => setShowBatchModal(true)} className="btn-secondary" style={{ background: 'white', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                            <Users size={18} /> 일괄 등록
                        </button>
                        <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                            <UserPlus size={18} /> 개별 등록
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem', position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                <input type="text" placeholder="검색..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', fontSize: '1rem', border: '1px solid #e2e8f0', borderRadius: '16px', outline: 'none' }} />
            </div>

            {/* Table wrapper with horizontal scroll for mobile */}
            <div className="table-wrapper" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>이름 / ID</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>총 자산</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b', width: '120px', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>자산관리</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b', width: '120px', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>계정관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map((s, i) => {
                            const stockVal = s.portfolio?.reduce((acc: any, p: any) => acc + (p.quantity * p.stock.currentPrice), 0) || 0;
                            const total = (s.cash || 0) + (s.savingsBalance || 0) + stockVal;
                            return (
                                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.25rem)' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>{s.name}</div>
                                        <div style={{ color: '#94a3b8', fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)' }}>@{s.username}</div>
                                    </td>
                                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.25rem)', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: '#2563eb', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>{total.toLocaleString()}</td>
                                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.25rem)', textAlign: 'center' }}>
                                        <button onClick={() => openAssetModal(s)} style={{ padding: '0.5rem 0.75rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)', whiteSpace: 'nowrap' }}>
                                            <Wallet size={14} /> 자산
                                        </button>
                                    </td>
                                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.25rem)', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                                            <button onClick={() => setAccountModalData(s)} style={{ padding: '0.5rem 0.75rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)' }}><Settings size={14} /> 계정</button>
                                            <button onClick={() => handleDeleteStudent(s.id, s.name)} style={{ padding: '0.4rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>{loading ? "로딩 중..." : "학생이 없습니다."}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Asset Modal */}
            {assetModalData && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: 'white', padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>자산 수정 ({assetModalData.name})</h2>
                        <form onSubmit={handleUpdateAsset}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>현금</label>
                                    <input type="number" value={assetModalData.cash} onChange={e => setAssetModalData({ ...assetModalData, cash: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '0.8rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>예금</label>
                                    <input type="number" value={assetModalData.savingsBalance} onChange={e => setAssetModalData({ ...assetModalData, savingsBalance: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '0.8rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                </div>
                            </div>
                            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>주식 보유량</h3>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                                {assetModalData.portfolio.map((p: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                        <span>{p.name} ({p.currentPrice}원)</span>
                                        <input type="number" value={p.quantity} onChange={e => {
                                            const list = [...assetModalData.portfolio];
                                            list[i].quantity = Number(e.target.value);
                                            setAssetModalData({ ...assetModalData, portfolio: list });
                                        }} style={{ width: '80px', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setAssetModalData(null)} style={{ flex: 1, padding: '1rem', background: '#f1f5f9', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>취소</button>
                                <button type="submit" style={{ flex: 2, padding: '1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>저장하기</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Account Modal */}
            {accountModalData && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: 'white', padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>정보 수정</h2>
                        <form onSubmit={handleUpdateAccount}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>이름</label>
                                <input value={accountModalData.name} onChange={e => setAccountModalData({ ...accountModalData, name: e.target.value })} style={{ width: '100%', padding: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>새 비밀번호</label>
                                <input placeholder="변경 시에만 입력" onChange={e => setAccountModalData({ ...accountModalData, password: e.target.value })} style={{ width: '100%', padding: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setAccountModalData(null)} style={{ flex: 1, padding: '1rem', background: '#f1f5f9', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>취소</button>
                                <button type="submit" style={{ flex: 1, padding: '1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>저장</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Batch Modal */}
            {showBatchModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: 'white', padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>일괄 등록 ({batchStep}/2)</h2>
                            <button onClick={() => setShowBatchModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                        </div>
                        {batchStep === 1 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <textarea value={batchRawNames} onChange={e => setBatchRawNames(e.target.value)} placeholder="이름을 엔터로 구분하여 입력" style={{ height: '300px', padding: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px' }} />
                                <div>
                                    <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '16px', marginBottom: '1rem' }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Prefix</label>
                                            <input value={batchConfig.prefix} onChange={e => setBatchConfig({ ...batchConfig, prefix: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #bfdbfe', borderRadius: '6px' }} />
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Start Num</label>
                                            <input type="number" value={batchConfig.startNum} onChange={e => setBatchConfig({ ...batchConfig, startNum: Number(e.target.value) })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #bfdbfe', borderRadius: '6px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Password</label>
                                            <input value={batchConfig.password} onChange={e => setBatchConfig({ ...batchConfig, password: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #bfdbfe', borderRadius: '6px' }} />
                                        </div>
                                    </div>
                                    <button onClick={handleBatchProcess} style={{ width: '100%', padding: '1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>다음</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: '#f1f5f9' }}>
                                            <tr><th style={{ padding: '0.5rem' }}>이름</th><th style={{ padding: '0.5rem' }}>ID</th><th style={{ padding: '0.5rem' }}>PW</th><th></th></tr>
                                        </thead>
                                        <tbody>
                                            {batchList.map((item, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <td style={{ padding: '0.5rem' }}><input value={item.name} onChange={e => { const l = [...batchList]; l[i].name = e.target.value; setBatchList(l); }} style={{ width: '80px' }} /></td>
                                                    <td style={{ padding: '0.5rem' }}><input value={item.username} onChange={e => { const l = [...batchList]; l[i].username = e.target.value; setBatchList(l); }} style={{ width: '120px' }} /></td>
                                                    <td style={{ padding: '0.5rem' }}><input value={item.password} onChange={e => { const l = [...batchList]; l[i].password = e.target.value; setBatchList(l); }} style={{ width: '80px' }} /></td>
                                                    <td style={{ textAlign: 'center' }}><button onClick={() => setBatchList(batchList.filter((_, idx) => idx !== i))} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}><X size={16} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button onClick={handleBatchSubmit} style={{ width: '100%', padding: '1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>등록 완료</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Single Add Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: 'white', padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>개별 등록</h2>
                        <form onSubmit={handleAddStudent} style={{ display: 'grid', gap: '1rem' }}>
                            <input placeholder="이름" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} style={{ padding: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                            <input placeholder="아이디" value={newStudent.username} onChange={e => setNewStudent({ ...newStudent, username: e.target.value })} style={{ padding: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                            <input placeholder="비밀번호" value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} style={{ padding: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                            <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.8rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>취소</button>
                            <button type="submit" style={{ padding: '0.8rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>등록</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
