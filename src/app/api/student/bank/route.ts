import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== "student") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = db.prepare(`
    SELECT s.*, t.interest_rate
    FROM students s
    JOIN teachers t ON t.id = s.teacher_id
    WHERE s.id = ?
  `).get(session.id as string) as any;

    if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
        cash: student.cash,
        savingsBalance: student.savings_balance,
        teacher: {
            interestRate: student.interest_rate
        }
    });
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "student") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { amount, type } = await request.json();
        const value = Number(amount);

        if (value <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        const studentId = session.id as string;
        const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as any;

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        if (type === "DEPOSIT") {
            if (student.cash < value) {
                return NextResponse.json({ error: "Not enough cash" }, { status: 400 });
            }

            db.prepare(`
        UPDATE students
        SET cash = cash - ?,
            savings_balance = savings_balance + ?
        WHERE id = ?
      `).run(value, value, studentId);

        } else if (type === "WITHDRAW") {
            if (student.savings_balance < value) {
                return NextResponse.json({ error: "Not enough savings" }, { status: 400 });
            }

            db.prepare(`
        UPDATE students
        SET cash = cash + ?,
            savings_balance = savings_balance - ?
        WHERE id = ?
      `).run(value, value, studentId);

        } else {
            return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || "Banking failed" }, { status: 400 });
    }
}
