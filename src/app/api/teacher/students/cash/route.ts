import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { amount } = await request.json();

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return NextResponse.json({ error: "유효한 금액을 입력해주세요." }, { status: 400 });
        }

        const cash = Math.floor(Number(amount));

        const students = db.prepare('SELECT id FROM students WHERE teacher_id = ?').all(session.id as string) as any[];

        if (students.length === 0) {
            return NextResponse.json({ message: "귀속된 학생이 없습니다." });
        }

        const updateStmt = db.prepare('UPDATE students SET cash = cash + ? WHERE id = ?');

        for (const s of students) {
            updateStmt.run(cash, s.id);
        }

        return NextResponse.json({ success: true, count: students.length, amount: cash });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "현금 지급에 실패했습니다." }, { status: 500 });
    }
}
