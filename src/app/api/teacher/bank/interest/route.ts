import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const teacher = db.prepare('SELECT interest_rate FROM teachers WHERE id = ?').get(session.id as string) as any;

        if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

        if (teacher.interest_rate <= 0) {
            return NextResponse.json({ message: "이자율이 0%여서 지급되지 않았습니다." });
        }

        const rate = teacher.interest_rate / 100;
        const students = db.prepare('SELECT id, savings_balance FROM students WHERE teacher_id = ?').all(session.id as string) as any[];

        let count = 0;

        const updateStmt = db.prepare('UPDATE students SET savings_balance = savings_balance + ? WHERE id = ?');

        for (const s of students) {
            if (s.savings_balance > 0) {
                const interest = Math.floor(s.savings_balance * rate);
                if (interest > 0) {
                    updateStmt.run(interest, s.id);
                    count++;
                }
            }
        }

        return NextResponse.json({ success: true, count, rate: teacher.interest_rate });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to pay interest" }, { status: 500 });
    }
}
