"use client";

import { useEffect, useState } from "react";
import { DollarSign, Wallet, TrendingUp, PiggyBank } from "lucide-react";

export default function StudentDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/student/dashboard")
            .then((res) => res.json())
            .then((data) => setData(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center text-xl text-white">자산 정보를 불러오는 중...</div>;
    if (!data) return <div className="p-8 text-center text-red-400 text-xl font-bold">데이터 로드 실패</div>;

    const stockValue = data.portfolio.reduce(
        (acc: number, item: any) => acc + item.quantity * item.stock.currentPrice,
        0
    );

    const totalAssets = data.cash + data.savingsBalance + stockValue;

    // Calculate total profit
    const totalInvested = data.portfolio.reduce(
        (acc: number, item: any) => acc + item.quantity * item.averageBuyPrice,
        0
    );

    const totalProfit = stockValue - totalInvested;
    const profitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return (
        <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6 lg:mb-8">내 자산 현황</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }} className="asset-grid">
                {/* Left: Total Assets Hero Card */}
                <div className="glass-panel p-6 bg-gradient-to-br from-primary/20 to-slate-900 border-primary/30" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <p className="text-lg font-bold text-primary-foreground/90 mb-2 flex items-center gap-2">
                        <span className="text-xl">💰</span> 총 자산 (순자산)
                    </p>
                    <h2 className="font-black font-mono tracking-tight text-white mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1 }}>
                        ₩{totalAssets.toLocaleString()}
                    </h2>

                    <div className="bg-slate-800/60 p-4 rounded-xl border border-white/10">
                        <span className="text-slate-300 font-semibold text-sm mb-1 block">전체 수익</span>
                        <div className={`font-bold font-mono ${totalProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`} style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
                            {totalProfit >= 0 ? "+" : ""}{totalProfit.toLocaleString()}
                            <span className="ml-2 text-white/90 font-bold" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                                ({profitPercent.toFixed(1)}%)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Cash, Savings, Stock Cards in Grid */}
                <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {/* Cash Card */}
                    <div className="glass-panel p-4 flex items-center justify-between bg-slate-800/40 border-slate-700">
                        <div className="text-slate-100 font-bold text-base flex items-center gap-2">
                            <Wallet size={22} className="text-slate-300" />
                            현금 (지갑)
                        </div>
                        <div className="font-bold font-mono text-white" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
                            ₩{data.cash.toLocaleString()}
                        </div>
                    </div>

                    {/* Savings Card */}
                    <div className="glass-panel p-4 flex items-center justify-between bg-slate-800/40 border-slate-700">
                        <div className="text-blue-100 font-bold text-base flex items-center gap-2">
                            <PiggyBank size={22} className="text-blue-400" />
                            예금 (저축)
                        </div>
                        <div className="font-bold font-mono text-blue-300" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
                            ₩{data.savingsBalance.toLocaleString()}
                        </div>
                    </div>

                    {/* Stocks Card */}
                    <div className="glass-panel p-4 flex items-center justify-between bg-slate-800/40 border-slate-700">
                        <div className="text-purple-100 font-bold text-base flex items-center gap-2">
                            <TrendingUp size={22} className="text-purple-400" />
                            주식 평가액
                        </div>
                        <div className="font-bold font-mono text-purple-300" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
                            ₩{stockValue.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Asset Distribution Bar Chart */}
            {totalAssets > 0 && (() => {
                // Generate distinct colors for each stock
                const stockColors = ['#a855f7', '#ec4899', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6'];

                return (
                    <div className="glass-panel p-5 bg-slate-800/40 border-slate-700 mb-8">
                        <p className="text-white font-bold text-base mb-3">📊 자산 비율</p>

                        {/* Stacked Bar */}
                        <div style={{
                            display: 'flex',
                            height: '36px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: '#1e293b',
                            position: 'relative'
                        }}>
                            {/* Cash */}
                            {data.cash > 0 && (
                                <div
                                    style={{
                                        width: `${(data.cash / totalAssets) * 100}%`,
                                        background: 'linear-gradient(135deg, #64748b, #475569)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'filter 0.2s'
                                    }}
                                    title={`현금: ₩${data.cash.toLocaleString()} (${((data.cash / totalAssets) * 100).toFixed(1)}%)`}
                                    onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
                                    onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                                >
                                    {data.cash / totalAssets > 0.1 && (
                                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'white' }}>현금</span>
                                    )}
                                </div>
                            )}
                            {/* Savings */}
                            {data.savingsBalance > 0 && (
                                <div
                                    style={{
                                        width: `${(data.savingsBalance / totalAssets) * 100}%`,
                                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'filter 0.2s'
                                    }}
                                    title={`예금: ₩${data.savingsBalance.toLocaleString()} (${((data.savingsBalance / totalAssets) * 100).toFixed(1)}%)`}
                                    onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
                                    onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                                >
                                    {data.savingsBalance / totalAssets > 0.1 && (
                                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'white' }}>예금</span>
                                    )}
                                </div>
                            )}
                            {/* Individual Stocks */}
                            {data.portfolio.map((item: any, index: number) => {
                                const itemValue = item.quantity * item.stock.currentPrice;
                                const itemPercent = (itemValue / totalAssets) * 100;
                                const color = stockColors[index % stockColors.length];

                                return itemValue > 0 ? (
                                    <div
                                        key={item.id}
                                        style={{
                                            width: `${itemPercent}%`,
                                            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'filter 0.2s'
                                        }}
                                        title={`${item.stock.name}: ₩${itemValue.toLocaleString()} (${itemPercent.toFixed(1)}%) - ${item.quantity}주 × ₩${item.stock.currentPrice.toLocaleString()}`}
                                        onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
                                        onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                                    >
                                        {itemPercent > 12 && (
                                            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 4px' }}>
                                                {item.stock.name}
                                            </span>
                                        )}
                                    </div>
                                ) : null;
                            })}
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#64748b' }}></div>
                                <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: '600' }}>현금 {((data.cash / totalAssets) * 100).toFixed(1)}%</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3b82f6' }}></div>
                                <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: '600' }}>예금 {((data.savingsBalance / totalAssets) * 100).toFixed(1)}%</span>
                            </div>
                            {data.portfolio.map((item: any, index: number) => {
                                const itemValue = item.quantity * item.stock.currentPrice;
                                const itemPercent = (itemValue / totalAssets) * 100;
                                const color = stockColors[index % stockColors.length];

                                return itemValue > 0 ? (
                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color }}></div>
                                        <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: '600' }}>{item.stock.name} {itemPercent.toFixed(1)}%</span>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* Mobile-friendly CSS */}
            <style jsx>{`
                @media (max-width: 768px) {
                    .asset-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 mt-8 md:mt-12 border-b border-white/10 pb-3 md:pb-4">
                📊 보유 주식 (포트폴리오)
            </h2>

            {data.portfolio.length === 0 ? (
                <div className="glass-panel p-8 md:p-12 lg:p-16 text-center bg-slate-800/30">
                    <p className="text-lg md:text-xl lg:text-2xl text-white font-bold mb-2">보유 중인 주식이 없습니다.</p>
                    <p className="text-base md:text-lg text-slate-300">주식 거래소에서 투자를 시작보세요!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }} className="portfolio-grid">
                    {data.portfolio.map((item: any) => {
                        const currentVal = item.quantity * item.stock.currentPrice;
                        const buyVal = item.quantity * item.averageBuyPrice;
                        const profit = currentVal - buyVal;
                        const profitP = buyVal > 0 ? (profit / buyVal) * 100 : 0;

                        return (
                            <div key={item.id} style={{
                                background: 'rgba(255,255,255,0.95)',
                                borderRadius: '16px',
                                padding: '1.25rem',
                                border: '1px solid #e2e8f0'
                            }}>
                                {/* Stock Name & Quantity */}
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>{item.stock.name}</h3>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                        <span style={{ fontWeight: 'bold', color: '#334155' }}>{item.quantity}주</span> 보유
                                    </div>
                                </div>

                                {/* Valuation */}
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#0f172a', marginBottom: '0.5rem' }}>
                                    ₩{currentVal.toLocaleString()}
                                </div>

                                {/* Profit/Loss */}
                                <div
                                    style={{
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        fontFamily: 'monospace',
                                        padding: '0.4rem 0.75rem',
                                        borderRadius: '6px',
                                        display: 'inline-block',
                                        background: profit >= 0 ? '#dcfce7' : '#fee2e2',
                                        color: profit >= 0 ? '#166534' : '#dc2626'
                                    }}
                                >
                                    {profit >= 0 ? "▲" : "▼"} {Math.abs(profit).toLocaleString()}
                                    <span style={{ marginLeft: '0.4rem', color: profit >= 0 ? '#15803d' : '#b91c1c' }}>({profitP.toFixed(1)}%)</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Additional mobile CSS for portfolio grid */}
            <style jsx>{`
                @media (max-width: 768px) {
                    .portfolio-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
