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
                alert("嫄곕옒 ?꾨즺!");
                setSelectedStock(null);
                setQuantity(1);
                fetchData();
            }
        } catch (e) {
            alert("嫄곕옒 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">二쇱떇 嫄곕옒??/h1>
                <div className="bg-slate-900 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
                    <span className="text-slate-400 text-sm">???꾧툑:</span>
                    <span className="font-mono font-bold text-emerald-400">??myCash.toLocaleString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center py-10">?쒖옣 ?곗씠?곕? 遺덈윭?ㅻ뒗 以?..</div>
                ) : stocks.map((stock) => (
                    <div key={stock.id} className="glass-panel p-6 border-l-4 border-l-secondary/50 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">{stock.name}</h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-mono font-bold">??stock.currentPrice}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between text-sm text-slate-400 mb-4">
                                <span>蹂댁쑀 ?섎웾:</span>
                                <span className="text-white font-mono">{portfolio[stock.id] || 0} 二?/span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => openTradeModal(stock, "BUY")}
                                    className="btn btn-primary w-full py-2"
                                >
                                    留ㅼ닔
                                </button>
                                <button
                                    onClick={() => openTradeModal(stock, "SELL")}
                                    className="btn btn-outline w-full py-2 disabled:opacity-50"
                                    disabled={!portfolio[stock.id]}
                                >
                                    留ㅻ룄
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trade Modal */}
            {selectedStock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
