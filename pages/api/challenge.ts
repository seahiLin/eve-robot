// pages/api/challenge.js
import { NextApiRequest, NextApiResponse } from "next";
import { jira } from "../../lib/jira";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { challenge, event, header } = req.body;
  console.log(header, event, 'dsfjskla');

  if (challenge) {
    res.status(200).json({ challenge });
    return;
  } else if (header?.event_type === "card.action.trigger") {
    const { value } = event.action;
    const { action_type, data } = JSON.parse(decodeURIComponent(value));

    switch (action_type) {
      case "create_issue":
        await AddNewIssue(data, res);
        break;
      case "update_issue":
        await UpdateIssue(data, res);
        break;
      default:
        break;
    }
  } else if (event?.type === "p2p_chat_create") {
    const { chat_id } = event;

    res.status(200).json({});
  }
}

async function AddNewIssue(
  data: {
    epic_key: string;
    summary: string;
    description: string;
    assignee_email: string;
    reporter_email: string;
  },
  res: NextApiResponse
) {
  const { epic_key, summary, description, assignee_email, reporter_email } =
    data;
  // const jiraRes = await jira.addNewIssue({
  //   fields: {
  //     project: {
  //       key: "EV",
  //     },
  //     summary,
  //     description,
  //     reporter: {
  //       name: reporter_email.split("@")[0],
  //     },
  //     assignee: {
  //       name: assignee_email.split("@")[0],
  //     },
  //     issuetype: {
  //       name: "Task",
  //     },
  //     customfield_10110: epic_key,
  //   },
  // });

  const jiraUrl = `https://jira.motiong.net/browse/EV-30`;

  res.status(200).json({
    card: {
      type: "template",
      data: {
        template_id: "AAqkEEHFfkMmp",
        template_version_name: "1.0.0",
        template_variable: {
          jira_url: {
            pc_url: jiraUrl,
            android_url: jiraUrl,
            ios_url: jiraUrl,
            url: jiraUrl,
          },
          ...data,
        },
      },
    },
  });
}
async function UpdateIssue(
  data: {
    issue_id: string;
    status?: string;
    summary?: string;
    description?: string;
    assignee_email?: string;
    reporter_email?: string;
    comment?: string;
  },
  res: NextApiResponse
) {
  const {
    issue_id,
    status,
    summary,
    description,
    assignee_email,
    reporter_email,
    comment,
  } = data;
  if (status) {
    const transitions = await jira.listTransitions(issue_id);
    const transitionId = transitions.transitions.find(
      (transition: any) => transition.name === status
    )?.id;
    transitionId &&
      (await jira.transitionIssue(issue_id, {
        transition: {
          id: transitionId,
        },
      }));
  }

  if (comment) {
    await jira.addComment(issue_id, comment);
  }

  if (summary || description || assignee_email || reporter_email) {
    await jira.updateIssue(issue_id, {
      fields: {
        summary,
        description,
        assignee: assignee_email
          ? {
              name: assignee_email.split("@")[0],
            }
          : undefined,
        reporter: reporter_email
          ? {
              name: reporter_email.split("@")[0],
            }
          : undefined,
      },
    });
  }

  const jiraUrl = `https://jira.motiong.net/browse/${issue_id}`;

  res.status(200).json({
    card: {
      type: "template",
      data: {
        template_id: "AAqkEEHFfkMmp",
        template_version_name: "1.0.0",
        template_variable: {
          jira_url: {
            pc_url: jiraUrl,
            android_url: jiraUrl,
            ios_url: jiraUrl,
            url: jiraUrl,
          },
          ...data,
        },
      },
    },
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
