import fetch from 'node-fetch';
const API_ROOT = 'https://api.rebrandly.com/v1/';

export async function createShortLink(shortLinkSlug: string, destURL: string): Promise<any> {
  console.log("Creating shortlink...", shortLinkSlug, destURL);
  if (!shortLinkSlug) {
    throw Error('You must provide a short link');
  }

  if (!destURL) {
    throw Error('You must provide a destination url');
  }

  try {
    const res = await fetch(`${API_ROOT}/links`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "apikey": String(process.env.REBRANDLY_API_KEY),
      },
      body: JSON.stringify({
        destination: destURL,
        slashtag: shortLinkSlug,
        domain: {
          fullName: 'tesc.link'
        }
      })
    });
    const response: object = await res.json();

    if (res.ok) {
      return Promise.resolve(response);
    } else return Promise.reject(response); 

  } catch (e) {
    return Promise.reject(e); 
  }
};

// We only care about updating shortlink -> destination records, not the other way around.
export async function updateShortLink(shortLinkSlug: string, newDestination: string) {
  try {
    const obj = await getShortLinkBySlug(shortLinkSlug);
    if (!obj) throw Error('Couldn\'t find shortlink to delete');
    const res = await fetch(`${API_ROOT}/links/${obj.id}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        'apikey': String(process.env.REBRANDLY_API_KEY)
      },
      body: JSON.stringify({
        id: obj.id,
        destination: newDestination
      })
    });

    const response = await res.json();
    if (res.ok) {
      return Promise.resolve(response);
    } else return Promise.reject(response); 

  } catch(e) {
    return Promise.reject(e);
  }
};

export async function deleteShortLink(shortLinkSlug: string) {
  try {
    const obj = await getShortLinkBySlug(shortLinkSlug);
    if (!obj) throw Error('Couldn\'t find shortlink to delete');
    const res = await fetch(`${API_ROOT}/links/${obj.id}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        'apikey': String(process.env.REBRANDLY_API_KEY)
      } 
    });

    const response = await res.json();
    if (res.ok) return Promise.resolve(response);

    return Promise.reject(response);

  } catch(e) {
    return Promise.reject(e);
  }
};

async function getShortLinkBySlug(shortLinkSlug: string) {
  const res = await fetch(`${API_ROOT}/links?` + + new URLSearchParams({
      'slashtag': shortLinkSlug,
      'domain[fullName]': 'tesc.link',
    }), {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "apikey": String(process.env.REBRANDLY_API_KEY),
    },
  }); 

  const response: Array<any> = await res.json();

  return response.find(x => x.slashtag === shortLinkSlug);
}