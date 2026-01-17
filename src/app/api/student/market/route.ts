import db, { generateId } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== "student") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 학생의 teacher_id 가져오기
    const student = db.prepare('SELECT teacher_id FROM students WHERE id = ?').get(session.id as string) as { teacher_id: string } | undefined;

    if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // 해당 선생님의 주식만 가져오기
    const stocksRaw = db.prepare(`
    SELECT * FROM stocks
    WHERE is_active = 1 AND teacher_id = ?
    ORDER BY code ASC
  `).all(student.teacher_id) as any[];

    // Convert to camelCase
    const stocks = stocksRaw.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        currentPrice: s.current_price,
        teacherId: s.teacher_id,
        isActive: s.is_active
    }));

    return NextResponse.json(stocks);
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "student") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { stockId, type, quantity } = await request.json();

        if (quantity <= 0) {
            return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
        }

        const studentId = session.id as string;

        const stock = db.prepare('SELECT * FROM stocks WHERE id = ?').get(stockId) as any;
        const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as any;

        if (!stock || !student) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const price = stock.current_price;
        const totalCost = price * quantity;

        if (type === "BUY") {
            if (student.cash < totalCost) {
                return NextResponse.json({ error: "Not enough cash" }, { status: 400 });
            }

            // Update cash
            db.prepare('UPDATE students SET cash = cash - ? WHERE id = ?').run(totalCost, studentId);

            // Update ownership
            const ownership = db.prepare(`
        SELECT * FROM stock_ownership
        WHERE student_id = ? AND stock_id = ?
      `).get(studentId, stockId) as any;

            if (ownership) {
                // Calculate new average price
                const totalValue = (ownership.average_buy_price * ownership.quantity) + totalCost;
                const newQuantity = ownership.quantity + quantity;
                const newAvgPrice = Math.round(totalValue / newQuantity);

                db.prepare(`
          UPDATE stock_ownership
          SET quantity = ?, average_buy_price = ?
          WHERE id = ?
        `).run(newQuantity, newAvgPrice, ownership.id);
            } else {
                const id = generateId();
                db.prepare(`
          INSERT INTO stock_ownership (id, student_id, stock_id, quantity, average_buy_price)
          VALUES (?, ?, ?, ?, ?)
        `).run(id, studentId, stockId, quantity, price);
            }

        } else if (type === "SELL") {
            const ownership = db.prepare(`
        SELECT * FROM stock_ownership
        WHERE student_id = ? AND stock_id = ?
      `).get(studentId, stockId) as any;

            if (!ownership || ownership.quantity < quantity) {
                return NextResponse.json({ error: "Not enough shares" }, { status: 400 });
            }

            // Update cash
            db.prepare('UPDATE students SET cash = cash + ? WHERE id = ?').run(totalCost, studentId);

            // Update ownership
            if (ownership.quantity === quantity) {
                db.prepare('DELETE FROM stock_ownership WHERE id = ?').run(ownership.id);
            } else {
                db.prepare(`
          UPDATE stock_ownership
          SET quantity = quantity - ?
          WHERE id = ?
        `).run(quantity, ownership.id);
            }
        }

        // Record transaction
        const transId = generateId();
        db.prepare(`
      INSERT INTO transactions (id, student_id, stock_id, type, price, quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(transId, studentId, stockId, type, price, quantity);

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || "Transaction failed" }, { status: 400 });
    }
}
