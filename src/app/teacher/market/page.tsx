
"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Plus, Save } from "lucide-react";

export default function MarketManagementPage() {
    const [stocks, setStocks] = useState<any[]>([]);
    const [interestRate, setInterestRate] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAddStock, setShowAddStock] = useState(false);

    const [newStock, setNewStock] = useState({
        name: "",
        currentPrice: 1000,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [stockRes, bankRes] = await Promise.all([
                fetch("/api/teacher/stocks"),
                fetch("/api/teacher/bank"),
            ]);

            if (stockRes.ok) {
                const stockData = await stockRes.json();
                setStocks(stockData);
            }

            if (bankRes.ok) {
                const bankData = await bankRes.json();
                setInterestRate(bankData.interestRate || 0);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStock = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/teacher/stocks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStock),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "상장 실패");
            }

            setShowAddStock(false);
            setNewStock({ name: "", currentPrice: 1000 });
            fetchData();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleUpdatePrice = async (id: string, newPrice: number) => {
        const res = await fetch("/api/teacher/stocks", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, currentPrice: newPrice }),
        });
        if (res.ok) {
            fetchData();
        }
    };

    const handleUpdateRate = async () => {
        await fetch("/api/teacher/bank", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ interestRate }),
        });
        alert("금리가 수정되었습니다!");
    };

    const handleDeleteStock = async (id: string, name: string) => {
        if (!confirm(`"${name}" 종목을 상장폐지하시겠습니까?\n\n⚠️ 학생들이 보유한 해당 주식도 모두 삭제됩니다.`)) {
            return;
        }

        try {
            const res = await fetch("/api/teacher/stocks", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) {
                throw new Error("상장폐지 실패");
            }

            alert("상장폐지 완료!");
            fetchData();
        } catch (e: any) {
            alert(e.message);
        }
    };


    return (
        // Main Container Text Color Fixed for Light Theme
        <div style={{ color: '#0f172a' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#0f172a' }}>시장 및 은행 설정</h1>

            {/* Bank Settings */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: '24px',
                padding: '2rem',
                marginBottom: '3rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        background: '#eff6ff',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563eb'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>🏦</span>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#0f172a' }}>중앙은행 금리</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>학생들의 저축 이자율을 관리합니다.</p>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>현재 적용 금리</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="number"
                                step="0.1"
                                value={interestRate}
                                onChange={(e) => setInterestRate(Number(e.target.value))}
                                style={{
                                    background: 'transparent',
                                    fontSize: '2.5rem',
                                    fontWeight: '800',
                                    color: '#0f172a',
                                    width: '120px',
                                    border: 'none',
                                    borderBottom: '3px solid #cbd5e1',
                                    textAlign: 'right',
                                    outline: 'none',
                                    fontFamily: 'monospace'
                                }}
                            />
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#64748b', marginTop: '0.5rem' }}>%</span>
                        </div>
                    </div>
                    <button
                        onClick={handleUpdateRate}
                        style={{
                            background: '#0f172a',
                            color: 'white',
                            padding: '1rem 1.75rem',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 6px rgba(15, 23, 42, 0.15)'
                        }}
                    >
                        <Save size={18} />
                        변경 저장
                    </button>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={async () => {
                            if (!confirm(`${interestRate}%의 이자를 모든 학생에게 지급하시겠습니까?`)) return;
                            const res = await fetch("/api/teacher/bank/interest", { method: "POST" });
                            const json = await res.json();
                            if (json.success) alert(`${json.count}명의 학생에게 이자가 지급되었습니다.`);
                            else alert(json.message || "오류 발생");
                        }}
                        style={{

                            border: 'none',
                            color: '#059669', // Emerald 600
                            background: '#ecfdf5', // Emerald 50
                            padding: '0.5rem 1rem',
                            borderRadius: '999px',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '600'
                        }}
                    >
                        💰 모든 학생에게 이자 즉시 지급하기
                    </button>
                </div>
            </div>

            {/* Stock Market */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
                    <TrendingUp style={{ color: '#2563eb' }} />
                    주식 시장 관리
                </h2>
                <button
                    onClick={() => setShowAddStock(true)}
                    style={{
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '0.875rem 1.5rem',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(37, 99, 235, 0.25)'
                    }}
                >
                    <Plus size={20} />
                    종목 상장
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {stocks.map((stock) => (
                    <div key={stock.id} style={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderLeft: '5px solid #3b82f6',
                        borderRadius: '20px',
                        padding: '1.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{stock.name}</h3>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: '600' }}>현재 주가</p>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace', letterSpacing: '-1px' }}>
                                    ₩{(stock.current_price !== undefined ? stock.current_price : stock.currentPrice)?.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div style={{ paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '500' }}>주가 변경</p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="number"
                                    placeholder="새 가격"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleUpdatePrice(stock.id, Number(e.currentTarget.value));
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        background: '#f8fafc',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '10px',
                                        padding: '0.75rem',
                                        color: '#0f172a',
                                        fontSize: '1.125rem',
                                        fontWeight: '600'
                                    }}
                                />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right', marginTop: '0.5rem' }}>엔터키로 즉시 반영</p>

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDeleteStock(stock.id, stock.name)}
                                style={{
                                    width: '100%',
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: '#fef2f2',
                                    border: '1px solid #fee2e2',
                                    borderRadius: '10px',
                                    color: '#dc2626',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#fee2e2';
                                    e.currentTarget.style.borderColor = '#fca5a5';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#fef2f2';
                                    e.currentTarget.style.borderColor = '#fee2e2';
                                }}
                            >
                                🗑️ 상장폐지
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Stock Modal */}
            {showAddStock && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '24px',
                        padding: '2.5rem',
                        width: '100%',
                        maxWidth: '480px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', // Softer shadow
                        color: '#0f172a',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '2rem', color: '#1e293b' }}>📈 새 종목 상장</h2>
                        <form onSubmit={handleCreateStock}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '1rem', fontWeight: '700', color: '#475569', marginBottom: '0.75rem' }}>종목명 (회사 이름)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="예: 삼성전자"
                                    value={newStock.name}
                                    onChange={e => setNewStock({ ...newStock, name: e.target.value })}
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        fontSize: '1.125rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '16px',
                                        outline: 'none',
                                        color: '#0f172a',
                                        fontWeight: '600',
                                        background: '#f8fafc'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ display: 'block', fontSize: '1rem', fontWeight: '700', color: '#475569', marginBottom: '0.75rem' }}>상장가 (초기 가격)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: '#94a3b8', fontSize: '1.25rem' }}>₩</span>
                                    <input
                                        type="number"
                                        required
                                        value={newStock.currentPrice}
                                        onChange={e => setNewStock({ ...newStock, currentPrice: Number(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '1rem 1rem 1rem 3rem',
                                            fontSize: '1.5rem',
                                            fontFamily: 'monospace',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '16px',
                                            outline: 'none',
                                            color: '#0f172a',
                                            fontWeight: '700',
                                            background: '#f8fafc'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddStock(false)}
                                    style={{
                                        padding: '1rem 2rem',
                                        borderRadius: '16px',
                                        border: '2px solid #e2e8f0',
                                        background: 'white',
                                        color: '#64748b',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '1rem 2.5rem',
                                        borderRadius: '16px',
                                        border: 'none',
                                        background: '#2563eb',
                                        color: 'white',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                                    }}
                                >
                                    상장하기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
