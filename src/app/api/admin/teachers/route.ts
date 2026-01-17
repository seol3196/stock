import db, { generateId } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();

    // Check if user is admin (first teacher created)
    const adminCheck = db.prepare('SELECT id FROM teachers ORDER BY id ASC LIMIT 1').get() as any;

    if (!session || session.role !== "teacher" || session.id !== adminCheck?.id) {
        return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }

    // Get all teachers
    const teachers = db.prepare(`
    SELECT id, username, interest_rate, 
           (SELECT COUNT(*) FROM students WHERE teacher_id = teachers.id) as student_count
    FROM teachers
    ORDER BY id ASC
  `).all();

    return NextResponse.json(teachers);
}

export async function POST(request: Request) {
    const session = await getSession();

    // Check if user is admin
    const adminCheck = db.prepare('SELECT id FROM teachers ORDER BY id ASC LIMIT 1').get() as any;

    if (!session || session.role !== "teacher" || session.id !== adminCheck?.id) {
        return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }

    try {
        const { username, password } = await request.json();

        // Check if username exists
        const existing = db.prepare('SELECT id FROM teachers WHERE username = ?').get(username);
        if (existing) {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const id = generateId();

        db.prepare(`
      INSERT INTO teachers (id, username, password, interest_rate)
      VALUES (?, ?, ?, ?)
    `).run(id, username, hashedPassword, 5.0);

        const teacher = db.prepare('SELECT id, username FROM teachers WHERE id = ?').get(id);

        return NextResponse.json(teacher);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 });
    }
}
