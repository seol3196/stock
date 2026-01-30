import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ username: null }, { status: 401 });
    }

    // If student, fetch their actual name from the database
    let name = null;
    if (session.role === "student") {
        const student = db.prepare('SELECT name FROM students WHERE id = ?').get(session.id) as { name: string } | undefined;
        name = student?.name || null;
    }

    return NextResponse.json({
        username: session.username,
        role: session.role,
        name: name
    });
}
