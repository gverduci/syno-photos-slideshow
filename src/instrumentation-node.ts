import metadata from '../package.json';
import getLogger from "@/utils/logger";
import { initConfig } from "@/utils/config";

const conf = initConfig();

const logger = getLogger(conf);

logger.info('registering instrumentation');
logger.info(` > syno-photos-slideshow is ready`);
const version = `${metadata.version}`;
logger.info(` > syno-photos-slideshow v.${version}`);
logger.debug(` > syno-photos-slideshow develop url: http://localhost:3000/`);
logger.debug(` > Configuration:`);
logger.debug(JSON.stringify(conf));
