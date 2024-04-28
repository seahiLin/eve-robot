const JiraApi = require("jira-client");

const ticketParam = {
  reporter_email: "seahi.lin@motiong.com",
  assign_email: "seahi.lin@motiong.com",
  summary: "test summary",
  description: "test description",
  project: "",
}

const jira = new JiraApi({
  protocol: "https",
  host: "jira.motiong.net",
  username: "eve-robot",
  password: "eve-robot",
  apiVersion: "2",
  strictSSL: true
})


const createTicket = async (ticketParam) => {
  try {
    
    const issue = await jira.addNewIssue({
      fields: {
        project: {
          key: "EV"
        },
        summary: ticketParam.summary,
        description: ticketParam.description,
        issuetype: {
          name: "Task"
        },
        assignee: {
          name: ticketParam.assign_email.split('@')[0]
        }
      }
    });
    console.log(issue, 'suceess');
    return issue;
  } catch (error) {
    console.log(error);
    return error;
  }
}

createTicket(ticketParam);