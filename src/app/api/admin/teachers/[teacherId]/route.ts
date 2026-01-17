import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    context: { params: Promise<{ teacherId: string }> }
) {
    const session = await getSession();

    // Check if user is admin
    const adminCheck = db.prepare('SELECT id FROM teachers ORDER BY id ASC LIMIT 1').get() as any;

    if (!session || session.role !== "teacher" || session.id !== adminCheck?.id) {
        return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }

    const params = await context.params;
    const teacherId = params.teacherId;

    // Get teacher info
    const teacher = db.prepare('SELECT id, username, interest_rate FROM teachers WHERE id = ?').get(teacherId) as any;

    if (!teacher) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Get students
    const students = db.prepare(`
    SELECT id, username, name, cash, savings_balance
    FROM students
    WHERE teacher_id = ?
    ORDER BY username ASC
  `).all(teacherId);

    // Get stocks
    const stocks = db.prepare(`
    SELECT * FROM stocks
    WHERE teacher_id = ?
    ORDER BY name ASC
  `).all(teacherId);

    // Get statistics
    const studentCount = students.length;
    const stockCount = stocks.length;

    const totalMoney = db.prepare(`
    SELECT 
      SUM(cash) as total_cash,
      SUM(savings_balance) as total_savings
    FROM students
    WHERE teacher_id = ?
  `).get(teacherId) as { total_cash: number | null; total_savings: number | null };

    const totalAssets = (totalMoney.total_cash || 0) + (totalMoney.total_savings || 0);

    return NextResponse.json({
        teacher,
        students,
        stocks,
        stats: {
            studentCount,
            stockCount,
            totalAssets
        }
    });
}
