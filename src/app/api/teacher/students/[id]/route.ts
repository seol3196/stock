import db from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    try {
        db.prepare('DELETE FROM stock_ownership WHERE student_id = ?').run(id);
        db.prepare('DELETE FROM students WHERE id = ?').run(id);
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    try {
        if (body.type === 'ACCOUNT') {
            const { name, password } = body;
            if (password && password.trim() !== "") {
                const hashed = await hashPassword(password);
                db.prepare('UPDATE students SET name = ?, password = ? WHERE id = ?').run(name, hashed, id);
            } else {
                db.prepare('UPDATE students SET name = ? WHERE id = ?').run(name, id);
            }
        }
        else if (body.type === 'ASSET') {
            const { cash, savings, portfolio } = body;

            // 1. Update Cash & Savings
            db.prepare('UPDATE students SET cash = ?, savings_balance = ? WHERE id = ?')
                .run(Number(cash || 0), Number(savings || 0), id);

            // 2. Update Portfolio
            if (portfolio && Array.isArray(portfolio)) {
                // table: stock_ownership
                // columns: student_id, stock_id, quantity, average_buy_price

                const upsertStmt = db.prepare(`
                    INSERT INTO stock_ownership (student_id, stock_id, quantity, average_buy_price)
                    VALUES (?, ?, ?, 0)
                    ON CONFLICT(student_id, stock_id) 
                    DO UPDATE SET quantity = excluded.quantity
                `);

                const deleteStmt = db.prepare('DELETE FROM stock_ownership WHERE student_id = ? AND stock_id = ?');

                for (const item of portfolio) {
                    if (item.quantity <= 0) {
                        deleteStmt.run(id, item.stockId);
                    } else {
                        upsertStmt.run(id, item.stockId, item.quantity);
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: "Failed to update student: " + e.message }, { status: 500 });
    }
}
