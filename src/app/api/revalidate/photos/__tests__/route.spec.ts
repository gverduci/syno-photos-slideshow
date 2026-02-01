/**
 * Test for POST /api/revalidate/photos endpoint
 * Tests cache revalidation endpoint behavior
 */

// Mock revalidatePhotos BEFORE importing route
jest.mock('@/actions/photos.action', () => ({
  revalidatePhotos: jest.fn(),
}));

// Mock logger BEFORE importing route
jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  })),
}));

// Mock NextResponse from 'next/server'
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: jest.fn(async () => data),
      text: jest.fn(async () => JSON.stringify(data)),
    })),
  },
}));

import { POST } from '../route';
import { revalidatePhotos } from '@/actions/photos.action';
import getLogger from '@/utils/logger';
import { NextResponse } from 'next/server';

describe('POST /api/revalidate/photos', () => {
  let mockLogger: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    };
    (getLogger as jest.Mock).mockReturnValue(mockLogger);
  });

  describe('Success Cases', () => {
    it('POST request success → 200 status with ok: true', async () => {
    // Arrange
    (revalidatePhotos as jest.Mock).mockResolvedValueOnce(undefined);
    const mockRequest = {
        method: 'POST',
    } as unknown as Request;

    // Act
    const response = await POST(mockRequest);

    // Assert
    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toEqual({ ok: true });
    expect(mockLogger.info).toHaveBeenCalledWith('API /api/revalidate/photos SUCCESS');
    expect(revalidatePhotos).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    const errorTestCases = [
      {
        scenario: 'Cache revalidation throws Error',
        setupMock: () => new Error('Cache revalidation failed'),
        expectedStatus: 500,
        expectedError: 'Cache revalidation failed',
      },
      {
        scenario: 'Cache revalidation throws string error',
        setupMock: () => 'Unknown error occurred',
        expectedStatus: 500,
        expectedError: 'Unknown error occurred',
      },
      {
        scenario: 'Error with stack trace',
        setupMock: () => {
          const err = new Error('Network timeout');
          err.stack = 'Error: Network timeout\n    at async POST';
          return err;
        },
        expectedStatus: 500,
        expectedError: 'Network timeout',
        shouldLogDebug: true,
      },
    ];

    errorTestCases.forEach(({ scenario, setupMock, expectedStatus, expectedError, shouldLogDebug }) => {
      it(scenario, async () => {
        // Arrange
        const error = setupMock();
        (revalidatePhotos as jest.Mock).mockRejectedValueOnce(error);
        const mockRequest = {
          method: 'POST',
        } as unknown as Request;

        // Act
        const response = await POST(mockRequest);

        // Assert
        expect(response.status).toBe(expectedStatus);
        const responseBody = await response.json();
        expect(responseBody.ok).toBe(false);
        expect(responseBody.error).toBe(expectedError);

        const warnCall = (mockLogger.warn as jest.Mock).mock.calls[0]?.[0] || '';
        expect(warnCall).toMatch(/API \/api\/revalidate\/photos failed:/);

        if (shouldLogDebug && error instanceof Error && error.stack) {
          expect(mockLogger.debug).toHaveBeenCalled();
        }
      });
    });
  });

  describe('Cache Revalidation Behavior', () => {
    const behaviorTestCases = [
      {
        description: 'Revalidation function is called exactly once',
        testLogic: async (mockReq: Request) => {
          (revalidatePhotos as jest.Mock).mockResolvedValueOnce(undefined);
          await POST(mockReq);
          expect(revalidatePhotos).toHaveBeenCalledTimes(1);
        },
      },
      {
        description: 'Errors are not caught silently - propagated to response',
        testLogic: async (mockReq: Request) => {
          const testError = new Error('Revalidation service unavailable');
          (revalidatePhotos as jest.Mock).mockRejectedValueOnce(testError);
          const response = await POST(mockReq);
          const body = await response.json();
          expect(response.status).toBe(500);
          expect(body.ok).toBe(false);
          expect(body.error).toBe('Revalidation service unavailable');
        },
      },
    ];

    behaviorTestCases.forEach(({ description, testLogic }) => {
      it(description, async () => {
        const mockRequest = {
          method: 'POST',
        } as unknown as Request;
        await testLogic(mockRequest);
      });
    });
  });
});
