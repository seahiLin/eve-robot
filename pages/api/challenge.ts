// pages/api/challenge.js
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { challenge, event, header } = req.body;

  console.log("header, event, challenge", header, event, challenge);

  if (challenge) {
    res.status(200).json({ challenge });
    return;
  } else if (header?.event_type === "im.message.receive_v1") {
    const {
      message: { message_id, chat_type, content, mentions },
      sender: {
        sender_id: { user_id },
      },
    } = event;

    console.log(event, header, mentions, "param");

    if (
      chat_type === "p2p" ||
      (chat_type === "group" &&
        mentions?.find(
          (mention: any) =>
            mention?.id?.union_id === "on_501aec72fef5e5d2f38b3959840dd0ac" &&
            mention?.id?.user_id === ""
        ))
    ) {
      handleMessage(content, message_id, user_id);
    }

    res.status(200).json({});
    return;
  }
}

async function handleMessage(
  content: any,
  message_id: string,
  user_id: string
) {
  const jsonContent = JSON.parse(content);
  let queryStr = "";
  if (jsonContent.text) {
    queryStr = jsonContent.text;
  } else if (jsonContent.content?.length) {
    const textValues = jsonContent.content.reduce(
      (
        acc: string[],
        curr: {
          tag: string;
          text?: string;
        }[]
      ) => {
        const textNodes = curr
          .filter((item) => item.tag === "text")
          .map((item) => item.text || "");
        return acc.concat(textNodes);
      },
      []
    );
    queryStr = textValues.filter((t: string) => t).join(", ");
  } else {
    return;
  }

  const result = {
    text: "hello",
    attachments: [
      {
        file_key: "file_v3_00as_70b94316-7832-4ac1-8185-526c92bc881g",
        file_name: "产品-柔性 1 (1) (1).png",
      },
      {
        fil_key: "img_v3_02as_7e283f0e-aa06-43bf-b3d0-4fe6c526d36g",
      }
    ],
  }

  const { tenant_access_token } = await requestTenantAccessToken();
  fetch(`https://open.feishu.cn/open-apis/im/v1/messages/${message_id}/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tenant_access_token}`,
    },
    body: JSON.stringify({
      msg_type: "post",
      content: JSON.stringify({
        zh_cn: {
          content: [
            [
              {
                tag: "text",
                text: result.text,
              },
            ],
            [
              {
                tag: "img",
                image_key: result.attachments[1].file_key,
              }
            ]
          ]
        }
      })
    }),
  });
  fetch(`https://open.feishu.cn/open-apis/im/v1/messages/${message_id}/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tenant_access_token}`,
    },
    body: JSON.stringify({
      msg_type: "file",
      content: JSON.stringify({
        file_key: result.attachments[0].file_key,
      })
    }),
  });
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
