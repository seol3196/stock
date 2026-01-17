"use client";

import { useState, useEffect } from "react";
import { Search, TrendingUp, ShoppingCart, DollarSign, X, Minus, Plus } from "lucide-react";

export default function TradePage() {
    const [stocks, setStocks] = useState<any[]>([]);
    const [myCash, setMyCash] = useState(0);
    const [portfolio, setPortfolio] = useState<Record<string, number>>({}); // stockId -> quantity
    const [loading, setLoading] = useState(true);

    // Trade Modal State
    const [selectedStock, setSelectedStock] = useState<any>(null);
    const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
    const [quantity, setQuantity] = useState(1);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch stocks
            const stockRes = await fetch("/api/student/market");
            const stockData = await stockRes.json();
            setStocks(stockData);

            // Fetch my info for cash and portfolio
            const myRes = await fetch("/api/student/dashboard");
            const myData = await myRes.json();
            setMyCash(myData.cash);

            const port: Record<string, number> = {};
            myData.portfolio.forEach((p: any) => {
                port[p.stockId] = p.quantity;
            });
            setPortfolio(port);

        } finally {
            setLoading(false);
        }
    };

    const handleTrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStock) return;
        setProcessing(true);

        try {
            const res = await fetch("/api/student/market", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stockId: selectedStock.id,
                    type: tradeType,
                    quantity: Number(quantity)
                })
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.error);
            } else {
                alert("거래 완료!");
                setSelectedStock(null);
                setQuantity(1);
                fetchData();
            }
        } catch (e) {
            alert("거래 중 오류가 발생했습니다.");
        } finally {
            setProcessing(false);
        }
    };

    const openTradeModal = (stock: any, type: "BUY" | "SELL") => {
        setSelectedStock(stock);
        setTradeType(type);
        setQuantity(1);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">주식 거래소</h1>
                <div className="bg-slate-800 px-6 py-3 rounded-xl border border-white/10 flex items-center gap-3 shadow-lg">
                    <span className="text-slate-300 text-lg font-bold">내 현금:</span>
                    <span className="font-mono font-bold text-emerald-400" style={{ fontSize: '1.5rem' }}>₩{myCash.toLocaleString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center py-10 text-xl text-white">시장 데이터를 불러오는 중...</div>
                ) : stocks.map((stock) => (
                    <div key={stock.id} className="glass-panel p-6 border-l-4 border-l-secondary/50 flex flex-col justify-between bg-slate-800/40 hover:bg-slate-800/60 transition-all border-slate-700">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{stock.name}</h3>
                                    {/* Code removed */}
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-black text-white" style={{ fontSize: '2rem' }}>₩{stock.currentPrice.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center text-slate-200 font-medium mb-4">
                                <span className="text-lg">보유 수량:</span>
                                <span className="text-white font-mono font-bold" style={{ fontSize: '1.5rem' }}>{portfolio[stock.id] || 0} 주</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => openTradeModal(stock, "BUY")}
                                    className="btn btn-primary w-full py-3 text-lg font-bold shadow-md hover:scale-[1.02] transition-transform"
                                >
                                    매수
                                </button>
                                <button
                                    onClick={() => openTradeModal(stock, "SELL")}
                                    className="btn btn-outline w-full py-3 text-lg font-bold disabled:opacity-30 disabled:hover:scale-100 hover:scale-[1.02] transition-transform bg-transparent border-slate-500 text-white hover:bg-white/10"
                                    disabled={!portfolio[stock.id]}
                                >
                                    매도
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trade Modal - Light Theme Verified */}
            {selectedStock && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 50,
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
                        maxWidth: '500px',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        color: '#0f172a'
                    }} className="animate-fade-in">

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedStock(null)}
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
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        >
                            <X size={24} />
                        </button>

                        {/* Header */}
                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '999px',
                                background: tradeType === "BUY" ? '#eff6ff' : '#fff7ed',
                                color: tradeType === "BUY" ? '#2563eb' : '#ea580c',
                                marginBottom: '1rem',
                                fontWeight: 'bold',
                                fontSize: '1rem'
                            }}>
                                <TrendingUp size={20} />
                                {tradeType === "BUY" ? "매수 주문" : "매도 주문"}
                            </div>
                            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.5rem', color: '#0f172a' }}>
                                {selectedStock.name}
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
                                현재가: <span style={{ color: '#0f172a', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.25rem' }}>₩{selectedStock.currentPrice.toLocaleString()}</span>
                            </p>
                        </div>

                        <form onSubmit={handleTrade}>
                            {/* Quantity Control Area */}
                            <div style={{
                                background: '#f8fafc',
                                borderRadius: '20px',
                                padding: '1.5rem',
                                marginBottom: '2rem',
                                border: '1px solid #e2e8f0'
                            }}>
                                <label style={{ display: 'block', color: '#64748b', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
                                    주문 수량
                                </label>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '16px',
                                            background: 'white',
                                            border: '1px solid #cbd5e1',
                                            color: '#64748b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.borderColor = '#94a3b8';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.borderColor = '#cbd5e1';
                                        }}
                                    >
                                        <Minus size={28} />
                                    </button>

                                    <div style={{ width: '120px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '4rem', fontWeight: '800', fontFamily: 'monospace', lineHeight: 1, color: '#0f172a' }}>
                                            {quantity}
                                        </div>
                                        <div style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.25rem' }}>주</div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setQuantity(quantity + 1)}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '16px',
                                            background: 'white',
                                            border: '1px solid #cbd5e1',
                                            color: '#64748b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.borderColor = '#94a3b8';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.borderColor = '#cbd5e1';
                                        }}
                                    >
                                        <Plus size={28} />
                                    </button>
                                </div>

                                {/* Quick Select Buttons */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                                    {[1, 5, 10, 50].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setQuantity(num)}
                                            style={{
                                                padding: '0.75rem',
                                                borderRadius: '10px',
                                                background: 'white',
                                                border: '1px solid #e2e8f0',
                                                color: '#64748b',
                                                fontSize: '1rem',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                transition: 'all 0.1s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = tradeType === "BUY" ? '#eff6ff' : '#fff7ed';
                                                e.currentTarget.style.color = tradeType === "BUY" ? '#2563eb' : '#ea580c';
                                                e.currentTarget.style.borderColor = tradeType === "BUY" ? '#bfdbfe' : '#fed7aa';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = 'white';
                                                e.currentTarget.style.color = '#64748b';
                                                e.currentTarget.style.borderColor = '#e2e8f0';
                                            }}
                                        >
                                            {num}주
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Total Price */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 0.5rem' }}>
                                <span style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>총 주문 금액</span>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace' }}>
                                        ₩{(selectedStock.currentPrice * quantity).toLocaleString()}
                                    </div>
                                    {tradeType === "BUY" && (
                                        <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: myCash >= selectedStock.currentPrice * quantity ? '#16a34a' : '#dc2626' }}>
                                            {myCash >= selectedStock.currentPrice * quantity ? "구매 가능" : "잔액 부족"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || (tradeType === "BUY" && myCash < selectedStock.currentPrice * quantity)}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    borderRadius: '16px',
                                    background: tradeType === "BUY" ? '#2563eb' : '#ea580c',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    opacity: (processing || (tradeType === "BUY" && myCash < selectedStock.currentPrice * quantity)) ? 0.5 : 1,
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {processing ? "처리 중..." : (tradeType === "BUY" ? "매수 확정" : "매도 확정")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
