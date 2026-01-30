"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Circle, BookOpen, HelpCircle, RotateCcw, Lock } from "lucide-react";
import { sections, getAllChapters, getChapterById, getAdjacentChapters } from "./content";
import { getQuizByChapterId, checkTextAnswer, isQuizPassed, Question } from "./quizzes";

export default function LearnPage() {
    const router = useRouter();
    const [currentChapterId, setCurrentChapterId] = useState("1-1");
    const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["main", "essay"]));

    // 퀴즈 상태
    const [userAnswers, setUserAnswers] = useState<Record<string, Record<number, string>>>({});
    const [showResults, setShowResults] = useState<Record<string, boolean>>({});
    const [textInputs, setTextInputs] = useState<Record<number, string>>({});

    // Load completed chapters from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("completedChapters");
        if (saved) {
            setCompletedChapters(new Set(JSON.parse(saved)));
        }
        const savedAnswers = localStorage.getItem("quizAnswers");
        if (savedAnswers) {
            setUserAnswers(JSON.parse(savedAnswers));
        }
        const savedResults = localStorage.getItem("quizResults");
        if (savedResults) {
            setShowResults(JSON.parse(savedResults));
        }
    }, []);

    // Save completed chapters to localStorage
    useEffect(() => {
        localStorage.setItem("completedChapters", JSON.stringify([...completedChapters]));
    }, [completedChapters]);

    // Save quiz answers to localStorage
    useEffect(() => {
        localStorage.setItem("quizAnswers", JSON.stringify(userAnswers));
    }, [userAnswers]);

    useEffect(() => {
        localStorage.setItem("quizResults", JSON.stringify(showResults));
    }, [showResults]);

    // Reset text inputs when chapter changes
    useEffect(() => {
        setTextInputs({});
    }, [currentChapterId]);

    const currentChapter = getChapterById(currentChapterId);
    const { prev, next } = getAdjacentChapters(currentChapterId);
    const allChapters = getAllChapters();
    const progress = Math.round((completedChapters.size / allChapters.length) * 100);

    // 현재 챕터 퀴즈
    const currentQuiz = getQuizByChapterId(currentChapterId);
    const chapterAnswers = userAnswers[currentChapterId] || {};
    const hasSubmitted = showResults[currentChapterId] || false;

    // 정답 개수 계산
    const getCorrectCount = () => {
        if (!currentQuiz) return 0;
        return currentQuiz.questions.filter(q => {
            const userAnswer = chapterAnswers[q.id];
            if (!userAnswer) return false;
            if (q.type === 'text' && q.acceptableAnswers) {
                return checkTextAnswer(userAnswer, q.acceptableAnswers);
            }
            return userAnswer === q.answer;
        }).length;
    };

    const correctCount = getCorrectCount();
    const totalCount = currentQuiz?.questions.length || 5;
    const quizPassed = isQuizPassed(correctCount, totalCount);
    const canComplete = hasSubmitted && quizPassed;

    const toggleComplete = () => {
        if (!canComplete && !completedChapters.has(currentChapterId)) return;
        setCompletedChapters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(currentChapterId)) {
                newSet.delete(currentChapterId);
            } else {
                newSet.add(currentChapterId);
            }
            return newSet;
        });
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };

    // 답변 저장
    const handleAnswer = (questionId: number, answer: string) => {
        if (hasSubmitted) return;
        setUserAnswers(prev => ({
            ...prev,
            [currentChapterId]: {
                ...prev[currentChapterId],
                [questionId]: answer
            }
        }));
    };

    // 퀴즈 제출
    const handleSubmitQuiz = () => {
        setShowResults(prev => ({
            ...prev,
            [currentChapterId]: true
        }));
    };

    // 다시 풀기
    const handleRetry = () => {
        setUserAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[currentChapterId];
            return newAnswers;
        });
        setShowResults(prev => ({
            ...prev,
            [currentChapterId]: false
        }));
        setTextInputs({});
    };

    // 주관식 답변 확인
    const handleTextSubmit = (questionId: number) => {
        const input = textInputs[questionId] || '';
        handleAnswer(questionId, input);
    };

    // 정답 확인
    const isCorrect = (question: Question): boolean => {
        const userAnswer = chapterAnswers[question.id];
        if (!userAnswer) return false;
        if (question.type === 'text' && question.acceptableAnswers) {
            return checkTextAnswer(userAnswer, question.acceptableAnswers);
        }
        return userAnswer === question.answer;
    };

    // 모든 문제에 답변했는지 확인
    const allAnswered = currentQuiz?.questions.every(q => chapterAnswers[q.id]) || false;

    // Convert markdown-like content to HTML
    const renderContent = (content: string) => {
        let html = content;

        // 테이블 블록 처리 (연속된 | 행들을 하나의 테이블로)
        const tableRegex = /(\|.+\|\n?)+/g;
        html = html.replace(tableRegex, (tableBlock) => {
            const rows = tableBlock.trim().split('\n').filter(row => row.trim());
            let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);"><tbody>';

            rows.forEach((row, idx) => {
                const cells = row.split('|').filter(c => c.trim());
                if (cells.some(c => c.includes('---') || c.includes(':--'))) return;

                const isHeader = idx === 0;
                if (isHeader) {
                    tableHtml += `<tr>${cells.map(c => `<th style="background: #667eea; color: white; padding: 0.75rem 1rem; text-align: left; font-weight: 600; font-size: 1rem;">${c.trim()}</th>`).join('')}</tr>`;
                } else {
                    tableHtml += `<tr>${cells.map(c => `<td style="padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; font-size: 1rem;">${c.trim()}</td>`).join('')}</tr>`;
                }
            });

            tableHtml += '</tbody></table>';
            return tableHtml;
        });

        // 블록쿼트 처리 (연속된 > 줄들을 하나의 블록으로)
        const blockquoteRegex = /(^> .+$\n?)+/gm;
        html = html.replace(blockquoteRegex, (blockquoteBlock) => {
            const lines = blockquoteBlock.trim().split('\n')
                .map(line => line.replace(/^> /, '').trim())
                .join('<br/>');
            return `<blockquote style="background: #f1f5f9; border-left: 5px solid #667eea; padding: 1rem 1.25rem; margin: 1.25rem 0; border-radius: 0 8px 8px 0; font-size: 1.1rem;">${lines}</blockquote>`;
        });

        // 나머지 마크다운 처리
        html = html
            .replace(/^## (.+)$/gm, '<h3 style="font-size: 1.5rem; color: #1e293b; margin: 2rem 0 1rem 0; padding-left: 1rem; border-left: 5px solid #667eea;">$1</h3>')
            .replace(/^### (.+)$/gm, '<h4 style="font-size: 1.25rem; color: #334155; margin: 1.5rem 0 0.75rem 0;">$1</h4>')
            .replace(/\*\*(.+?)\*\*/g, '<strong style="color: #667eea; font-weight: 700;">$1</strong>')
            .replace(/^- (.+)$/gm, '<li style="margin: 0.5rem 0; font-size: 1.1rem;">$1</li>');

        // 리스트 그룹화
        html = html.replace(/(<li.*?<\/li>\n?)+/g, '<ul style="margin: 1.25rem 0; padding-left: 1.75rem;">$&</ul>');

        // 줄바꿈 처리
        html = html.replace(/\n\n/g, '</p><p style="margin: 1.25rem 0; font-size: 1.1rem;">');
        html = html.replace(/\n(?!<)/g, '<br/>');

        return `<div style="line-height: 1.9; color: #334155; font-size: 1.1rem;"><p style="margin: 1.25rem 0; font-size: 1.1rem;">${html}</p></div>`;
    };



    // 설명 박스 스타일
    const explanationStyle = {
        marginTop: '0.75rem',
        padding: '0.75rem 1rem',
        background: '#fef3c7',
        borderRadius: '8px',
        borderLeft: '4px solid #f59e0b',
        fontSize: '0.95rem',
        color: '#92400e'
    };

    // 퀴즈 렌더링
    const renderQuiz = () => {
        if (!currentQuiz) return null;

        return (
            <div style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginTop: '2rem',
                border: '2px solid #f59e0b'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HelpCircle size={24} color="#d97706" />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#92400e' }}>📝 이해도 체크</h3>
                    </div>
                    {hasSubmitted && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{
                                padding: '0.5rem 1rem',
                                background: quizPassed ? '#22c55e' : '#ef4444',
                                color: 'white',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                fontSize: '0.95rem'
                            }}>
                                {correctCount}/{totalCount} {quizPassed ? '✓ 통과!' : '재도전 필요'}
                            </span>
                            <button
                                onClick={handleRetry}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    padding: '0.5rem 1rem',
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    color: '#475569',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <RotateCcw size={16} />
                                다시 풀기
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {currentQuiz.questions.map((q, idx) => (
                        <div key={q.id} style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            border: hasSubmitted
                                ? isCorrect(q) ? '2px solid #22c55e' : '2px solid #ef4444'
                                : '1px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem' }}>
                                <span style={{
                                    background: '#667eea',
                                    color: 'white',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    flexShrink: 0
                                }}>
                                    {idx + 1}
                                </span>
                                <p style={{ fontSize: '1.05rem', color: '#1e293b', lineHeight: '1.5' }}>{q.question}</p>
                            </div>

                            {/* O/X 문제 */}
                            {q.type === 'ox' && (
                                <>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginLeft: '2.25rem' }}>
                                        {['O', 'X'].map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => handleAnswer(q.id, opt)}
                                                disabled={hasSubmitted}
                                                style={{
                                                    padding: '0.625rem 1.5rem',
                                                    background: chapterAnswers[q.id] === opt
                                                        ? hasSubmitted
                                                            ? opt === q.answer ? '#22c55e' : '#ef4444'
                                                            : '#667eea'
                                                        : '#f1f5f9',
                                                    color: chapterAnswers[q.id] === opt ? 'white' : '#475569',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.1rem',
                                                    cursor: hasSubmitted ? 'default' : 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                    {hasSubmitted && !isCorrect(q) && (
                                        <div style={{ ...explanationStyle, marginLeft: '2.25rem' }}>
                                            💡 <strong>정답: {q.answer}</strong> — {q.explanation}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* 4지선다 문제 */}
                            {q.type === 'choice' && q.options && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '2.25rem' }}>
                                        {q.options.map((opt, optIdx) => {
                                            const optNum = String(optIdx + 1);
                                            const isSelected = chapterAnswers[q.id] === optNum;
                                            const isAnswer = q.answer === optNum;
                                            return (
                                                <button
                                                    key={optIdx}
                                                    onClick={() => handleAnswer(q.id, optNum)}
                                                    disabled={hasSubmitted}
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        background: isSelected
                                                            ? hasSubmitted
                                                                ? isAnswer ? '#22c55e' : '#ef4444'
                                                                : '#667eea'
                                                            : hasSubmitted && isAnswer ? '#dcfce7' : '#f8fafc',
                                                        color: isSelected ? 'white' : '#334155',
                                                        border: hasSubmitted && isAnswer && !isSelected ? '2px solid #22c55e' : '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        textAlign: 'left' as const,
                                                        fontWeight: isSelected ? 'bold' : 'normal',
                                                        fontSize: '1rem',
                                                        cursor: hasSubmitted ? 'default' : 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <span style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        background: isSelected ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {optIdx + 1}
                                                    </span>
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {hasSubmitted && !isCorrect(q) && (
                                        <div style={{ ...explanationStyle, marginLeft: '2.25rem' }}>
                                            💡 {q.explanation}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* 주관식 문제 */}
                            {q.type === 'text' && (
                                <div style={{ marginLeft: '2.25rem' }}>
                                    {!hasSubmitted ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={textInputs[q.id] || chapterAnswers[q.id] || ''}
                                                onChange={(e) => setTextInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                placeholder="답을 입력하세요"
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem 1rem',
                                                    border: '2px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    outline: 'none'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                            />
                                            <button
                                                onClick={() => handleTextSubmit(q.id)}
                                                disabled={!textInputs[q.id]}
                                                style={{
                                                    padding: '0.75rem 1.25rem',
                                                    background: textInputs[q.id] ? '#667eea' : '#e2e8f0',
                                                    color: textInputs[q.id] ? 'white' : '#94a3b8',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: 'bold',
                                                    cursor: textInputs[q.id] ? 'pointer' : 'not-allowed'
                                                }}
                                            >
                                                확인
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{
                                                    padding: '0.75rem 1rem',
                                                    background: isCorrect(q) ? '#dcfce7' : '#fee2e2',
                                                    border: `2px solid ${isCorrect(q) ? '#22c55e' : '#ef4444'}`,
                                                    borderRadius: '8px',
                                                    fontSize: '1rem'
                                                }}>
                                                    {chapterAnswers[q.id] || '(미입력)'}
                                                </span>
                                                {!isCorrect(q) && (
                                                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                                                        정답: {q.answer}
                                                    </span>
                                                )}
                                            </div>
                                            {!isCorrect(q) && (
                                                <div style={explanationStyle}>
                                                    💡 {q.explanation}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 제출 버튼 */}
                {!hasSubmitted && (
                    <button
                        onClick={handleSubmitQuiz}
                        disabled={!allAnswered}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            marginTop: '1.25rem',
                            background: allAnswered ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e2e8f0',
                            color: allAnswered ? 'white' : '#94a3b8',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            cursor: allAnswered ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {allAnswered ? '🎯 정답 확인하기' : `모든 문제에 답해주세요 (${Object.keys(chapterAnswers).length}/${totalCount})`}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div style={{
            display: 'flex',
            gap: '1.5rem',
            margin: '-3rem',
            padding: '1.5rem',
            minHeight: 'calc(100vh - 0px)',
            background: '#f1f5f9'
        }}>
            {/* 왼쪽 목차 사이드바 */}
            <aside style={{
                width: '340px',
                minWidth: '340px',
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                height: 'fit-content',
                position: 'sticky',
                top: '1.5rem'
            }}>
                {/* 헤더 */}
                <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '2px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <BookOpen size={24} color="#667eea" />
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e293b' }}>주식고수되기</h2>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>초등학생을 위한 주식 입문서</p>
                </div>

                {/* 진도율 */}
                <div style={{
                    background: 'linear-gradient(135deg, #f0f4ff, #e8f4f8)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.25rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>학습 진도</span>
                        <span style={{ color: '#667eea', fontWeight: 'bold' }}>{completedChapters.size}/{allChapters.length} ({progress}%)</span>
                    </div>
                    <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #667eea, #764ba2)',
                            borderRadius: '10px',
                            transition: 'width 0.3s'
                        }} />
                    </div>
                </div>

                {/* 목차 */}
                <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                    {sections.map(section => (
                        <div key={section.id} style={{ marginBottom: '0.875rem' }}>
                            <button
                                onClick={() => toggleSection(section.id)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: '#f8fafc',
                                    border: 'none',
                                    borderRadius: '10px',
                                    borderLeft: '4px solid #667eea',
                                    textAlign: 'left',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                {section.title}
                                <span style={{
                                    transform: expandedSections.has(section.id) ? 'rotate(90deg)' : 'rotate(0)',
                                    transition: 'transform 0.2s',
                                    fontSize: '0.75rem'
                                }}>▶</span>
                            </button>

                            {expandedSections.has(section.id) && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    {section.chapters.map(chapter => (
                                        <button
                                            key={chapter.id}
                                            onClick={() => setCurrentChapterId(chapter.id)}
                                            style={{
                                                width: '100%',
                                                padding: '0.625rem 0.75rem',
                                                margin: '0.25rem 0',
                                                background: currentChapterId === chapter.id
                                                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                                    : completedChapters.has(chapter.id) ? '#dcfce7' : 'transparent',
                                                border: 'none',
                                                borderRadius: '8px',
                                                textAlign: 'left',
                                                fontSize: '0.95rem',
                                                color: currentChapterId === chapter.id ? 'white' : completedChapters.has(chapter.id) ? '#166534' : '#475569',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.625rem',
                                                transition: 'all 0.2s',
                                                lineHeight: '1.5'
                                            }}
                                        >
                                            <span style={{ marginTop: '3px', flexShrink: 0 }}>
                                                {completedChapters.has(chapter.id) ? (
                                                    <CheckCircle size={16} color={currentChapterId === chapter.id ? 'white' : '#22c55e'} />
                                                ) : (
                                                    <Circle size={16} color={currentChapterId === chapter.id ? 'white' : '#cbd5e1'} />
                                                )}
                                            </span>
                                            <span>{chapter.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 돌아가기 버튼 */}
                <button
                    onClick={() => router.push('/student')}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        marginTop: '1rem',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <ArrowLeft size={18} />
                    다시 주식투자하러 가기
                </button>
            </aside>

            {/* 오른쪽 콘텐츠 영역 */}
            <main style={{
                flex: 1,
                background: 'white',
                borderRadius: '16px',
                padding: '2.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
                {currentChapter && (
                    <>
                        {/* 헤더 */}
                        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid #e2e8f0' }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '0.5rem 1rem',
                                background: 'linear-gradient(135deg, #eff6ff, #e8f4f8)',
                                color: '#2563eb',
                                borderRadius: '20px',
                                fontSize: '0.95rem',
                                fontWeight: 'bold',
                                marginBottom: '0.875rem'
                            }}>
                                {currentChapter.badge}
                            </span>
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', lineHeight: '1.4' }}>
                                {currentChapter.title}
                            </h1>
                        </div>

                        {/* 콘텐츠 */}
                        <div dangerouslySetInnerHTML={{ __html: renderContent(currentChapter.content) }} />

                        {/* 퀴즈 섹션 */}
                        {renderQuiz()}

                        {/* 완료 버튼 */}
                        <button
                            onClick={toggleComplete}
                            disabled={!canComplete && !completedChapters.has(currentChapterId)}
                            style={{
                                width: '100%',
                                padding: '1.125rem',
                                marginTop: '1.5rem',
                                background: completedChapters.has(currentChapterId)
                                    ? '#e2e8f0'
                                    : canComplete
                                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                        : '#f1f5f9',
                                border: 'none',
                                borderRadius: '12px',
                                color: completedChapters.has(currentChapterId)
                                    ? '#64748b'
                                    : canComplete ? 'white' : '#94a3b8',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                cursor: (canComplete || completedChapters.has(currentChapterId)) ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.625rem'
                            }}
                        >
                            {completedChapters.has(currentChapterId) ? (
                                <>
                                    <CheckCircle size={22} />
                                    학습 완료됨 (클릭하여 취소)
                                </>
                            ) : canComplete ? (
                                <>
                                    <CheckCircle size={22} />
                                    학습 완료 표시하기
                                </>
                            ) : (
                                <>
                                    <Lock size={22} />
                                    퀴즈를 80% 이상 맞춰야 완료할 수 있어요
                                </>
                            )}
                        </button>

                        {/* 네비게이션 */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '2rem',
                            paddingTop: '1.5rem',
                            borderTop: '2px solid #e2e8f0'
                        }}>
                            <button
                                onClick={() => prev && setCurrentChapterId(prev.id)}
                                disabled={!prev}
                                style={{
                                    padding: '0.875rem 1.5rem',
                                    background: prev ? '#f1f5f9' : '#f8fafc',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: prev ? '#475569' : '#cbd5e1',
                                    fontWeight: 'bold',
                                    cursor: prev ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1rem'
                                }}
                            >
                                <ChevronLeft size={20} />
                                이전
                            </button>
                            <button
                                onClick={() => next && setCurrentChapterId(next.id)}
                                disabled={!next}
                                style={{
                                    padding: '0.875rem 1.5rem',
                                    background: next ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f8fafc',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: next ? 'white' : '#cbd5e1',
                                    fontWeight: 'bold',
                                    cursor: next ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1rem'
                                }}
                            >
                                다음
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
