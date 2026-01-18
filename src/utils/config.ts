import Joi from 'joi';

// TODO: to use the runtime configuration, you need to create a next.config.js file
// and set the runtimeConfig property to the object you want to use. Next you need to create a custom App component
// and use the getConfig function to access the runtime configuration.
// https://nextjs.org/docs/pages/api-reference/config/next-config-js/runtime-configuration
// https://nextjs.org/docs/pages/building-your-application/routing/custom-app
export interface Room {
  itemname: string;
  name: string;
  temperatureItem: string;
  humidityItem: string;
  indoor: boolean;
}

let _config: {
	env: string;
	host: string;
	port: number;
	logger: { level: string };
	lang: string;
	synology: {
		baseUrl: string;
		username: string;
		password: string;
		passphraseSharedAlbum?: string;
		useSharedSpace?: boolean;
	};
	slideShow: {
		timing: number;
		daysInterval: number;
		useSharedSpace: boolean;
		minStars: number;
		transition: string;
	};
	openhab?: {
		baseUrl?: string;
		currentTitleItem?: string;
		currentArtistItem?: string;
		rooms?: Array<Room>;
	};
};

const initConfig = () => {
		const envVarsSchema = Joi.object()
			.keys({
				NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development'),
				NEXT_PUBLIC_LOG_LEVEL: Joi.string()
					.valid('emerg', 'alert', 'crit', 'error', 'warning', 'notice', 'info', 'debug')
					.default('debug'),
				PORT: Joi.number().default(3000),
				NEXT_PUBLIC_HOST: Joi.string().description('host'),
				SYNOLOGY_PHOTOS_API_BASE_URL: Joi.string().required().description('synology api base url'),
				SYNOLOGY_PHOTOS_USERNAME: Joi.string().required().description('synology username'),
				SYNOLOGY_PHOTOS_PASSWORD: Joi.string().required().description('synology password'),
				USE_SHARED_SPACE: Joi.string().valid("true", "false").description('use shared space'),
				SYNOLOGY_PASSPHRASE_SHARED_ALBUM: Joi.string().when('USE_SHARED_SPACE', {
					is: "false", then: Joi.string().required().description('synology shared album passphrase'),
					otherwise: Joi.forbidden()
				}),
				SLIDESHOW_TIMING: Joi.number().default(20000).description('timing between slides'),
				DAYS_INTERVAL: Joi.number().default(7).description('day interval before now and after now to get photos'),
				MIN_STARS: Joi.number().default(1).description('minimum stars to show photo'),
				TRANSITION: Joi.string().default('none').description('transition between slides (sliding, fade, none)'),
				OPENHAB_BASE_URL: Joi.string()
					.when('OPENHAB_CURRENT_TITLE_ITEM', {
						is: Joi.exist(),
						then: Joi.string().required(),
						otherwise: Joi.string().when('OPENHAB_CURRENT_ARTIST_ITEM', {
							is: Joi.exist(),
							then: Joi.string().required(),
							otherwise: Joi.string().when('OPENHAB_ROOMS_JSON', {
								is: Joi.exist(),
								then: Joi.string().required(),
								otherwise: Joi.string().optional()
							})
						})
					})
					.description('OpenHab base URL for media player info'),
				OPENHAB_CURRENT_TITLE_ITEM: Joi.string().optional().description('OpenHab item name for current media title'),
				OPENHAB_CURRENT_ARTIST_ITEM: Joi.string().optional().description('OpenHab item name for current media artist'),
				OPENHAB_ROOMS_JSON: Joi.string().optional().description('JSON array of rooms with temperature/humidity items'),
				LANGUAGE: Joi.string().valid('en', 'de', 'fr', 'it', 'es').default('en').description('language for TimeAgo')
			})
			.unknown();	
		const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

	if (error) {
		throw new Error(`Config validation error: ${error.message}`);
	}

	_config = {
		env: envVars.NODE_ENV,
		host: envVars.NEXT_PUBLIC_HOST,
		port: Number(envVars.PORT),
		logger: { level: envVars.NEXT_PUBLIC_LOG_LEVEL },
		lang: envVars.LANGUAGE,

		synology: {
			baseUrl: envVars.SYNOLOGY_PHOTOS_API_BASE_URL,
			username: envVars.SYNOLOGY_PHOTOS_USERNAME,
			password: envVars.SYNOLOGY_PHOTOS_PASSWORD
		},
		slideShow: {
			timing: Number(envVars.SLIDESHOW_TIMING),
			daysInterval: Number(envVars.DAYS_INTERVAL),
			useSharedSpace: envVars.USE_SHARED_SPACE === 'true',
			minStars: Number(envVars.MIN_STARS),
			transition: envVars.TRANSITION
		},
	};
	if (envVars.SYNOLOGY_PASSPHRASE_SHARED_ALBUM) {
		_config.synology.passphraseSharedAlbum = envVars.SYNOLOGY_PASSPHRASE_SHARED_ALBUM;
	}
	if (envVars.OPENHAB_BASE_URL) {
		_config.openhab = { baseUrl: envVars.OPENHAB_BASE_URL };
	}
	// optional OpenHab item names for title and artist
	if (envVars.OPENHAB_CURRENT_TITLE_ITEM || envVars.OPENHAB_CURRENT_ARTIST_ITEM) {
		const oh: { baseUrl?: string; currentTitleItem?: string; currentArtistItem?: string; rooms?: Array<any> } = _config.openhab ?? {};
		if (envVars.OPENHAB_CURRENT_TITLE_ITEM) {
			oh.currentTitleItem = envVars.OPENHAB_CURRENT_TITLE_ITEM;
		}
		if (envVars.OPENHAB_CURRENT_ARTIST_ITEM) {
			oh.currentArtistItem = envVars.OPENHAB_CURRENT_ARTIST_ITEM;
		}
		_config.openhab = oh;
	}
	// optional OpenHab rooms configuration
	if (envVars.OPENHAB_ROOMS_JSON) {
		const rooms = JSON.parse(envVars.OPENHAB_ROOMS_JSON);
		if (!_config.openhab) _config.openhab = {};
		_config.openhab.rooms = rooms;
	}
	return _config;
};

const getConfig = () => {
	if (!_config) {
		_config = initConfig();
	}

	return _config;
};

const resetConfig = () => {
	_config = undefined as any;
};

export type AppConfig = typeof _config;

export { initConfig, getConfig, resetConfig };
