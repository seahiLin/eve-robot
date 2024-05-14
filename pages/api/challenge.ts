// pages/api/challenge.js
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const { challenge, event, header } = req.body;
  const header = {
    event_id: "8e1431a5d59f986398dff93ce89d458d",
    token: "zPD1pEYf0mPqa8q77y96BbjlzXwScewk",
    create_time: "1715685178220",
    event_type: "im.message.receive_v1",
    tenant_key: "1172885e3e4f975d",
    app_id: "cli_a6b2ff48387a500d",
  };
  const event = {
    message: {
      chat_id: "oc_c2caec16ec5d62ebb3ee18f8dadc3da0",
      chat_type: "p2p",
      content: '{"text":"测试团队进展如何"}',
      create_time: "1715685177961",
      message_id: "om_787be71402e63428d812c71c4cd7e9f5",
      message_type: "text",
      update_time: "1715685177961",
    },
    sender: {
      sender_id: {
        open_id: "ou_870014ab6e3a0a73bca8fa560489c059",
        union_id: "on_232001dbcb30eb6cf7f168a6299f7e3f",
        user_id: "515e4a6b",
      },
      sender_type: "user",
      tenant_key: "1172885e3e4f975d",
    },
  };

  console.log(header, event, "header");

  if (header?.event_type === "im.message.receive_v1") {
    const {
      message: { chat_id, content },
      sender: {
        sender_id: { user_id },
      },
    } = event;

    handle(content, chat_id, user_id);

    res.status(200).json({});
    return;
  }
}

const handle = async(content: any,chat_id: string, user_id: string) => {
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

    console.log("queryStr: ", queryStr);

    const ragResult = await fetch(
      "https://api.rag.eve.platform.motiong.com/rag/v1/ask_query",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: queryStr,
        }),
      }
    )
      .then((res) => res.json())
      .catch((err) => {
        console.log("err: ", err);
        return Promise.reject(err);
      });

    if (ragResult.code === 0) {
      const { tenant_access_token } = await requestTenantAccessToken();
      fetch(
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
            content: `{\"text\":\"<at user_id=\\\"${user_id}\\\">you</at> ${ragResult.data.response}\"}`,
          }),
        }
      );
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
