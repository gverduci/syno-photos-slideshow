import logger from "@/utils/logger";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type requestParams = {
  params: Promise<{ type: string }>
}

export async function POST(request: NextRequest, props: requestParams) {
  const params = await props.params;
  const boby = await request.json();
  const { messages } = boby;
  const message = messages && messages.length > 0 ? messages[0].msg : "generic error";

  switch (params.type) {
    case "info":
      logger.info(message);
      break;
    case "error":
      logger.error(message);
      break;
    case "debug":
      logger.debug(message);
      break;
    case "warn":
      logger.warn(message);
      break;
    default:
      logger.info(message);
      break;
  }

  return NextResponse.json({ message: `Success ${params.type}!`});
}
