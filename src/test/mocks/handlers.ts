import { http, HttpResponse } from 'msw'

const SYNO_BASE_URL = `http://${process.env.SYNO_HOST}:${process.env.SYNO_PORT}`

export const handlers = [
  // Authentication endpoint
  http.post(`${SYNO_BASE_URL}/webapi/auth.cgi`, async () => {
    return HttpResponse.json({
      data: {
        sid: 'test-sid-123456',
        did: 'test-did-789',
      },
      success: true,
    })
  }),

  // Browse folder endpoint
  http.get(`${SYNO_BASE_URL}/webapi/entry.cgi`, ({ request }) => {
    const url = new URL(request.url)
    const method = url.searchParams.get('method')

    if (method === 'browse') {
      return HttpResponse.json({
        data: {
          list: [
            {
              id: 'photo-1',
              title: 'Test Photo 1',
              filesize: 1024000,
              time: Math.floor(Date.now() / 1000),
            },
            {
              id: 'photo-2',
              title: 'Test Photo 2',
              filesize: 2048000,
              time: Math.floor(Date.now() / 1000),
            },
          ],
          total: 2,
        },
        success: true,
      })
    }

    return HttpResponse.json({ success: false }, { status: 400 })
  }),

  // Thumbnail endpoint
  http.get(`${SYNO_BASE_URL}/webapi/entry.cgi`, () => {
    return HttpResponse.arrayBuffer(new ArrayBuffer(0), {
      headers: { 'Content-Type': 'image/jpeg' },
    })
  }),
]
