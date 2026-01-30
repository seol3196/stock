"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, TrendingUp, Coins, Wallet, PiggyBank } from "lucide-react";

interface StudentRanking {
    id: string;
    name: string;
    username: string;
    cash: number;
    savingsBalance: number;
    stockValue: number;
    totalAssets: number;
}

export default function RankingPage() {
    const [students, setStudents] = useState<StudentRanking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRankingData();
    }, []);

    const fetchRankingData = async () => {
        try {
            const res = await fetch("/api/teacher/students");
            if (res.ok) {
                const data = await res.json();
                // Calculate total assets and sort
                const rankings = data.map((s: any) => {
                    const stockValue = s.portfolio?.reduce(
                        (acc: number, p: any) => acc + (p.quantity * p.stock.currentPrice), 0
                    ) || 0;
                    const totalAssets = (s.cash || 0) + (s.savingsBalance || 0) + stockValue;
                    return {
                        id: s.id,
                        name: s.name,
                        username: s.username,
                        cash: s.cash || 0,
                        savingsBalance: s.savingsBalance || 0,
                        stockValue,
                        totalAssets
                    };
                }).sort((a: StudentRanking, b: StudentRanking) => b.totalAssets - a.totalAssets);
                setStudents(rankings);
            }
        } catch (e) {
            console.error("Failed to load ranking data", e);
        } finally {
            setLoading(false);
        }
    };

    const getRankStyle = (rank: number) => {
        if (rank === 1) return { background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "white" };
        if (rank === 2) return { background: "linear-gradient(135deg, #9ca3af, #6b7280)", color: "white" };
        if (rank === 3) return { background: "linear-gradient(135deg, #d97706, #b45309)", color: "white" };
        return { background: "#f1f5f9", color: "#64748b" };
    };

    const getRankIcon = (rank: number) => {
        if (rank <= 3) return <Medal size={16} />;
        return null;
    };

    return (
        <div style={{ color: '#0f172a' }}>
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Trophy size={32} style={{ color: '#f59e0b' }} />
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', margin: 0 }}>
                        학생 랭킹
                    </h1>
                </div>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    총 자산 기준으로 정렬된 학생 순위입니다.
                </p>
            </div>

            {/* Stats Summary */}
            {students.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid #fcd34d'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Trophy size={20} style={{ color: '#d97706' }} />
                            <span style={{ fontWeight: '600', color: '#92400e' }}>1위</span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#78350f' }}>
                            {students[0]?.name || '-'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#a16207' }}>
                            {students[0]?.totalAssets.toLocaleString()}원
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch'
            }}>
                <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b', width: '80px' }}>순위</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>학생</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                    <TrendingUp size={14} /> 총 자산
                                </div>
                            </th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                    <Coins size={14} /> 주식 평가액
                                </div>
                            </th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                    <PiggyBank size={14} /> 예금
                                </div>
                            </th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                    <Wallet size={14} /> 현금
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    로딩 중...
                                </td>
                            </tr>
                        ) : students.length > 0 ? (
                            students.map((student, index) => {
                                const rank = index + 1;
                                const rankStyle = getRankStyle(rank);
                                return (
                                    <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.25rem',
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px',
                                                fontWeight: '800',
                                                fontSize: rank <= 3 ? '1rem' : '0.9rem',
                                                ...rankStyle
                                            }}>
                                                {getRankIcon(rank)}
                                                {rank}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{student.name}</div>
                                            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>@{student.username}</div>
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontFamily: 'monospace',
                                            fontWeight: '700',
                                            fontSize: '1.1rem',
                                            color: '#2563eb'
                                        }}>
                                            {student.totalAssets.toLocaleString()}원
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontFamily: 'monospace',
                                            color: student.stockValue > 0 ? '#059669' : '#94a3b8'
                                        }}>
                                            {student.stockValue.toLocaleString()}원
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontFamily: 'monospace',
                                            color: student.savingsBalance > 0 ? '#7c3aed' : '#94a3b8'
                                        }}>
                                            {student.savingsBalance.toLocaleString()}원
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontFamily: 'monospace',
                                            color: '#64748b'
                                        }}>
                                            {student.cash.toLocaleString()}원
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    등록된 학생이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
