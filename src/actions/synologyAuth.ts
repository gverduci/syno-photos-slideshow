"use server"

import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache'
import { LoginResponse } from "@/types/loginResponse";
import { getLoginUrl } from "@/utils/utils";
import { getConfig } from '@/utils/config';
import getLogger from '@/utils/logger';

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
  'use cache'
  cacheLife('photos');
  cacheTag('photos')
  const config = getConfig();
  const loginUrl = getLoginUrl(config);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(loginUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    }).catch((error) => {
      getLogger().error(`Error fetching login: ${error}`);
    });
    clearTimeout(timeoutId);
    if (res){
      const cookie = res.headers.get('Set-Cookie') || "";
      const resJson: SynologyLoginResponse = await res.json();
      if (resJson.success){
        return {cookie, synotoken: resJson.data.synotoken, sid: resJson.data.sid};
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      getLogger().error('Login request timeout after 5 seconds');
    } else {
      getLogger().error(`Error during login: ${error}`);
    }
  }
  return {cookie: "", synotoken:"", sid: ""};
}

export default login;
