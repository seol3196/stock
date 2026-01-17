import db, { generateId } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const studentsRaw = db.prepare(`
        SELECT id, username, name, cash, savings_balance
        FROM students
        WHERE teacher_id = ?
        ORDER BY username ASC
      `).all(session.id as string) as any[];

        // Convert snake_case to camelCase and fetch portfolio
        const students = studentsRaw.map(s => {
            const portfolio = db.prepare(`
                SELECT p.stock_id, p.quantity, st.current_price, st.name, st.code
                FROM stock_ownership p
                JOIN stocks st ON p.stock_id = st.id
                WHERE p.student_id = ?
            `).all(s.id).map((p: any) => ({
                stock: { id: p.stock_id, name: p.name, code: p.code, currentPrice: p.current_price },
                quantity: p.quantity,
                stockId: p.stock_id
            }));

            return {
                id: s.id,
                username: s.username,
                name: s.name,
                cash: s.cash,
                savingsBalance: s.savings_balance,
                portfolio
            };
        });

        return NextResponse.json(students);
    } catch (error: any) {
        console.error("Failed to fetch students:", error);
        return NextResponse.json({ error: "Failed to fetch student data: " + error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, password, name, cash } = await request.json();

    if (!username || !password) {
        return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const studentId = generateId();

    db.prepare(`
    INSERT INTO students (id, username, password, name, cash, teacher_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(studentId, username, hashedPassword, name || null, cash || 10000, session.id);

    return NextResponse.json({ message: "Student created", id: studentId });
}
