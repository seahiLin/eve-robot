import { jira } from "@/lib/jira";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.method, req.body, "req change");
  const { challenge, event, header } = req.body;

  if (challenge) {
    res.status(200).json({ challenge });
    return;
  } else if (header.event_type === "card.action.trigger") {
    const { value } = event.action;
    const {
      summary,
      description,
      assignee: { email },
    } = JSON.parse(decodeURIComponent(value));

    console.log(summary, description, email, "value change")

    res.status(200).json({
      toast: {
        type: "success",
        content: "创建1成功",
        i18n: {
          zh_cn: "创建1成功",
          en_us: "Created successfully",
        },
      },
    });
    return

    await jira.addNewIssue({
      fields: {
        project: {
          key: "EV",
        },
        summary,
        description,
        assignee: {
          name: email.split("@")[0],
        },
        issuetype: {
          name: "Task",
        },
      },
    })

    
  }
}
