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
      assignee_email,
      reporter_email
    } = JSON.parse(decodeURIComponent(value));

    console.log(summary, description, assignee_email, reporter_email, "value change");

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

    console.log(jiraUrl, "jiraUrl change")

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
  }
}
