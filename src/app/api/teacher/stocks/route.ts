import db, { generateId } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stocks = db.prepare(`
    SELECT * FROM stocks
    WHERE teacher_id = ? AND is_active = 1
    ORDER BY name ASC
  `).all(session.id as string);

    return NextResponse.json(stocks);
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, code, description, currentPrice } = await request.json();
        const id = generateId();

        // Auto-generate code if not provided
        // Example: S-1A2B
        const finalCode = code
            ? code.toUpperCase()
            : `S-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        db.prepare(`
      INSERT INTO stocks (id, teacher_id, name, code, description, current_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, session.id as string, name, finalCode, description || "", Number(currentPrice));

        const stock = db.prepare('SELECT * FROM stocks WHERE id = ?').get(id);
        return NextResponse.json(stock);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to create stock" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, currentPrice } = await request.json();

        db.prepare(`
      UPDATE stocks
      SET current_price = ?
      WHERE id = ?
    `).run(Number(currentPrice), id);

        const stock = db.prepare('SELECT * FROM stocks WHERE id = ?').get(id);
        return NextResponse.json(stock);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await request.json();

        const delist = db.transaction(() => {
            // 보유 학생 목록 조회
            const holdings = db.prepare(
                'SELECT student_id, quantity FROM stock_ownership WHERE stock_id = ?'
            ).all(id) as { student_id: string; quantity: number }[];

            // 각 학생에게 상장폐지 손실 거래내역 기록 (price=0)
            const insertTx = db.prepare(
                'INSERT INTO transactions (id, student_id, stock_id, type, price, quantity) VALUES (?, ?, ?, ?, 0, ?)'
            );
            for (const holding of holdings) {
                insertTx.run(generateId(), holding.student_id, id, '상장폐지', holding.quantity);
            }

            // 보유 기록 삭제
            db.prepare('DELETE FROM stock_ownership WHERE stock_id = ?').run(id);

            // 소프트 삭제 (거래내역 FK 무결성 유지)
            db.prepare('UPDATE stocks SET is_active = 0 WHERE id = ? AND teacher_id = ?').run(id, session.id as string);
        });

        delist();

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to delist stock" }, { status: 500 });
    }
}
