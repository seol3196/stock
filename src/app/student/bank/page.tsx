"use client";

import { useState, useEffect } from "react";
import { Landmark, ArrowRightLeft, PiggyBank, Wallet, X, Minus, Plus, CreditCard } from "lucide-react";

export default function BankPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [mode, setMode] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Quick select amounts
    const quickAmounts = [1000, 5000, 10000, 50000];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await fetch("/api/student/bank");
        const json = await res.json();
        setData(json);
        setLoading(false);
    };

    const openModal = (transactionMode: "DEPOSIT" | "WITHDRAW") => {
        setMode(transactionMode);
        setAmount("");
        setIsModalOpen(true);
    };

    const handleTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) return;
        setProcessing(true);

        try {
            const res = await fetch("/api/student/bank", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: Number(amount),
                    type: mode
                })
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.error);
            } else {
                alert("거래가 완료되었습니다.");
                setAmount("");
                setIsModalOpen(false);
                fetchData();
            }
        } catch (e) {
            alert("오류가 발생했습니다.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-xl text-white">은행 데이터를 불러오는 중...</div>;

    const maxAmount = mode === "DEPOSIT" ? data.cash : data.savingsBalance;

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                    <Landmark size={40} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">학생 은행</h1>
                    <p className="text-lg text-slate-300">현금을 저축하고 이자를 받아보세요.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Savings Card */}
                <div className="glass-panel p-8 bg-gradient-to-br from-blue-900/40 to-slate-900 border-blue-500/30">
                    <div className="text-blue-100 text-xl font-bold mb-4 flex items-center gap-2">
                        <PiggyBank size={28} className="text-blue-300" />
                        내 예금 잔액
                    </div>
                    <div className="font-black font-mono text-blue-300 mb-6" style={{ fontSize: '3rem', lineHeight: 1 }}>
                        ₩{data.savingsBalance.toLocaleString()}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
                        <span className="text-blue-200 text-lg">현재 금리 (연이율)</span>
                        <span className="font-black text-white text-2xl px-3 py-1 bg-blue-500/20 rounded-lg">
                            {data.teacher.interestRate}%
                        </span>
                    </div>
                </div>

                {/* Cash Card */}
                <div className="glass-panel p-8 bg-slate-800/40 border-slate-700">
                    <div className="text-slate-200 text-xl font-bold mb-4 flex items-center gap-2">
                        <Wallet size={28} className="text-slate-400" />
                        내 지갑 (현금)
                    </div>
                    <div className="font-black font-mono text-white" style={{ fontSize: '3rem', lineHeight: 1 }}>
                        ₩{data.cash.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Action Buttons - Force Styled for Beautiful UI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* Deposit Button */}
                <button
                    onClick={() => openModal("DEPOSIT")}
                    style={{
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        borderRadius: '24px',
                        padding: '2rem',
                        textAlign: 'left',
                        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        transform: 'translateY(0)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 20px 30px -5px rgba(37, 99, 235, 0.5)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(37, 99, 235, 0.4)';
                    }}
                >
                    <div style={{ position: 'absolute', top: '-10px', right: '-20px', opacity: 0.15, transform: 'rotate(15deg)' }}>
                        <PiggyBank size={140} color="white" />
                    </div>
                    <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <ArrowRightLeft size={32} color="white" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>저축하기 (입금)</h2>
                            <p style={{ color: '#dbeafe', fontSize: '1.125rem', fontWeight: '500' }}>현금을 통장에 넣어두세요</p>
                        </div>
                    </div>
                </button>

                {/* Withdraw Button */}
                <button
                    onClick={() => openModal("WITHDRAW")}
                    style={{
                        position: 'relative',
                        overflow: 'hidden',
                        background: '#1e293b', // slate-800
                        borderRadius: '24px',
                        padding: '2rem',
                        textAlign: 'left',
                        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
                        border: '1px solid #334155',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        transform: 'translateY(0)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 20px 30px -5px rgba(15, 23, 42, 0.5)';
                        e.currentTarget.style.background = '#0f172a'; // darker on hover
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(15, 23, 42, 0.4)';
                        e.currentTarget.style.background = '#1e293b';
                    }}
                >
                    <div style={{ position: 'absolute', top: '-10px', right: '-20px', opacity: 0.1, transform: 'rotate(15deg)' }}>
                        <CreditCard size={140} color="white" />
                    </div>
                    <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <Wallet size={32} color="white" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>출금하기 (찾기)</h2>
                            <p style={{ color: '#94a3b8', fontSize: '1.125rem', fontWeight: '500' }}>통장에서 현금을 꺼내세요</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Transaction Modal -> Inline Styles for Safety */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '28px',
                        padding: '2.5rem',
                        width: '100%',
                        maxWidth: '480px',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                background: '#f1f5f9',
                                border: 'none',
                                color: '#64748b',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        >
                            <X size={24} />
                        </button>

                        {/* Modal Header */}
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '20px',
                                background: mode === "DEPOSIT" ? '#eff6ff' : '#f8fafc',
                                color: mode === "DEPOSIT" ? '#2563eb' : '#475569',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem auto'
                            }}>
                                {mode === "DEPOSIT" ? <PiggyBank size={32} /> : <Wallet size={32} />}
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
                                {mode === "DEPOSIT" ? "얼마를 저축할까요?" : "얼마를 찾으시나요?"}
                            </h2>
                            <p style={{ fontSize: '1.125rem', color: '#64748b', fontWeight: '500' }}>
                                {mode === "DEPOSIT" ? "내 지갑" : "통장 잔액"}: <span style={{ color: '#0f172a', fontWeight: 'bold' }}>₩{maxAmount.toLocaleString()}</span>
                            </p>
                        </div>

                        <form onSubmit={handleTransaction}>
                            {/* Input Area */}
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '1.5rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '1.75rem',
                                        fontWeight: 'bold',
                                        color: '#94a3b8'
                                    }}>₩</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                        autoFocus
                                        style={{
                                            width: '100%',
                                            padding: '1.25rem 1.5rem 1.25rem 3.5rem',
                                            fontSize: '2rem',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            fontFamily: 'monospace',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '20px',
                                            background: '#f8fafc',
                                            color: '#0f172a',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#3b82f6';
                                            e.target.style.background = '#fff';
                                            e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                            e.target.style.background = '#f8fafc';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>

                                {/* Quick Amounts */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
                                    {quickAmounts.map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setAmount(String((Number(amount) || 0) + amt))}
                                            style={{
                                                padding: '0.5rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                background: 'white',
                                                color: '#64748b',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.1s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.borderColor = '#94a3b8';
                                                e.currentTarget.style.color = '#0f172a';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.borderColor = '#e2e8f0';
                                                e.currentTarget.style.color = '#64748b';
                                            }}
                                        >
                                            +{amt.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !amount || Number(amount) <= 0}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    borderRadius: '18px',
                                    background: mode === "DEPOSIT" ? '#2563eb' : '#334155',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)',
                                    transform: 'scale(1)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    if (!processing) e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    if (!processing) e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {processing ? "처리 중..." : (mode === "DEPOSIT" ? "저축하기" : "출금하기")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
