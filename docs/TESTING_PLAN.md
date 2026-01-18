# Plan: Implementare testing framework per Next.js + Synology Photos

Questa codebase è un'applicazione Next.js 15 con server actions, API routes, e componenti React, ma **senza alcuna infrastruttura di test**. Il piano struttura l'implementazione in 3 fasi: setup iniziale del framework, test per la logica server-side ad alto impatto, poi estensione ai componenti e E2E.

## Overview della Codebase

### Tech Stack
- **Next.js 15.4.0** (canary.30) con App Router e Server Components
- **React 19.1.0** con experimental features
- **TypeScript 5.8.3** in strict mode
- **Pino 9.0.0** per logging
- **Joi 17.13.3** per validation
- **No existing test infrastructure**

### Struttura Progetto
```
src/
├── actions/
│   ├── photos.action.ts (129 lines) - Fetching foto da album
│   ├── synologyApi.ts (424 lines) - API wrapper con timeout handling
│   └── synologyAuth.ts (150 lines) - Auth con retry logic
├── utils/
│   ├── config.ts (137 lines) - Validazione env vars con Joi
│   ├── utils.ts (243 lines) - URL builders, helper functions
│   └── logger.ts (24 lines) - Pino logger
├── component/ui/ - React components (client + server)
└── app/
    ├── api/ - API routes (revalidate, logger, openhab)
    └── slideshow/[index]/ - Dynamic pages
```

### Aree Critiche per Testing

| Priorità | Area | File | Motivo |
|----------|------|------|--------|
| **HIGH** | API wrapper | synologyApi.ts | Logica critica, gestione errori, timeout |
| **HIGH** | Config validation | config.ts | Schema Joi con logica condizionale |
| **HIGH** | Photo actions | photos.action.ts | Fetching, shuffling, promise batching |
| **MEDIUM** | Utility functions | utils.ts | URL construction, parameter injection |
| **MEDIUM** | Authentication | synologyAuth.ts | Auth flow, retry logic |
| **MEDIUM** | API routes | app/api/* | HTTP endpoints, status codes |
| **LOW** | Components | component/ui/* | Visual testing - preferire E2E |

## Piano di Implementazione

### Fase 1: Setup Framework Testing (Giorni 1-2)

#### 1.1 Installare dipendenze di test
```json
{
  "devDependencies": {
    "jest": "^30.0.0",
    "@testing-library/react": "^16.2.0",
    "@testing-library/jest-dom": "^6.6.3",
    "jest-environment-jsdom": "^30.0.0",
    "msw": "^2.1.5",
    "@testing-library/user-event": "^14.5.2",
    "ts-jest": "^29.2.6"
  }
}
```

**Razionale:**
- **Jest**: Ecosistema consolidato, ottimo supporto Next.js 15, plugin rich, community large
- **MSW (Mock Service Worker)**: Intercetta fetch globalmente, perfetto per mocking API
- **ts-jest**: Trasform TypeScript per Jest
- **Testing Library**: Best practice per test component behavior, not implementation
- **jsdom**: Simula DOM environment in Node.js

#### 1.2 Creare configurazione Jest
File: `jest.config.ts`
```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/**/__tests__/**/*.{test,spec}.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '.next/'],
}

