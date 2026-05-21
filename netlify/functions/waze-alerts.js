// Proxy for the Waze live-map alerts feed — avoids CORS in the browser.
// Bounding box covers Melbourne metro + inner suburbs.
const BBOX = { top: -37.55, bottom: -38.20, left: 144.50, right: 145.50 };

exports.handler = async function () {
  try {
    const url =
      `https://www.waze.com/row-rtserver/web/TGeoRSS` +
      `?tk=community&format=JSON&types=alerts` +
      `&left=${BBOX.left}&right=${BBOX.right}&top=${BBOX.top}&bottom=${BBOX.bottom}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Referer': 'https://www.waze.com/live-map',
      },
    });
    if (!res.ok) throw new Error(`Waze upstream ${res.status}`);
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: e.message }) };
  }
};
