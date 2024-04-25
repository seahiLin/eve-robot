// pages/api/challenge.js
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.method, req.body, 'req change')
  const { challenge } = req.body

    

    // 返回响应以文本形式
  res.status(200).send(challenge)
  // if (req.method === 'POST') {
  //   // 获取POST请求中的参数
  //   const { CHALLENGE } = req.body

    

  //   // 返回响应以文本形式
  //   res.status(200).send(CHALLENGE)
  //   // res.status(200).json({ message: 'success', CHALLENGE })
  // } else {
  //   // 如果不是POST请求，返回405 Method Not Allowed
  //   res.status(405).json({ message: 'Method not allowed' })
  // }
}