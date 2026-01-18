import '@testing-library/jest-dom'
import { server } from './src/test/mocks/server'

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Clean up after all tests
afterAll(() => server.close())

// Mock environment variables for tests
process.env.SYNO_HOST = 'synology.test'
process.env.SYNO_PORT = '5000'
process.env.SYNO_SECURE = 'false'
process.env.SYNO_USERNAME = 'testuser'
process.env.SYNO_PASSWORD = 'testpass'
process.env.SLIDESHOW_SHUFFLE = 'true'
process.env.SLIDESHOW_PHOTO_INTERVAL = '10'
