import * as dotenv from 'dotenv';
import * as path from 'path';
import express from 'express'
import * as bodyParser from 'body-parser';
import { isVerified } from './verify';
import { Operations } from './types';
import * as Adapters from './adapters';
import fetch from 'node-fetch';
import { createShortLink, deleteShortLink, updateShortLink } from './shortlink';
dotenv.config({path: path.join(__dirname, '../.env')});

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 * Use body-parser's `verify` callback to export a parsed raw body
 * that you need to use to verify the signature
 */
const rawBodyBuffer = (req: express.Request, res: express.Response, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

async function respondToSlack(url: string, message: object) {
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
});
}

app.post('/link', isVerified, async (req: express.Request, res) => {
  const body = Adapters.CommandResponse(req.body);
  var helpMessage = {
    "text": `
      *Interact with tesc.link*

Supported Actions - \n
1) 📝 *Create* - \`/link create <your_short_link> <your_long_link>\`

2) 💻 *Update* - \`/link update <your_short_link> <your_new_long_link>\`

3) 🗑️ *Delete* - \`/link delete <your_short_link>\`

4) #️⃣ *QR* = \`/link qr <your_short_link>\`

5) 💁‍♂️ *Help* = \`/link help\`
    `,
  }
  if (!body.text) {
    //TODO: add some emojis, make formatting better here.
    //TODO: Stretch: Interactive bot with buttons perhaps?

    return await respondToSlack(body.responseURL, helpMessage);
  }

  // Replace all multiple whitespaces to a single space, and then split.
  const [op, ...args] = body.text.replace(/\s{2,}/g,' ').split(' ');

  try {
    switch(op.toLowerCase()) {
      case Operations.Create: {
        const response = await createShortLink(args[0], args[1]);
        await respondToSlack(body.responseURL, {
          text: `Created New Shortlink at http://www.${response.shortUrl} for ${response.destination}`
        });
        break;
      }
      case Operations.Delete:{
        const response = await deleteShortLink(args[0]);
        await respondToSlack(body.responseURL, {
            text: `Deleted http://www.${response.shortUrl} successfully.`
        });
        break;
      }
      case Operations.Update: {
        const response = await updateShortLink(args[0], args[1]);
        await respondToSlack(body.responseURL, {
          text: `Updated http://www.${response.shortUrl} successfully.`
        });
        break;
      }
      case Operations.QR: {

        if (!args[0]) throw Error('No Shortlink Passed In');

        const qrUrl = 'https://qr.rebrandly.com/v1/qrcode?' + (new URLSearchParams({
          'shortUrl': `https://tesc.link/${args[0]}`
        }).toString());
        await respondToSlack(body.responseURL, {
          text: `Your shortlink QR Code -> ${qrUrl}`
        });
        break;
      }
      case Operations.Help:
      default:
        await respondToSlack(body.responseURL, helpMessage);
    }
  } catch(e) {
    console.error(e);
    await respondToSlack(body.responseURL, {
      in_channel: body.channelID,
      text: `❎ Operation ${op} failed: ${e.message}`,
      response_type: "ephemeral",
    })
  }

  res.status(200).send()
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Express server listening on port %d', PORT);
});
