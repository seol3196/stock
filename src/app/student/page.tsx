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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                {/* Total Assets Card - Hero Section */}
                <div className="glass-panel p-4 md:p-6 lg:p-8 bg-gradient-to-br from-primary/20 to-slate-900 border-primary/30">
                    <p className="text-lg md:text-xl font-bold text-primary-foreground/90 mb-2 flex items-center gap-2">
                        <span className="text-xl md:text-2xl">💰</span> 총 자산 (순자산)
                    </p>
                    {/* Responsive font size for Total Assets */}
                    <h2 className="font-black font-mono tracking-tight text-white mb-4 md:mb-6" style={{ fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', lineHeight: 1 }}>
                        ₩{totalAssets.toLocaleString()}
                    </h2>

                    {/* Responsive Profit Section */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 bg-slate-800/60 p-3 md:p-4 lg:p-6 rounded-xl border border-white/10">
                        <div className={`font-black font-mono ${totalProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`} style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)' }}>
                            {totalProfit >= 0 ? "+" : ""}{totalProfit.toLocaleString()}
                            <span className="ml-2 md:ml-3 text-white/90 font-bold" style={{ fontSize: 'clamp(1.125rem, 4vw, 1.75rem)' }}>
                                ({profitPercent.toFixed(1)}%)
                            </span>
                        </div>
                        <span className="text-slate-200 font-bold md:ml-auto" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>전체 수익</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Cash Card */}
                    <div className="glass-panel p-4 md:p-6 flex flex-col justify-center bg-slate-800/40 border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-slate-100 font-bold text-lg md:text-xl flex items-center gap-2 md:gap-3">
                                <Wallet size={24} className="text-slate-300 md:w-7 md:h-7" />
                                현금 (지갑)
                            </div>
                        </div>
                        <div className="font-bold font-mono text-white text-right" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
                            ₩{data.cash.toLocaleString()}
                        </div>
                    </div>

                    {/* Savings Card */}
                    <div className="glass-panel p-6 flex flex-col justify-center bg-slate-800/40 border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-blue-100 font-bold text-xl flex items-center gap-3">
                                <PiggyBank size={24} className="text-blue-400 md:w-7 md:h-7" />
                                예금 (저축)
                            </div>
                        </div>
                        <div className="font-bold font-mono text-blue-300 text-right" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
                            ₩{data.savingsBalance.toLocaleString()}
                        </div>
                    </div>

                    {/* Stocks Card */}
                    <div className="glass-panel p-6 flex flex-col justify-center bg-slate-800/40 border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-purple-100 font-bold text-xl flex items-center gap-3">
                                <TrendingUp size={24} className="text-purple-400 md:w-7 md:h-7" />
                                주식 평가액
                            </div>
                        </div>
                        <div className="font-bold font-mono text-purple-300 text-right" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
                            ₩{stockValue.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 mt-8 md:mt-12 border-b border-white/10 pb-3 md:pb-4">
                📊 보유 주식 (포트폴리오)
            </h2>

            {data.portfolio.length === 0 ? (
                <div className="glass-panel p-8 md:p-12 lg:p-16 text-center bg-slate-800/30">
                    <p className="text-lg md:text-xl lg:text-2xl text-white font-bold mb-2">보유 중인 주식이 없습니다.</p>
                    <p className="text-base md:text-lg text-slate-300">주식 거래소에서 투자를 시작보세요!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {data.portfolio.map((item: any) => {
                        const currentVal = item.quantity * item.stock.currentPrice;
                        const buyVal = item.quantity * item.averageBuyPrice;
                        const profit = currentVal - buyVal;
                        const profitP = buyVal > 0 ? (profit / buyVal) * 100 : 0;

                        return (
                            <div key={item.id} className="glass-panel p-4 md:p-6 bg-slate-800/40 border-slate-700 hover:bg-slate-800/60 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Stock Name & Quantity */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {/* Code removed */}
                                            <h3 className="text-xl md:text-2xl font-bold text-white">{item.stock.name}</h3>
                                        </div>
                                        <div className="text-base md:text-lg text-slate-200 font-medium ml-1">
                                            <span className="text-white font-bold text-lg md:text-xl">{item.quantity}주</span> 보유
                                        </div>
                                    </div>

                                    {/* Valuation & Profit */}
                                    <div className="text-right">
                                        <div className="font-bold font-mono text-white mb-2" style={{ fontSize: 'clamp(1.25rem, 4vw, 2rem)' }}>
                                            ₩{currentVal.toLocaleString()}
                                        </div>
                                        <div className={`text-sm md:text-base lg:text-lg font-bold font-mono py-1 px-2 md:px-3 rounded-lg inline-block ${profit >= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                                            {profit >= 0 ? "▲" : "▼"} {Math.abs(profit).toLocaleString()}
                                            <span className="ml-1 md:ml-2 text-white/90">({profitP.toFixed(1)}%)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
