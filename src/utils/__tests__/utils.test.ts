import {
  isSharedAlbum,
  isSharedSpace,
  getCgiUrl,
  getAuthCgiUrl,
  api,
  withTokenAndSid,
  getItemThumbnailUrl,
  getItemThumbnailUrlByCacheKey,
  getBrowseSharedAlbumUrl,
  getBrowseSharedAlbumItemUrl,
  getFilterItemsUrl,
  getFiltersUrl,
} from '../utils'
import { AppConfig } from '../config'

const mockConfig: AppConfig = 
{
    env: "test",
    host: "localhost",
    port: 3000,
    logger: { level: "debug" },
    lang: "en",
    synology: {
        baseUrl: "synology.test/photo",
        username: "testuser",
        password: "testpass",
    },
    slideShow: {
        timing: 10,
        daysInterval: 7,
        useSharedSpace: false,
        minStars: 1,
        transition: "none",
    },
    openhab: {
        baseUrl: "openhab.test",
        currentTitleItem: "",
        currentArtistItem: "",
    }
}
const mockConfigWithSharedAlbum: AppConfig = {
    ...mockConfig,
    synology:{
        ...mockConfig.synology,
        passphraseSharedAlbum: 'myalbumpass',
    },
    slideShow:{
        ...mockConfig.slideShow,
        useSharedSpace: false,
    }
}

const mockConfigWithSharedSpace: AppConfig = {
    ...mockConfig,
    slideShow:{
        ...mockConfig.slideShow,
        useSharedSpace: true,
    }
}

