'use server'
 
import { cookies } from 'next/headers'
 
export async function setCookies(token: string | undefined, sid: string | undefined) {
    cookies().set("token", token || "");
    cookies().set("sid", sid || "");
}