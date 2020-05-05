import { SlackCommandResponse } from "./types";

export function CommandResponse(body: any): SlackCommandResponse {

  return {
    token: String(body.token),
    teamID: String(body.team_id),
    teamDomain: String(body.team_domain),
    channelID: String(body.channel_id),
    userID: String(body.user_id),
    userName: String(body.user_name),
    channelName: String(body.channel_name),
    command: String(body.command),
    responseURL: String(body.response_url),
    text: String(body.text),
    triggerID: String(body.trigger_id)
  }
}