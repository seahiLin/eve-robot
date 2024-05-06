// pages/api/challenge.js
import { NextApiRequest, NextApiResponse } from "next";
import { jira } from "../../lib/jira";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { challenge, event, header } = req.body;

  if (challenge) {
    res.status(200).json({ challenge });
    return;
  } else if (header.event_type === "card.action.trigger") {
    const { value } = event.action;
    const {
      summary,
      description,
      assignee_email,
      reporter_email
    } = JSON.parse(decodeURIComponent(value));

    const jiraRes = await jira.addNewIssue({
      fields: {
        project: {
          key: "EV",
        },
        summary,
        description,
        reporter: {
          name: reporter_email.split("@")[0],
        },
        assignee: {
          name: assignee_email.split("@")[0],
        },
        issuetype: {
          name: "Task",
        },
      },
    });
    
    const jiraUrl = `https://jira.motiong.net/browse/${jiraRes.key}`;

    res.status(200).json({
      card: {
        type: "template",
        data: {
          template_id: "AAqkhmJtZQdKF",
          template_version_name: "1.0.3",
          template_variable: {
            jira_url: {
              pc_url: jiraUrl,
              android_url: jiraUrl,
              ios_url: jiraUrl,
              url: jiraUrl,
            },
          },
        },
      },
    });
  } else if (header.event.type === "p2p_chat_create") {
    const { chat_id } = event;

    console.log(chat_id, header, 'test seahi')

    const { tenant_access_token } = await requestTenantAccessToken();
    await fetch("https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tenant_access_token}`,
      },
      body: JSON.stringify({
        "receive_id": chat_id,
        "msg_type": "interactive",
        "content": "{\"type\":\"template\",\"data\":{\"template_id\":\"AAqkICQ6WboIT\",\"template_version_name\":\"1.0.5\"}}"
      }),
    });

    res.status(200).json({});
  }
}

function requestTenantAccessToken() {
  return fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        app_id: "cli_a57820d23a10d00d",
        app_secret: "ZLdYvDCMWbcYYDkXe0FwxbZDIn5YnAdB",
      }),
    }
  ).then((res) => {
    return res.json();
  });
}
