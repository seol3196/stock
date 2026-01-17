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
    WHERE teacher_id = ?
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
