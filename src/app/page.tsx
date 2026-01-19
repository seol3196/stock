"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, GraduationCap, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, type: role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "로그인 실패");

      // Use window.location for reliable redirect in production
      window.location.href = role === "teacher" ? "/teacher" : "/student";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = role === 'teacher';
  const primaryColor = isTeacher ? '#ec4899' : '#3b82f6';

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: isTeacher
        ? 'linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%)' // Light Pink for Teacher
        : 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)', // Light Blue for Student
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: 'clamp(0.5rem, 2vw, 1rem)',
      position: 'relative',
      overflow: 'hidden',
      color: '#0f172a'
    }}>
      {/* Animated Background Orbs (Subtle) */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-10%', width: '40vw', height: '40vw',
        background: isTeacher ? '#fbcfe8' : '#bfdbfe', opacity: 0.4, filter: 'blur(80px)', borderRadius: '50%',
        transition: 'background 0.5s ease'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-10%', width: '30vw', height: '30vw',
        background: isTeacher ? '#fce7f3' : '#dbeafe', opacity: 0.4, filter: 'blur(80px)', borderRadius: '50%',
        transition: 'background 0.5s ease'
      }} />

      <div style={{
        width: '100%', maxWidth: '400px', position: 'relative', zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem',
            letterSpacing: '-1px'
          }}>
            모의 주식 프로젝트
          </h1>
          <p style={{ color: '#64748b', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', fontWeight: '600' }}>우리 반 주식 투자 시뮬레이션</p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: 'clamp(16px, 4vw, 24px)',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Role Switcher */}
          <div style={{
            display: 'flex', background: '#f1f5f9', padding: '0.4rem', borderRadius: '16px',
            marginBottom: '2rem'
          }}>
            <button
              type="button"
              onClick={() => setRole("student")}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none',
                background: !isTeacher ? 'white' : 'transparent',
                color: !isTeacher ? '#3b82f6' : '#94a3b8',
                fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.3s ease',
                boxShadow: !isTeacher ? '0 4px 6px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <Users size={18} /> 학생
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none',
                background: isTeacher ? 'white' : 'transparent',
                color: isTeacher ? '#ec4899' : '#94a3b8',
                fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.3s ease',
                boxShadow: isTeacher ? '0 4px 6px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <GraduationCap size={18} /> 선생님
            </button>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: '#64748b', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', marginLeft: '0.25rem' }}>
                아이디
              </label>
              <input
                type="text"
                required
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%', padding: '1rem', background: '#f8fafc',
                  border: '2px solid #e2e8f0', borderRadius: '14px',
                  color: '#0f172a', fontSize: '1rem', outline: 'none',
                  transition: 'border-color 0.2s', fontWeight: '600'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = primaryColor}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#64748b', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', marginLeft: '0.25rem' }}>
                비밀번호
              </label>
              <input
                type="password"
                required
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '1rem', background: '#f8fafc',
                  border: '2px solid #e2e8f0', borderRadius: '14px',
                  color: '#0f172a', fontSize: '1rem', outline: 'none',
                  transition: 'border-color 0.2s', fontWeight: '600'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = primaryColor}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
            </div>

            {error && (
              <div style={{
                padding: '0.75rem', borderRadius: '10px', background: '#fef2f2',
                border: '1px solid #fee2e2', color: '#ef4444', fontSize: '0.875rem', textAlign: 'center', fontWeight: '600'
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '1rem', borderRadius: '14px', border: 'none',
                background: primaryColor,
                color: 'white', fontSize: '1rem', fontWeight: '800', cursor: loading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: isTeacher ? '0 4px 12px rgba(236, 72, 153, 0.3)' : '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'transform 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  로그인 <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
