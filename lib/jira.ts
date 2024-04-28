import Jira from "jira-client";

export const jira = new Jira({
  protocol: "https",
  host: "jira.motiong.net",
  username: "eve-robot",
  password: "eve-robot",
  apiVersion: "2",
  strictSSL: true,
});

const a = {
  summary: "test summary",
  description: "test description",
  assignee: { email: "test@email.com" },
};
