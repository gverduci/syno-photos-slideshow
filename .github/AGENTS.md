# Project Instructions

## Overview
This project implements a very simple photo frame application. It is designed to run on Synology NAS devices, utilizing Next.js.

## Commands
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm start`: Starts the production server.
- `npm run lint`: Runs the linter to check for code quality issues.
- `npm run clean`: Cleans the next fetch cache.
- `npm run typecheck`: Runs TypeScript type checking without emitting files.
- `npm run test`: Runs the test suite.

## Code standards
- TypeScript strict mode, no any types allowed.

## Testing
- Minimum 80% code coverage required.
- Tests are written using Jest with table-driven and React Testing Library.
- Integration tests for all API calls.

## Patterns
- Synology API calls: use *query* function inside 'src/actions/synologyApi.ts' then check the response with *checkFetchResponseErrors* function and at the end parse the JSON response with *getJsonResponse* function.

## When stuck
Reference implementation:
- Good component: 'photo.tsx'
- Good API call: 'getAlbumList' function in 'synologyApi.ts'
