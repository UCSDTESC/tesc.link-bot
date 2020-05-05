import * as crypto from 'crypto';
import timeSafeCompare from 'tsscmp';
import { Request, Response } from 'express';

export const isVerified = (req: Request, res: Response, next: any) => {
  const signature = req.headers['x-slack-signature'] as string;
  const timestamp = req.headers['x-slack-request-timestamp'] as string;
  const hmac = crypto.createHmac('sha256', String(process.env.SLACK_SIGNING_SECRET));

  if (!signature) {
    console.error('No Signature Passed In');
    return res.status(403).send('Error: No Signature Passed In');
  }

  const [version, hash] = signature.split('=');

  // Check if the timestamp is too old
  const fiveMinutesAgo = (~~(Date.now() / 1000) - (60 * 5)).toString();
  if (timestamp < fiveMinutesAgo) return false;

  hmac.update(`${version}:${timestamp}:${req.rawBody}`);

  // check that the request signature matches expected value
  if (timeSafeCompare(hmac.digest('hex'), hash)) {
    return next();
  } else {
    return res.status(403).send('Error: Request Signature Did Not Match Expected Value');
  }
};
