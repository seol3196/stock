import db, { generateId } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    // Check if any teacher exists
    const teacherCount = db.prepare('SELECT COUNT(*) as count FROM teachers').get() as { count: number };

    if (teacherCount.count === 0) {
        try {
            const hashedPassword = await hashPassword("admin1234");
            const id = generateId();

            db.prepare(`
        INSERT INTO teachers (id, username, password, interest_rate)
        VALUES (?, ?, ?, ?)
      `).run(id, "admin", hashedPassword, 5.0);

            return NextResponse.json({ message: "Admin teacher created", admin: { id, username: "admin" } });
        } catch (e) {
            console.error("Setup Error:", e);
            return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
        }
    }

    return NextResponse.json({ message: "Admin already exists" });
}
