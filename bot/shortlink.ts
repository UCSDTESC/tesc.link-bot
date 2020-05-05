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

export function updateShortLink() {

};

export function deleteShortLink() {

};