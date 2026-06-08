import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { userTable } from "@/db/schema/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest){
    try {
        const user = await currentUser();
        if(!user){
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            })
        }

        const existingUser = await db.select().from(userTable).where(eq(userTable.clerkId, user.id))
        if(existingUser){
            return NextResponse.json({
                message: "User already exists"
            }, {
                status: 200
            })
        }

        
         
        return NextResponse.json({
            message: "User found",
            user: user
        }, {
            status: 200
        })
    } catch (error) {
        return NextResponse.json({
            message: "Error while syncing user",
            error: error
        }, {
            status: 500
        })
    }
}
    