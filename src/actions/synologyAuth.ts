"use server"

import { LoginResponse } from "@/types/loginResponse";
import { getLoginUrl } from "@/utils/utils";

export type SynologyLoginResponse = {
  data: {
    did: string, // "6789...",
    sid: string, // "1234...",
    synotoken: string // "adafagahah"
  },
  success: boolean // true
}

/**
 * Synology API Login
 * @returns 
 */
async function login() : Promise<LoginResponse>{
    const loginUrl = getLoginUrl();
    const res = await fetch(loginUrl,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
   
    if (!res.ok) {
      throw new Error('Failed to login')
    }
    const cookie = res.headers.get('Set-Cookie') || "";
    const resJson: SynologyLoginResponse = await res.json();
    return {cookie, synotoken:resJson.data.synotoken, sid: resJson.data.sid}
  }

  export default login;