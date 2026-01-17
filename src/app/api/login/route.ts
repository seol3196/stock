import db from "@/lib/db";
import { verifyPassword, signToken, setSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { username, password, type } = await request.json();

        if (!username || !password || !type) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        let user = null;
        let role = "";

        if (type === "teacher") {
            user = db.prepare('SELECT * FROM teachers WHERE username = ?').get(username) as any;
            role = "teacher";
        } else if (type === "student") {
            user = db.prepare('SELECT * FROM students WHERE username = ?').get(username) as any;
            role = "student";
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 401 });
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        // Create session
        const token = await signToken({ id: user.id, username: user.username, role });
        await setSession(token);

        return NextResponse.json({ success: true, role });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
