import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacher = db.prepare('SELECT interest_rate FROM teachers WHERE id = ?').get(session.id as string) as any;
    return NextResponse.json({ interestRate: teacher.interest_rate });
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { interestRate } = await request.json();

        db.prepare(`
      UPDATE teachers
      SET interest_rate = ?
      WHERE id = ?
    `).run(Number(interestRate), session.id as string);

        return NextResponse.json({ success: true, interestRate: Number(interestRate) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to update interest rate" }, { status: 500 });
    }
}
