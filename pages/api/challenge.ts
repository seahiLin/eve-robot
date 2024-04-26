// pages/api/challenge.js
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.method, req.body, "req change");
  const { challenge } = req.body;

  if (challenge) {
    res.status(200).json({ challenge });
    return;
  }

  res.status(200).json({
    toast: {
      type: "info",
      content: "创建成功",
      i18n: {
        zh_cn: "创建成功",
        en_us: "Created successfully",
      },
    },
  });
}
