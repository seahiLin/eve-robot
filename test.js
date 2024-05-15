
const result = {
  data: {
    response: {
      text: "hello",
      attachments: [
        {
          file_key: "file_xxx",
          file_name: "file_name",
        },
        {
          file_key: "img_yyy",
          file_name: "file_name",
        }
      ]
    }
  }
}

async function dod() {
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

function sendFileMessage(fileKey, fileName) {
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
        msg_type: "file",
        content: "{\"file_key\":\"file_v2_xxx\"}",
      }),
    }
  );
}

async function requestTenantAccessToken() {
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

dod()
