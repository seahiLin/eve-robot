// pages/api/challenge.js
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { challenge, event, header } = req.body;
  console.log(header, 'header')

  if (challenge) {
    res.status(200).json({ challenge });
    return;
  } else if (header?.event_type === "card.action.trigger") {
    const { value } = event.action;
    const { open_id } = event.operator;
    const { action_type, data } = JSON.parse(decodeURIComponent(value));

    switch (action_type) {
      case "create_issue":
        await AddNewIssue(data, res);
        break;
      case "update_issue":
        await UpdateIssue(data, res);
        break;
      case "give_like":
        await GiveLike(data, open_id, res);
        break;
      case "give_hate":
        await GiveHate(data, open_id, res);
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
    task_id: string;
  },
  res: NextApiResponse
) {
  const {
    epic_key,
    summary,
    description,
    assignee_email,
    reporter_email,
    task_id,
  } = data;

  const jiraUrl = `https://jira.motiong.net/browse/EV-30`;

  res.status(200).json({
    card: generateTemplate(2, data, jiraUrl),
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
  // if (status) {
  //   const transitions = await jira.listTransitions(issue_id);
  //   const transitionId = transitions.transitions.find(
  //     (transition: any) => transition.name === status
  //   )?.id;
  //   transitionId &&
  //     (await jira.transitionIssue(issue_id, {
  //       transition: {
  //         id: transitionId,
  //       },
  //     }));
  // }

  // if (comment) {
  //   await jira.addComment(issue_id, comment);
  // }

  // if (summary || description || assignee_email || reporter_email) {
  //   await jira.updateIssue(issue_id, {
  //     fields: {
  //       summary,
  //       description,
  //       assignee: assignee_email
  //         ? {
  //             name: assignee_email.split("@")[0],
  //           }
  //         : undefined,
  //       reporter: reporter_email
  //         ? {
  //             name: reporter_email.split("@")[0],
  //           }
  //         : undefined,
  //     },
  //   });
  // }

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

async function GiveLike(data: any, open_id: string, res: NextApiResponse) {
  const id = data.task_history_id || data.topic_history_id;
  res.status(200).json({
    card: generateTemplate(data.step || 1, {
      ...data,
      give_like_btn_disabled: true,
      give_hate_btn_disabled: true,
    }),
  });
}
async function GiveHate(data: any, open_id: string, res: NextApiResponse) {
  const id = data.task_history_id || data.topic_history_id;
  res.status(200).json({
    card: generateTemplate(data.step || 1, {
      ...data,
      give_like_btn_disabled: true,
      give_hate_btn_disabled: true,
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

const getAddToJiraBtnTemplate = (title: string, ticket_data: any) => ({
  tag: "button",
  text: {
    tag: "plain_text",
    content: title,
  },
  type: "default",
  complex_interaction: true,
  width: "default",
  size: "medium",
  value: `${ticket_data}`,
});
const getGoToJiraBtnTemplate = (title: string, jira_url: any) => ({
  tag: "button",
  text: {
    tag: "plain_text",
    content: title,
  },
  type: "default",
  complex_interaction: true,
  width: "default",
  size: "medium",
  value: `${jira_url}`,
});

export const generateTemplate = (step: 1 | 2, data: any, jiraUrl?: string) => {
  const {
    summary,
    description,
    assignee_name,
    reporter,
    timestamp,
    links,
    files,
    assigner_header_cn,
    assigner_header_en,
    group_name,
    source_cn,
    source_en,
    give_like_btn_disabled,
    give_hate_btn_disabled,
  } = data;

  const ticket_data = JSON.stringify({
    ...data,
    step,
    give_like_btn_disabled,
    give_hate_btn_disabled,
  });

  const template = {
    config: {},
    i18n_elements: {
      zh_cn: [
        {
          tag: "markdown",
          content: `**${summary}**\n\n**[${timestamp}]**\n${description}\n\n**${assigner_header_cn}**${reporter} \n**被分配人：**${assignee_name}\n${links}\n${files}`,
          text_align: "left",
          text_size: "normal",
        },
        {
          tag: "hr",
        },
        {
          tag: "action",
          layout: "flow",
          actions: [
            step === 1
              ? getAddToJiraBtnTemplate("添加到Jira", ticket_data)
              : getGoToJiraBtnTemplate("跳转Jira", jiraUrl),
            {
              tag: "button",
              text: {
                tag: "plain_text",
                content: "",
              },
              type: "default",
              complex_interaction: true,
              width: "default",
              size: "medium",
              icon: {
                tag: "standard_icon",
                token: "thumbsup_outlined",
              },
              disabled: give_like_btn_disabled,
            },
            {
              tag: "button",
              text: {
                tag: "plain_text",
                content: "",
              },
              type: "default",
              complex_interaction: true,
              width: "default",
              size: "medium",
              icon: {
                tag: "standard_icon",
                token: "thumbdown_outlined",
              },
              disabled: give_hate_btn_disabled,
              value: `${ticket_data}`,
            },
          ],
        },
      ],
      en_us: [
        {
          tag: "markdown",
          content: `**${summary}**\n\n**[${timestamp}]**\n${description}\n\n**${assigner_header_en}**${reporter} \n**Assignee：**${assignee_name}\n${links}\n${files}`,
          text_align: "left",
          text_size: "normal",
        },
        {
          tag: "hr",
        },
        {
          tag: "action",
          layout: "flow",
          actions: [
            step === 1
              ? getAddToJiraBtnTemplate("Add to Jira", ticket_data)
              : getGoToJiraBtnTemplate("Go to Jira", jiraUrl),
            {
              tag: "button",
              text: {
                tag: "plain_text",
                content: "",
              },
              type: "default",
              complex_interaction: true,
              width: "default",
              size: "medium",
              icon: {
                tag: "standard_icon",
                token: "thumbsup_outlined",
              },
              disabled: give_like_btn_disabled,
            },
            {
              tag: "button",
              text: {
                tag: "plain_text",
                content: "",
              },
              type: "default",
              complex_interaction: true,
              width: "default",
              size: "medium",
              icon: {
                tag: "standard_icon",
                token: "thumbdown_outlined",
              },
              disabled: give_hate_btn_disabled,
            },
          ],
        },
      ],
    },
    i18n_header: {
      zh_cn: {
        title: {
          tag: "plain_text",
          content: `任务 | ${group_name}（${source_cn}）： `,
        },
        subtitle: {
          tag: "plain_text",
          content: "",
        },
        template: "blue",
      },
      en_us: {
        title: {
          tag: "plain_text",
          content: `Task (${source_en}): ${group_name}`,
        },
        subtitle: {
          tag: "plain_text",
          content: "",
        },
        template: "blue",
      },
    },
  };

  return {
    type: "raw",
    data: template,
  };
};