export default createJestConfig(config)
```

#### 1.3 Creare setup file e MSW handlers
File: `jest.setup.ts`
- Configurare MSW server lifecycle
- Setup variabili environment per test
- Configurare test utilities

File: `src/test/mocks/handlers.ts`
- Mock handlers per Synology API
- Mock handlers per OpenHab API
- Default responses per test scenarios

File: `src/test/utils.ts`
- Utility functions per rendere componenti con provider
- Helper per setup test environment

#### 1.4 Aggiungere script package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

---

### Fase 2: Unit Tests per Server Actions e Utils (Giorni 3-5)

#### 2.1 Test per `synologyApi.ts` (Priorità: ALTA)
File: `src/actions/__tests__/synologyApi.test.ts`

**Test cases:**
- ✓ `synoFetch()` - Success response parsing
- ✓ `synoFetch()` - Timeout handling (mocking delay > 10s)
- ✓ `synoFetch()` - Error response handling
- ✓ `synoFetch()` - Header construction (SID, token injection)
- ✓ `browseFolder()` - Correct API path construction
- ✓ `browseFolder()` - Response type validation
- ✓ `filterNotes()` - Parameter handling
- ✓ `getThumbnail()` - URL generation
- ✓ Retry logic su errori transient (simulating network retry)

**Setup:**
- Mock fetch con MSW
- Variabili env test (SYNO_HOST, SYNO_PORT, etc.)
- Response fixtures da SYNO.Foto.json

#### 2.2 Test per `config.ts` (Priorità: ALTA)
File: `src/utils/__tests__/config.test.ts`

**Test cases:**
- ✓ Validazione env vars valide - non butta errore
- ✓ Env vars mancanti - throw error con messaggio chiaro
- ✓ Logica condizionale: se SHARED_SPACE_ID → passphrase opzionale
- ✓ Logica condizionale: se SHARED_ALBUM → passphrase richiesto
- ✓ OPENHAB_* env vars - optional fields
- ✓ Slideshow timing validation
- ✓ Edge cases: empty strings, invalid URLs, non-numeric timeouts

**Setup:**
- Process.env cleanup tra test
- Fixture con env vars valide/invalide

#### 2.3 Test per `photos.action.ts` (Priorità: ALTA)
File: `src/actions/__tests__/photos.action.test.ts`

**Test cases:**
- ✓ `getRandomPhotos()` - Shuffle logic randomness
- ✓ `getRandomPhotos()` - Sampling correct count
- ✓ `getRandomPhotos()` - Empty array handling
- ✓ `getSharedAlbumPhotos()` - API call correctness
- ✓ `getSharedAlbumPhotos()` - Error handling
- ✓ Promise batching logic
- ✓ Cache invalidation trigger
- ✓ Error recovery - graceful fallback

**Setup:**
- Mock `synoApi` functions
- Mock fetch per Synology API
- Fixture foto responses

#### 2.4 Test per `utils.ts` (Priorità: MEDIA)
File: `src/utils/__tests__/utils.test.ts`

**Test cases:**
- ✓ `buildSynoUrl()` - Correct URL construction
- ✓ `buildThumbUrl()` - Thumbnail URL format
- ✓ `buildOpenhabUrl()` - OpenHab endpoint building
- ✓ `injectSidToken()` - Parameter injection correctness
- ✓ `isFotoTeamAPI()` - API detection logic
- ✓ `isSelf()` - Boolean logic
- ✓ Edge cases: missing params, special characters, null values

#### 2.5 Test per `synologyAuth.ts` (Priorità: MEDIA)
File: `src/actions/__tests__/synologyAuth.test.ts`

**Test cases:**
- ✓ `authenticate()` - Successful login flow
- ✓ `authenticate()` - Retry su timeout
- ✓ `authenticate()` - Max retry exceeded → error
- ✓ Token/SID extraction da response
- ✓ Cookie handling
- ✓ Invalid credentials → error
- ✓ Network error → retry

---

### Fase 3: Integration Tests per API Routes (Giorni 6-7)

#### 3.1 Test per `app/api/revalidate/photos/route.ts`
File: `src/app/api/revalidate/photos/__tests__/route.test.ts`

**Test cases:**
- ✓ POST request success → 200 status
- ✓ Cache revalidation triggered
- ✓ Invalid request → 400 status
- ✓ Unauthorized → 401 status

#### 3.2 Test per `app/api/logger/[type]/route.ts`
File: `src/app/api/logger/[type]/__tests__/route.test.ts`

**Test cases:**
- ✓ Logging endpoint receives data
- ✓ Different log types handled
- ✓ Response status codes

#### 3.3 Test per `app/api/openhab/route.ts`
File: `src/app/api/openhab/__tests__/route.test.ts`

**Test cases:**
- ✓ OpenHab API integration
- ✓ Error handling
- ✓ Response parsing

---

### Fase 4: Component Tests (Giorni 8-9)

#### 4.1 Server Components
**Challenge**: Server components con "use server" difficili da testare unit
**Soluzione**: Test tramite integration test o E2E test

#### 4.2 Client Components - Bassa Priorità
- `mediaPlayer.tsx` - Integration test
- `photoContainer.tsx` - Render test
- `photoDate.tsx` - Date formatting test
- `roomClimatePanel.tsx` - Data display test

---

### Fase 5: E2E Testing (Giorni 10-12)

#### 5.1 Configurare Playwright
```json
{
  "devDependencies": {
    "@playwright/test": "^1.48.0"
  }
}
```

File: `playwright.config.ts` - Configuration per test env

#### 5.2 E2E Test Scenarios
- ✓ Full photo frame load
- ✓ Slideshow navigation
- ✓ Cache revalidation
- ✓ Error handling flows
- ✓ OpenHab integration
- ✓ Responsive design

---

## Decisioni Chiave da Prendere

### 1. **Test Runner: Jest vs Vitest**
- **Jest** (raccomandato): Ecosistema consolidato, ottimo supporto Next.js, plugin rich, community large
- Vitest: Più veloce, migliore DX, ma meno maturo con Next.js canary
- **Decisione**: Procedere con **Jest**

### 2. **API Mocking: MSW vs Fixture**
- **MSW** (raccomandato): Intercetta fetch, realistico, flessibile
- Fixture JSON: Più semplice, meno dipendenze
- **Decisione**: Usare **MSW** con fixture di supporto

### 3. **Environment: jsdom**
- **jsdom** (raccomandato): Standard di Next.js, migliore compatibilità browser, integrato in next/jest
- happy-dom: Più leggero ma meno supportato nell'ecosistema Next.js
- **Decisione**: Usare **jsdom** via next/jest

### 4. **Coverage Target**
- **Anno 1**: 60% overall, 90% per synologyApi.ts, config.ts, photos.action.ts
- **Anno 2**: 80% overall
- Escludere UI components da coverage, focus su logica

### 5. **Server Components Testing**
- **Approccio**: Non testare con unit test
- **Alternativa**: Integration test via Next.js test utilities o E2E test
- Lungo termine: Aspettare official Next.js testing guidelines

---

## Timeline Stima

| Fase | Giorni | Effort |
|------|--------|--------|
| 1. Setup Framework | 2 | ⭐⭐ |
| 2. Unit Tests (HIGH) | 3 | ⭐⭐⭐ |
| 3. Unit Tests (MEDIUM/LOW) | 2 | ⭐⭐ |
| 4. Integration Tests | 2 | ⭐⭐⭐ |
| 5. Component Tests | 2 | ⭐⭐ |
| 6. E2E Tests | 3 | ⭐⭐⭐ |
| **Totale** | **14 giorni** | ~40 ore |

---

## File Structure Post-Implementation

```
src/
├── actions/
│   ├── photos.action.ts
│   ├── synologyApi.ts
│   ├── synologyAuth.ts
│   └── __tests__/
│       ├── photos.action.test.ts
│       ├── synologyApi.test.ts
│       └── synologyAuth.test.ts
├── utils/
│   ├── config.ts
│   ├── utils.ts
│   ├── logger.ts
│   └── __tests__/
│       ├── config.test.ts
│       └── utils.test.ts
├── component/
│   └── ui/
│       ├── __tests__/
│       │   ├── photoContainer.test.tsx
│       │   └── ...
│       └── ...
├── app/
│   └── api/
│       ├── revalidate/photos/
│       │   └── __tests__/route.test.ts
│       ├── logger/
│       │   └── __tests__/route.test.ts
│       └── openhab/
│           └── __tests__/route.test.ts
├── test/
│   ├── mocks/
│   │   ├── handlers.ts
│   │   └── fixtures/
│   └── utils.ts
└── ...

Root:
├── jest.config.ts
├── jest.setup.ts
├── playwright.config.ts
├── e2e/ (o tests/e2e)
│   ├── photo-frame.spec.ts
│   ├── slideshow.spec.ts
│   └── cache.spec.ts
└── package.json (con test scripts)
```

---

## Prossimi Passi

1. **Confermare approccio**: Jest + MSW + jsdom?
2. **Identificare blockers**: Env vars secrets, staging environment per test Synology?
3. **Prioritizzare**: Iniziare da Phase 2 (HIGH priority unit tests)?
4. **Allocare risorse**: Chi implementa? Timeline realistica?
