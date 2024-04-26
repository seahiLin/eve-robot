// pages/api/challenge.js
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
    const { value } = event.action
    console.log(value, 'value')
    res.status(200).json({
      toast: {
        type: "success",
        content: "创建成功",
        i18n: {
          zh_cn: "创建成功",
          en_us: "Created successfully",
        },
      },
    });
  }
}
