const fetch = global.fetch || require('node-fetch')

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    let body = {}
    try { body = JSON.parse(event.body || '{}') } catch(e) { }
    const paymentId = body.payment_id || body.id || body.token || body.payment_request_id

    if (!paymentId) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'payment_id required' }) }
    }

    const INSTAMOJO_API_KEY = process.env.INSTAMOJO_API_KEY
    const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN
    const INSTAMOJO_BASE = process.env.INSTAMOJO_BASE || 'https://api.instamojo.com'

    if (!INSTAMOJO_API_KEY || !INSTAMOJO_AUTH_TOKEN) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Instamojo credentials not configured' }) }
    }

    const url = `${INSTAMOJO_BASE}/v2/payments/${encodeURIComponent(paymentId)}`

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': INSTAMOJO_API_KEY,
        'X-Auth-Token': INSTAMOJO_AUTH_TOKEN
      }
    })

    const text = await resp.text()
    let json
    try { json = JSON.parse(text) } catch(e) { json = { raw: text } }

    if (!resp.ok) {
      return { statusCode: 502, body: JSON.stringify({ ok: false, error: 'Instamojo API error', status: resp.status, data: json }) }
    }

    const status = json.status || (json.payment && json.payment.status) || (json.data && json.data.status) || (json.payment && json.payment.payment_status)

    const success = status && String(status).toLowerCase().includes('success') ||
                    status && String(status).toLowerCase().includes('credit') ||
                    status && String(status).toLowerCase().includes('completed')

    if (!success) {
      return { statusCode: 200, body: JSON.stringify({ ok: false, message: 'Payment not completed', status, data: json }) }
    }

    // TODO: replace with real DB update to mark order as paid and generate secure downloads
    const downloads = [
      { name: 'sample-file.zip', url: 'https://famechase.com/downloads/sample-file.zip' }
    ]

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, message: 'Payment verified', status, data: json, downloads })
    }

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) }
  }
}