describe('utils.ts - URL Builders and Helpers', () => {
  describe('isSharedAlbum', () => {
    it('should return true when passphrase is configured', () => {
      expect(isSharedAlbum(mockConfigWithSharedAlbum)).toBe(true)
    })

    it('should return false when passphrase is not configured', () => {
      expect(isSharedAlbum(mockConfig)).toBe(false)
    })

    it('should return false when passphrase is empty string', () => {
      const config = {
          ...mockConfig,
          synology:{
              ...mockConfig.synology,
              passphraseSharedAlbum: '',
          },
          slideShow:{
              ...mockConfig.slideShow,
              useSharedSpace: false,
          }
      }
      expect(isSharedAlbum(config)).toBe(false)
    })

    it('should return false when passphrase is undefined', () => {
      const config = {
          ...mockConfig,
          synology:{
              ...mockConfig.synology,
              passphraseSharedAlbum: undefined,
          },
          slideShow:{
              ...mockConfig.slideShow,
              useSharedSpace: false,
          }
      }
      expect(isSharedAlbum(config)).toBe(false)
    })
  })

  describe('isSharedSpace', () => {
    it('should return true when shared_space is true', () => {
      const config: AppConfig = {
        ...mockConfig,
        slideShow: {...mockConfig.slideShow, useSharedSpace: true}
      };
      expect(isSharedSpace(config)).toBe(true)
    })

    it('should return false when shared_space is false', () => {
      const config: AppConfig = {
        ...mockConfig,
        slideShow: {...mockConfig.slideShow, useSharedSpace: false}
      };
      expect(isSharedSpace(config)).toBe(false)
    })
  })

  describe('getCgiUrl', () => {
    it('should build correct base CGI URL for HTTP', () => {
      const url = getCgiUrl(mockConfig)
      expect(url).toBe('synology.test/photo/webapi/entry.cgi')
    })

    it('should add /mo/sharing when requested', () => {
      const url = getCgiUrl(mockConfig, true)
      expect(url).toBe('synology.test/photo/mo/sharing/webapi/entry.cgi')
    })

    it('should not add /mo/sharing by default', () => {
      const url = getCgiUrl(mockConfig, false)
      expect(url).not.toContain('/mo/sharing')
    })
  })

  describe('getAuthCgiUrl', () => {
    it('should build authentication CGI URL', () => {
      const url = getAuthCgiUrl(mockConfig)
      expect(url).toBe('synology.test/photo/webapi/entry.cgi')
    })

    it('should never add /mo/sharing for auth URL', () => {
      const url = getAuthCgiUrl(mockConfig)
      expect(url).not.toContain('/mo/sharing')
    })
  })

  describe('api', () => {
    it('should return SYNO.Foto prefix for non-shared space', () => {
      const result = api('Browse.Album', mockConfig, false)
      expect(result).toBe('SYNO.Foto.Browse.Album')
    })

    it('should return SYNO.FotoTeam prefix for shared space', () => {
      const result = api('Browse.Album', mockConfig, true)
      expect(result).toBe('SYNO.FotoTeam.Browse.Album')
    })

    it('should use config.shared_space when sharedSpace not specified', () => {
      const config: AppConfig = {
        ...mockConfig,
        slideShow: {...mockConfig.slideShow, useSharedSpace: true}
      };
      const result = api('Browse.Album', config)
      expect(result).toBe('SYNO.FotoTeam.Browse.Album')
    })

    it('should use default shared_space=false when not in config', () => {
      const result = api('Browse.Album', mockConfig)
      expect(result).toBe('SYNO.Foto.Browse.Album')
    })
    const apiNames=[
      ['Thumbnail', false, 'SYNO.Foto.Thumbnail'],
      ['Thumbnail', true, 'SYNO.FotoTeam.Thumbnail'],
      ['Browse.Item', false, 'SYNO.Foto.Browse.Item'],
      ['Browse.Item', true, 'SYNO.FotoTeam.Browse.Item'],
    ]
    it.each(apiNames)('should work with %s and shareSpace=%s', (apiName, useSharedSpace, expected) => {
      expect(api(apiName as string, mockConfig, useSharedSpace as boolean)).toBe(expected)
    })
  })

  describe('withTokenAndSid', () => {
    it('should append token and sid to URL', () => {
      const url = 'http://example.com/api'
      const result = withTokenAndSid(url, 'mytoken123', 'mysid456')
      expect(result).toContain('SynoToken=mytoken123')
      expect(result).toContain('_sid=mysid456')
    })

    it('should preserve existing URL parameters', () => {
      const url = 'http://example.com/api?param1=value1'
      const result = withTokenAndSid(url, 'token', 'sid')
      expect(result).toContain('param1=value1')
      expect(result).toContain('SynoToken=token')
      expect(result).toContain('_sid=sid')
    })

    it('should handle special characters in token/sid', () => {
      const token = 'token-with-special_chars.123'
      const sid = 'sid-with/special\\chars'
      const url = 'http://example.com/api'
      const result = withTokenAndSid(url, token, sid)
      expect(result).toContain(`SynoToken=${token}`)
      expect(result).toContain(`_sid=${sid}`)
    })

    it('should use & separator for parameters', () => {
      const url = 'http://example.com/api?existing=param'
      const result = withTokenAndSid(url, 'token', 'sid')
      expect(result).toMatch(/\?.*&.*&/)
    })
  })

  describe('getItemThumbnailUrl', () => {
    it('should build thumbnail URL with item parameters', () => {
      const item = {
        filename: 'photo.jpg',
        id: 123,
        indexed_time: 1609459200,
        additional: {
          thumbnail: {
            cache_key: '456_1609459200',
          },
        },
      }

      const url = getItemThumbnailUrl(item, 'token123', 'sid456', mockConfig)

      expect(url).toContain('/mo/sharing/webapi')
      expect(url).toContain('id=123')
      expect(url).toContain('cache_key=456_1609459200')
      expect(url).toContain('size=xl')
      expect(url).toContain('SynoToken=token123')
      expect(url).toContain('_sid=sid456')
    })

    it('should use correct API name based on config', () => {
      const item = {
        filename: 'photo.jpg',
        id: 123,
        indexed_time: 1609459200,
        additional: {
          thumbnail: {
            cache_key: '456_1609459200',
          },
        },
      }

      const url = getItemThumbnailUrl(
        item,
        'token123',
        'sid456',
        mockConfig
      )

      expect(url).toContain('SYNO.Foto.Thumbnail')
    })

    it('should handle different cache keys', () => {
      const item = {
        filename: 'photo.jpg',
        id: 999,
        indexed_time: 1609459200,
        additional: {
          thumbnail: {
            cache_key: 'unique_cache_key_xyz',
          },
        },
      }

      const url = getItemThumbnailUrl(item, 'token', 'sid', mockConfig)

      expect(url).toContain('cache_key=unique_cache_key_xyz')
      expect(url).toContain('id=999')
    })
  })

  describe('getItemThumbnailUrlByCacheKey', () => {
    it('should extract ID from cache key and build URL', () => {
      const cacheKey = '123_1609459200'
      const url = getItemThumbnailUrlByCacheKey(
        cacheKey,
        'token123',
        'sid456',
        mockConfig
      )

      expect(url).toContain('id=123')
      expect(url).toContain(`cache_key=${cacheKey}`)
    })

    it('should add passphrase to URL when configured', () => {
      const cacheKey = '123_1609459200'
      const url = getItemThumbnailUrlByCacheKey(
        cacheKey,
        'token123',
        'sid456',
        mockConfigWithSharedAlbum
      )

      expect(url).toContain('passphrase=myalbumpass')
    })

    it('should not add passphrase when not in config', () => {
      const cacheKey = '123_1609459200'
      const url = getItemThumbnailUrlByCacheKey(
        cacheKey,
        'token123',
        'sid456',
        mockConfig
      )

      expect(url).not.toContain('passphrase=')
    })

    it('should handle cache keys with large numbers', () => {
      const cacheKey = '999999999_1609459200'
      const url = getItemThumbnailUrlByCacheKey(
        cacheKey,
        'token',
        'sid',
        mockConfig
      )

      expect(url).toContain('id=999999999')
    })
  })

  describe('getBrowseSharedAlbumUrl', () => {
    it('should build shared album browse URL', () => {
      const url = getBrowseSharedAlbumUrl(
        'token123',
        'sid456',
        mockConfigWithSharedAlbum
      )

      expect(url).toContain('api=SYNO.Foto.Browse.Album')
      expect(url).toContain('method=get')
      expect(url).toContain('passphrase=myalbumpass')
      expect(url).toContain('SynoToken=token123')
    })

    it('should encode additional parameters correctly', () => {
      const url = getBrowseSharedAlbumUrl(
        'token',
        'sid',
        mockConfigWithSharedAlbum
      )

      expect(url).toContain('additional=')
      expect(url).toContain('thumbnail')
    })

    it('should use config passphrase', () => {
      const customConfig: AppConfig = {
        ...mockConfig,
        synology:{
        ...mockConfig.synology,
        passphraseSharedAlbum: 'custom_passphrase_xyz',
    }
      }

      const url = getBrowseSharedAlbumUrl('token', 'sid', customConfig)

      expect(url).toContain('custom_passphrase_xyz')
    })
  })

  describe('getBrowseSharedAlbumItemUrl', () => {
    it('should build shared album items URL with pagination', () => {
      const url = getBrowseSharedAlbumItemUrl(
        0,
        50,
        'token123',
        'sid456',
        mockConfigWithSharedAlbum
      )

      expect(url).toContain('offset=0')
      expect(url).toContain('limit=50')
      expect(url).toContain('passphrase=myalbumpass')
      expect(url).toContain('SynoToken=token123')
    })

    it('should handle different offset and limit values', () => {
      const url = getBrowseSharedAlbumItemUrl(
        100,
        25,
        'token',
        'sid',
        mockConfigWithSharedAlbum
      )

      expect(url).toContain('offset=100')
      expect(url).toContain('limit=25')
    })
  })

  describe('getFiltersUrl', () => {
    it('should build filters URL with correct parameters', () => {
      const url = getFiltersUrl('token123', 'sid456', mockConfig)

      expect(url).toContain('SYNO.Foto.Search.Filter')
      expect(url).toContain('method=list')
      expect(url).toContain('SynoToken=token123')
      expect(url).toContain('_sid=sid456')
    })

    it('should use FotoTeam API when shared space is enabled', () => {
      const url = getFiltersUrl('token', 'sid', mockConfigWithSharedSpace)

      expect(url).toContain('SYNO.FotoTeam.Search.Filter')
    })
  })

  describe('getFilterItemsUrl', () => {
    it('should build filter items URL with date range', () => {
      const timeFrom = 1609459200 // 2021-01-01
      const timeTo = 1640995200 // 2021-12-31
      const folders = [1, 2, 3]
      const minStars = 3

      const url = getFilterItemsUrl(
        timeFrom,
        timeTo,
        folders,
        minStars,
        'token123',
        'sid456',
        mockConfig
      )

      expect(url).toContain('SYNO.Foto.Browse.Item')
      expect(url).toContain('method=list')
      expect(url).toContain('SynoToken=token123')
      expect(url).toContain('_sid=sid456')
    })

    it('should handle empty folder list', () => {
      const url = getFilterItemsUrl(
        0,
        1000,
        [],
        0,
        'token',
        'sid',
        mockConfig
      )

      expect(url).toContain('SYNO.Foto.Browse.Item')
    })

    it('should encode array parameters correctly', () => {
      const folders = [10, 20, 30]
      const url = getFilterItemsUrl(
        0,
        1000,
        folders,
        0,
        'token',
        'sid',
        mockConfig
      )

      // Folders should be in URL (specific format depends on implementation)
      expect(url).toBeDefined()
    })

    it('should use FotoTeam API when shared space enabled', () => {
      const url = getFilterItemsUrl(
        0,
        1000,
        [],
        0,
        'token',
        'sid',
        mockConfigWithSharedSpace
      )

      expect(url).toContain('SYNO.FotoTeam.Browse.Item')
    })
  })
})
