import Jira from "jira-client";

export const jira = new Jira({
  protocol: "http",
  host: "szx.proxy.motiong.com",
  port: "21080",
  username: "eve-robot",
  password: "eve-robot",
  apiVersion: "2",
  intermediatePath: "/2",
  strictSSL: false
});