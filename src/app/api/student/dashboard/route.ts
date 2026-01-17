import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = db.prepare(`
    SELECT id, username, name, cash, savings_balance, teacher_id
    FROM students
    WHERE id = ?
  `).get(session.id as string) as any;

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Get portfolio
  const portfolio = db.prepare(`
    SELECT 
      so.id,
      so.quantity,
      so.average_buy_price,
      so.stock_id,
      s.name,
      s.code,
      s.current_price
    FROM stock_ownership so
    JOIN stocks s ON s.id = so.stock_id
    WHERE so.student_id = ?
  `).all(session.id as string) as any[];

  // Convert to camelCase
  const studentData = {
    id: student.id,
    username: student.username,
    name: student.name,
    cash: student.cash,
    savingsBalance: student.savings_balance,
    teacherId: student.teacher_id,
    portfolio: portfolio.map((p: any) => ({
      id: p.id,
      quantity: p.quantity,
      averageBuyPrice: p.average_buy_price,
      stockId: p.stock_id,
      stock: {
        name: p.name,
        code: p.code,
        currentPrice: p.current_price
      }
    }))
  };

  return NextResponse.json(studentData);
}
