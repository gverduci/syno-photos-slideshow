import { getConfig, resetConfig } from '../config'

describe('config.ts - Environment Validation', () => {
  beforeEach(() => {
    jest.resetModules()
    // Clear all app env vars before each test
    const appEnvVars = [
      'SYNOLOGY_PHOTOS_API_BASE_URL',
      'SYNOLOGY_PHOTOS_USERNAME',
      'SYNOLOGY_PHOTOS_PASSWORD',
      'USE_SHARED_SPACE',
      'SYNOLOGY_PASSPHRASE_SHARED_ALBUM',
      'OPENHAB_BASE_URL',
      'OPENHAB_CURRENT_TITLE_ITEM',
      'OPENHAB_CURRENT_ARTIST_ITEM',
      'OPENHAB_ROOMS_JSON',
      'SLIDESHOW_TIMING',
      'DAYS_INTERVAL',
      'MIN_STARS',
      'TRANSITION'
    ];
    for (const key of appEnvVars) {
      delete process.env[key]
    }
  })

  afterEach(() => {
    resetConfig()
  })

  describe('Valid Configurations', () => {
    it('should validate basic required env vars', () => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = 'synology.local/photo'
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = 'password123'

      const config = getConfig()

      expect(config.synology.baseUrl).toBe('synology.local/photo')
      expect(config.synology.username).toBe('admin')
      expect(config.synology.password).toBe('password123')
    })

    it('should validate slideShow configuration', () => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = 'synology.local/photo'
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = 'password123'

      process.env.SLIDESHOW_TIMING = '15'
      process.env.DAYS_INTERVAL = '7'
      process.env.USE_SHARED_SPACE = 'true'
      process.env.MIN_STARS = '1'
      process.env.TRANSITION = 'fading'

      const config = getConfig()

      expect(config.slideShow.daysInterval).toBe(7)
      expect(config.slideShow.timing).toBe(15)
      expect(config.slideShow.useSharedSpace).toBe(true)
      expect(config.slideShow.minStars).toBe(1)
      expect(config.slideShow.transition).toBe('fading')
    })

    it('should accept optional OpenHab config', () => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = 'synology.local/photo'
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = 'password123'
      process.env.OPENHAB_BASE_URL = 'openhab.local:8080'

      const config = getConfig()

      expect(config.openhab?.baseUrl).toBe('openhab.local:8080')
    })
    
    it('should validate artist/song', () => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = 'synology.local/photo'
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = 'password123'
      process.env.OPENHAB_BASE_URL = 'openhab.local:8080'
      process.env.OPENHAB_CURRENT_TITLE_ITEM = 'CurrentTitle'
      process.env.OPENHAB_CURRENT_ARTIST_ITEM = 'CurrentArtist'

      const config = getConfig()

      expect(config.openhab?.currentArtistItem).toBe('CurrentArtist')
      expect(config.openhab?.currentTitleItem).toBe('CurrentTitle')
    })

    it ('should validate rooms configuration', () => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = 'synology.local/photo'
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = 'password123'
      process.env.OPENHAB_BASE_URL = 'openhab.local:8080'
      const roomsJson = JSON.stringify([
        {
          itemname: 'LivingRoom'
        },
        {
          itemname: 'Bedroom'
        }
      ])

      process.env.OPENHAB_ROOMS_JSON = roomsJson;

      const config = getConfig()
      
      expect(config.openhab?.rooms).toBeDefined()
      expect(config.openhab?.rooms?.length).toBe(2)
      expect(config.openhab?.rooms?.[0].itemname).toBe('LivingRoom')
      expect(config.openhab?.rooms?.[1].itemname).toBe('Bedroom')
    })

    it('should validate shared album with passphrase', () => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = 'synology.local/photo'
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = 'password123'
      process.env.USE_SHARED_SPACE = 'false'
      process.env.SYNOLOGY_PASSPHRASE_SHARED_ALBUM = 'secret123'

      const config = getConfig()

      expect(config.slideShow.useSharedSpace).toBe(false)
      expect(config.synology.passphraseSharedAlbum).toBe('secret123')
    })
  })

  describe('Missing Required Env Vars', () => {
    it('should throw when SYNOLOGY_PHOTOS_API_BASE_URL is missing', () => {
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = 'password123'

      expect(() => getConfig()).toThrow()
    })

    it('should throw when SYNO_USERNAME is missing', () => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = 'synology.local/photo'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = 'password123'

      expect(() => getConfig()).toThrow()
    })

    it('should throw when SYNO_PASSWORD is missing', () => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = 'synology.local/photo'
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'

      expect(() => getConfig()).toThrow()
    })
  })

  describe('Conditional Validation', () => {
    it('should not require PASSPHRASE_SHARED_ALBUM when SHARED_SPACE is used', () => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = 'synology.local/photo'
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = 'password123'

      process.env.USE_SHARED_SPACE = 'true'

      const config = getConfig()

      expect(config.slideShow.useSharedSpace).toBe(true)
    })
    it('should be SHARED_SPACE false when PASSPHRASE_SHARED_ALBUM is used', () => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = 'synology.local/photo'
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = 'password123'
      process.env.USE_SHARED_SPACE = 'true'
      process.env.SYNOLOGY_PASSPHRASE_SHARED_ALBUM = 'secret123'

      expect(() => getConfig()).toThrow()
    })

    const openhabDependentVars = [
      'OPENHAB_CURRENT_TITLE_ITEM',
      'OPENHAB_CURRENT_ARTIST_ITEM',
      'OPENHAB_ROOMS_JSON'
    ]
    
    it.each(openhabDependentVars)(`should require OPENHAB_BASE_URL when (%s) is set`, (envVar) => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = 'synology.local/photo'
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = 'password123'
      process.env[envVar] = 'someValue'

      expect(() => getConfig()).toThrow()
    })
    
  })

  describe('Edge Cases', () => {
    it('should throw on empty SYNOLOGY_PHOTOS_API_BASE_URL string', () => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = ''
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = 'password123'

      expect(() => getConfig()).toThrow()
    })

    it('should throw on empty SYNO_PASSWORD string', () => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = 'synology.local/photo'
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = ''

      expect(() => getConfig()).toThrow()
    })

    it('should throw on invalid JSON in OPENHAB_ROOMS_JSON', () => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = 'synology.local/photo'
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = 'password123'
      process.env.OPENHAB_ROOMS_JSON = '{ invalidJson: true '

      expect(() => getConfig()).toThrow()
    })
  })

  describe('Slideshow Defaults', () => {
    it('should use default slideshow values', () => {
      process.env.SYNOLOGY_PHOTOS_API_BASE_URL = 'synology.local/photo'
      process.env.SYNOLOGY_PHOTOS_USERNAME = 'admin'
      process.env.SYNOLOGY_PHOTOS_PASSWORD = 'password123'

      const config = getConfig()

      expect(config.slideShow.timing).toBeDefined()
      expect(typeof config.slideShow.daysInterval).toBe('number')
    })
  })
})
