// pages/api/challenge.js
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { challenge, event, header } = req.body;
  console.log(header, "header");

  if (challenge) {
    res.status(200).json({ challenge });
    return;
  } else if (header?.event_type === "im.message.receive_v1") {
    const {
      message: { chat_id, content },
      sender: {
        sender_id: { user_id },
      },
    } = event;

    console.log(event, `{\"text\":\"<at user_id=\\\"${user_id}\\\">you</at> i see you\"}`, 'event')

    const { tenant_access_token } = await requestTenantAccessToken();
    await fetch(
      "https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tenant_access_token}`,
        },
        body: JSON.stringify({
          receive_id: chat_id,
          msg_type: "text",
          content: `{\"text\":\"<at user_id=\\\"${user_id}\\\">you</at> i see you\"}`
        }),
      }
    );

    res.status(200).json({ challenge: "success" });
    return;
  }
}

export function requestPreAuthorizationCode() {
  const APPID = "cli_a57820d23a10d00d";
  const REDIRECT_URI = encodeURIComponent("http://localhost:3001");
  const SCOPE = "";
  const STATE = "123";
  const requestUrl = `https://open.feishu.cn/open-apis/authen/v1/authorize?app_id=${APPID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}`;
  console.log("requestURL: ", requestUrl);
  return fetch(requestUrl).then((res) => {
    console.log("res: ", res);
  });
}

export async function requestTenantAccessToken() {
  return fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        app_id: "cli_a6b2ff48387a500d",
        app_secret: "MSMd1u4oj88TusihZAIJabQ1M4TylMsU",
      }),
    }
  ).then((res) => {
    return res.json();
  });
}
