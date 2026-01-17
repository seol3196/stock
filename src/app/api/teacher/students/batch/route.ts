import db, { generateId } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { students } = await request.json(); // Array of { name, username, password }

    if (!Array.isArray(students) || students.length === 0) {
        return NextResponse.json({ error: "No student data provided" }, { status: 400 });
    }

    try {
        const results = {
            success: 0,
            failed: 0,
            details: [] as string[]
        };

        const insertStmt = db.prepare(`
            INSERT INTO students (id, username, password, name, cash, teacher_id)
            VALUES (?, ?, ?, ?, 10000, ?)
        `);

        // better-sqlite3 트랜잭션 사용
        // 하나라도 실패하면 전체 취소가 나을지, 성공한 건 둘지?
        // 사용자 편의성을 위해 '가능한 건 모두 등록'하고 실패 목록을 알려주는 게 나을 수 있음.
        // 하지만 ID 중복 같은 건 미리 체크하는 게 좋음.

        // 여기서는 Loop 돌면서 건별 처리. Transaction은 굳이 안 걸어서 부분 성공 허용.

        for (const student of students) {
            try {
                const hashedPassword = await hashPassword(student.password);
                const id = generateId();
                insertStmt.run(id, student.username, hashedPassword, student.name, session.id);
                results.success++;
            } catch (err: any) {
                results.failed++;
                // Unique constraint error check
                if (err.message.includes('UNIQUE constraint failed')) {
                    results.details.push(`${student.name} (${student.username}): 아이디 중복`);
                } else {
                    results.details.push(`${student.name}: ${err.message}`);
                }
            }
        }

        return NextResponse.json({
            message: `등록 완료: 성공 ${results.success}명 / 실패 ${results.failed}명`,
            results
        });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: "Batch creation failed: " + e.message }, { status: 500 });
    }
}
