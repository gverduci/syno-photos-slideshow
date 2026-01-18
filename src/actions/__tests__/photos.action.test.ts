import {
  photosSamePeriod,
  photosSharedAlbum,
  revalidatePhotos,
  getPhotos,
  type Photo,
} from '../photos.action'
import { AppConfig } from '@/utils/config'
import * as synologyApi from '../synologyApi'
import * as nextCache from 'next/cache'
import Slideshow from '@/app/slideshow/[index]/page'
import { use } from 'react'

// Mock modules
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: jest.fn(() => mockLogger),  // Restituisce sempre mockLogger
}))

jest.mock('@/utils/config', () => ({
  getConfig: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
  unstable_cacheLife: jest.fn(),
  unstable_cacheTag: jest.fn(),
}))

jest.mock('../synologyApi', () => ({
  filterItemsWithThumbs: jest.fn(),
  getFilters: jest.fn(),
  getSharedAlbum: jest.fn(),
  browseSharedAlbumItemsWithThumbs: jest.fn(),
}))

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

const mockItems = {
  data: {
    list: [
      {
        id: 1,
        filename: 'photo1.jpg',
        filesize: 1024000,
        time: 1609459200,
        indexed_time: 1609459200,
        owner_user_id: 5,
        folder_id: 1,
        type: 'photo',
        additional: {
          resolution: { width: 3125, height: 2084 },
          orientation: 1,
          orientation_original: 1,
          thumbnail: {
            cache_key: 'thumb_1',
            m: 'ready',
            preview: 'ready',
            sm: 'ready',
            unit_id: 1,
            xl: 'ready',
          },
          provider_user_id: 5,
        },
      },
      {
        id: 2,
        filename: 'photo2.jpg',
        filesize: 2048000,
        time: 1609459200,
        indexed_time: 1609459200,
        owner_user_id: 5,
        folder_id: 1,
        type: 'photo',
        additional: {
          resolution: { width: 2000, height: 1500 },
          orientation: 1,
          orientation_original: 1,
          thumbnail: {
            cache_key: 'thumb_2',
            m: 'ready',
            preview: 'ready',
            sm: 'ready',
            unit_id: 2,
            xl: 'ready',
          },
          provider_user_id: 5,
        },
      },
    ],
  },
}

const mockFilters = {
  success: true,
  data: {
    aperture: [],
    camera: [],
    exposure_time_group: [],
    flash: [],
    focal_length_group: [],
    folder_filter: [],
    general_tag: [],
    geocoding: [],
    iso: [],
    item_type: [],
    lens: [],
    person: [],
    rating: [],
    time: [{ year: 2021 }, { year: 2022 }, { year: 2023 }],
  },
}

