import db, { generateId } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

// Next.js 15+ compatible route handler
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Params is a Promise now
) {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // Await params

    try {
        const deleteTransaction = db.transaction(() => {
            db.prepare('DELETE FROM transactions WHERE student_id = ?').run(id);
            db.prepare('DELETE FROM stock_ownership WHERE student_id = ?').run(id);
            db.prepare('DELETE FROM students WHERE id = ?').run(id);
        });

        deleteTransaction();
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Delete Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Params is a Promise now
) {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // Await params

    let body;
    try {
        body = await req.json();
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

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

            // Use transaction for consistency
            const updateAsset = db.transaction(() => {
                // 1. Update Cash & Savings
                db.prepare('UPDATE students SET cash = ?, savings_balance = ? WHERE id = ?')
                    .run(Number(cash || 0), Number(savings || 0), id);

                // 2. Update Portfolio (Wipe & Re-insert strategy)
                if (portfolio && Array.isArray(portfolio)) {
                    // Delete all existings
                    db.prepare('DELETE FROM stock_ownership WHERE student_id = ?').run(id);

                    // Insert new
                    const insertStmt = db.prepare(`
                        INSERT INTO stock_ownership (id, student_id, stock_id, quantity, average_buy_price)
                        VALUES (?, ?, ?, ?, 0)
                    `);

                    for (const item of portfolio) {
                        const qty = Number(item.quantity);
                        if (qty > 0) {
                            insertStmt.run(generateId(), id, item.stockId, qty);
                        }
                    }
                }
            });

            updateAsset();
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Update Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
