export type SlackCommandResponse = {
  token: string;
  teamID: string;
  teamDomain: string;
  channelID: string;
  channelName: string;
  userID: string;
  userName: string;
  command: string;
  text: string;
  responseURL: string;
  triggerID: string;
}

export enum Operations {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Help = 'help',
  QR = 'qr'
}