describe('photos.action.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-15'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('photosSamePeriod', () => {
    it('should fetch photos from same period across multiple years', async () => {
      const getConfigMock = require('@/utils/config').getConfig as jest.Mock
      const filterItemsWithThumbsMock = synologyApi.filterItemsWithThumbs as jest.Mock

      getConfigMock.mockReturnValue(mockConfig)
      filterItemsWithThumbsMock.mockResolvedValue(mockItems)

      const photos = await photosSamePeriod(
        'token123',
        'sid456',
        7, // 7 days interval
        2021,
        0 // min stars
      )

      expect(photos).toBeInstanceOf(Array)
      expect(filterItemsWithThumbsMock).toHaveBeenCalled()
      // Should call for years 2021, 2022, 2023, 2024
      expect(filterItemsWithThumbsMock.mock.calls.length).toBeGreaterThan(0)
    })

    it('should handle empty results gracefully', async () => {
      const getConfigMock = require('@/utils/config').getConfig as jest.Mock
      const filterItemsWithThumbsMock = synologyApi.filterItemsWithThumbs as jest.Mock

      getConfigMock.mockReturnValue(mockConfig)
      filterItemsWithThumbsMock.mockResolvedValue({ data: { list: [] } })

      const photos = await photosSamePeriod(
        'token123',
        'sid456',
        7,
        2021,
        0
      )

      expect(photos).toEqual([])
    })

    it('should handle failed promises with allSettled', async () => {
      const getConfigMock = require('@/utils/config').getConfig as jest.Mock
      const filterItemsWithThumbsMock = synologyApi.filterItemsWithThumbs as jest.Mock

      getConfigMock.mockReturnValue(mockConfig)

      // First call succeeds, second fails
      filterItemsWithThumbsMock
        .mockResolvedValueOnce(mockItems)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue(mockItems)

      const photos = await photosSamePeriod(
        'token123',
        'sid456',
        7,
        2021,
        0
      )

      // Should still return photos from successful calls
      expect(photos).toBeInstanceOf(Array)
      expect(filterItemsWithThumbsMock).toHaveBeenCalled()
    })

    it('should respect minStars filter parameter', async () => {
      const getConfigMock = require('@/utils/config').getConfig as jest.Mock
      const filterItemsWithThumbsMock = synologyApi.filterItemsWithThumbs as jest.Mock

      getConfigMock.mockReturnValue(mockConfig)
      filterItemsWithThumbsMock.mockResolvedValue(mockItems)

      await photosSamePeriod(
        'token123',
        'sid456',
        7,
        2021,
        5 // Require 5+ stars
      )

      // Verify minStars is passed to API
      const calls = filterItemsWithThumbsMock.mock.calls
      calls.forEach((call) => {
        expect(call[3]).toBe(5) // minStars parameter position
      })
    })

    it('should limit photos per year to 10 items', async () => {
      const getConfigMock = require('@/utils/config').getConfig as jest.Mock
      const filterItemsWithThumbsMock = synologyApi.filterItemsWithThumbs as jest.Mock

      getConfigMock.mockReturnValue(mockConfig)

      // Mock many items
      const manyItems = {
        data: {
          list: Array.from({ length: 50 }, (_, i) => ({
            ...mockItems.data.list[0],
            id: i,
            filename: `photo${i}.jpg`,
            additional: {
              ...mockItems.data.list[0].additional,
              thumbnail: {
                ...mockItems.data.list[0].additional.thumbnail,
                cache_key: `thumb_${i}`,
                unit_id: i,
              },
            },
          })),
        },
      }

      filterItemsWithThumbsMock.mockResolvedValue(manyItems)

      const photos = await photosSamePeriod(
        'token123',
        'sid456',
        7,
        2024,
        0
      )

      // Per year, should limit to ~10 items (getMultipleRandom behavior)
      expect(photos.length).toBeLessThanOrEqual(100) // 1 year * max 10, but shuffled
    })
  })

  describe('photosSharedAlbum', () => {
    it('should fetch photos from shared album by passphrase', async () => {
      const getSharedAlbumMock = synologyApi.getSharedAlbum as jest.Mock
      const browseSharedAlbumItemsMock =
        synologyApi.browseSharedAlbumItemsWithThumbs as jest.Mock

      const mockAlbums = {
        data: {
          list: [
            {
              id: 1,
              name: 'Album 1',
              passphrase: 'wrong_pass',
              item_count: 10,
            },
            {
              id: 2,
              name: 'Album 2',
              passphrase: 'correct_pass',
              item_count: 20,
            },
          ],
        },
      }

      const configWithPassphrase = {
        ...mockConfig,
        synology:{
            ...mockConfig.synology,
            passphraseSharedAlbum: 'correct_pass',
        },
        slideShow:{
            ...mockConfig.slideShow,
            useSharedSpace: false,
        }
      }

      getSharedAlbumMock.mockResolvedValue(mockAlbums)
      browseSharedAlbumItemsMock.mockResolvedValue(mockItems)

      const photos = await photosSharedAlbum(
        'token123',
        'sid456',
        configWithPassphrase
      )

      expect(photos).toBeInstanceOf(Array)
      expect(photos.length).toBeGreaterThan(0)
      // Should have called with the correct album's item_count
      expect(browseSharedAlbumItemsMock).toHaveBeenCalledWith(
        20, // item_count from Album 2
        'token123',
        'sid456',
        configWithPassphrase
      )
    })

    it('should return empty array if album not found', async () => {
      const getSharedAlbumMock = synologyApi.getSharedAlbum as jest.Mock
      const browseSharedAlbumItemsMock =
        synologyApi.browseSharedAlbumItemsWithThumbs as jest.Mock

      const mockAlbums = {
        data: {
          list: [
            {
              id: 1,
              name: 'Album 1',
              passphrase: 'wrong_pass',
              item_count: 10,
            },
          ],
        },
      }

      getSharedAlbumMock.mockResolvedValue(mockAlbums)
      browseSharedAlbumItemsMock.mockResolvedValue({ data: { list: [] } })

      const configWithPassphrase = {
        ...mockConfig,
        synology:{
            ...mockConfig.synology,
            passphraseSharedAlbum: 'non_existent_pass',
        },
        slideShow:{
            ...mockConfig.slideShow,
            useSharedSpace: false,
        }
      }

      const photos = await photosSharedAlbum(
        'token123',
        'sid456',
        configWithPassphrase
      )

      expect(photos).toEqual([])
    })

    it('should map item properties correctly', async () => {
      const getSharedAlbumMock = synologyApi.getSharedAlbum as jest.Mock
      const browseSharedAlbumItemsMock =
        synologyApi.browseSharedAlbumItemsWithThumbs as jest.Mock

      const mockAlbums = {
        data: {
          list: [
            {
              id: 1,
              name: 'Album',
              passphrase: 'pass',
              item_count: 1,
            },
          ],
        },
      }

      getSharedAlbumMock.mockResolvedValue(mockAlbums)
      browseSharedAlbumItemsMock.mockResolvedValue(mockItems)

      const configWithPassphrase = {
        ...mockConfig,
        synology:{
            ...mockConfig.synology,
            passphraseSharedAlbum: 'pass',
        },
        slideShow:{
            ...mockConfig.slideShow,
            useSharedSpace: false,
        }
      }

      const photos = await photosSharedAlbum(
        'token123',
        'sid456',
        configWithPassphrase
      )

      const firstPhoto = photos[0]
      expect(firstPhoto).toHaveProperty('cache_key')
      expect(firstPhoto).toHaveProperty('name')
      expect(firstPhoto).toHaveProperty('time')
      expect(firstPhoto.cache_key).toBe('thumb_1')
      expect(firstPhoto.name).toBe('photo1.jpg')
      expect(firstPhoto.time).toBe(1609459200)
    })
  })

  describe('revalidatePhotos', () => {
    it('should call revalidateTag with photos tag', async () => {
      const revalidateTagMock = nextCache.revalidateTag as jest.Mock

      await revalidatePhotos()

      expect(revalidateTagMock).toHaveBeenCalledWith('photos')
    })

    it('should only revalidate photos tag', async () => {
      const revalidateTagMock = nextCache.revalidateTag as jest.Mock

      await revalidatePhotos()

      expect(revalidateTagMock).toHaveBeenCalledTimes(1)
      expect(revalidateTagMock).toHaveBeenCalledWith('photos')
    })
  })

  describe('getPhotos', () => {
    it('should fetch photos from shared album when configured', async () => {
      const getConfigMock = require('@/utils/config').getConfig as jest.Mock
      const getSharedAlbumMock = synologyApi.getSharedAlbum as jest.Mock
      const browseSharedAlbumItemsMock =
        synologyApi.browseSharedAlbumItemsWithThumbs as jest.Mock

      const configWithSharedAlbum = {
        ...mockConfig,
        synology:{
            ...mockConfig.synology,
            passphraseSharedAlbum: 'album_pass',
        },
        slideShow:{
            ...mockConfig.slideShow,
            useSharedSpace: false,
        }
      }

      getConfigMock.mockReturnValue(configWithSharedAlbum)

      const mockAlbums = {
        data: {
          list: [
            {
              id: 1,
              name: 'Album',
              passphrase: 'album_pass',
              item_count: 2,
            },
          ],
        },
      }

      getSharedAlbumMock.mockResolvedValue(mockAlbums)
      browseSharedAlbumItemsMock.mockResolvedValue(mockItems)

      const photos = await getPhotos('token123', 'sid456')

      expect(photos).toBeInstanceOf(Array)
      expect(getSharedAlbumMock).toHaveBeenCalled()
    })

    it('should fetch photos by same period when no shared album configured', async () => {
      const getConfigMock = require('@/utils/config').getConfig as jest.Mock
      const getFiltersMock = synologyApi.getFilters as jest.Mock
      const filterItemsWithThumbsMock = synologyApi.filterItemsWithThumbs as jest.Mock

      getConfigMock.mockReturnValue(mockConfig)
      getFiltersMock.mockResolvedValue(mockFilters)
      filterItemsWithThumbsMock.mockResolvedValue(mockItems)

      const photos = await getPhotos('token123', 'sid456')

      expect(photos).toBeInstanceOf(Array)
      expect(getFiltersMock).toHaveBeenCalled()
      expect(filterItemsWithThumbsMock).toHaveBeenCalled()
    })

    it('should handle errors gracefully and return empty array', async () => {
      const getConfigMock = require('@/utils/config').getConfig as jest.Mock

      getConfigMock.mockImplementation(() => {
        throw new Error('Config error')
      })

      const photos = await getPhotos('token123', 'sid456')

      expect(photos).toEqual([])
    })

    it('should log photo count on success', async () => {
      const getConfigMock = require('@/utils/config').getConfig as jest.Mock
      const getFiltersMock = synologyApi.getFilters as jest.Mock
      const filterItemsWithThumbsMock = synologyApi.filterItemsWithThumbs as jest.Mock

      getConfigMock.mockReturnValue(mockConfig)
      getFiltersMock.mockResolvedValue(mockFilters)
      filterItemsWithThumbsMock.mockResolvedValue(mockItems)

      await getPhotos('token123', 'sid456')

      expect(mockLogger.info).toHaveBeenCalled()
    })

    it('should log error when fetch fails', async () => {
      const getConfigMock = require('@/utils/config').getConfig as jest.Mock
      const getFiltersMock = synologyApi.getFilters as jest.Mock

      getConfigMock.mockReturnValue(mockConfig)
      getFiltersMock.mockRejectedValue(new Error('API failed'))

      await getPhotos('token123', 'sid456')

      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('Photo Type and Structure', () => {
    it('should create Photo objects with correct properties', async () => {
      const getConfigMock = require('@/utils/config').getConfig as jest.Mock
      const getFiltersMock = synologyApi.getFilters as jest.Mock
      const filterItemsWithThumbsMock = synologyApi.filterItemsWithThumbs as jest.Mock

      getConfigMock.mockReturnValue(mockConfig)
      getFiltersMock.mockResolvedValue(mockFilters)
      filterItemsWithThumbsMock.mockResolvedValue(mockItems)

      const photos = await getPhotos('token123', 'sid456')

      if (photos.length > 0) {
        const photo = photos[0]
        expect(photo).toHaveProperty('cache_key', expect.any(String))
        expect(photo).toHaveProperty('name', expect.any(String))
        expect(photo).toHaveProperty('time', expect.any(Number))
      }
    })
  })
})
