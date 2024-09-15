"use server"

import { LoginResponse } from "@/types/loginResponse";
import { getLoginUrl } from "@/utils/utils";

const nextRevalidate = { next: { revalidate: 3600 } }

export type SynologyLoginResponse = {
  data: {
    did: string, // "6789...",
    sid: string, // "1234...",
    synotoken: string // "adafagahah"
  },
  error: {
    code: number
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
      ...nextRevalidate
    })
   
    if (!res.ok) {
      throw new Error('Failed request to login')
    }
    const cookie = res.headers.get('Set-Cookie') || "";
    const resJson: SynologyLoginResponse = await res.json();
    if (resJson.success){
      return {cookie, synotoken:resJson.data.synotoken, sid: resJson.data.sid};
    }
    throw new Error(`Failed to login, error code ${resJson.error.code}`)
  }

  export default login;