import { NextApiRequest, NextApiResponse } from 'next'
import { getUserByName } from '../../../lib/db'
import { User } from '../../../types/user'

type ResponseData = {
  message?: string
  user?: User
}

export default async function getUser(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { username } = req.query

  if (!username || Array.isArray(username)) {
    return res.status(400).json({ message: 'Username must be provided.' })
  }

  try {
    const user = await getUserByName(username)
    res.status(200).json({ user })
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'user/not-found') {
        res
          .status(404)
          .json({ message: 'A user with that name could not be found.' })
      } else {
        res.status(500).json({ message: `Internal error: ${err.message}` })
      }
    } else {
      res.status(500).json({ message: 'An unknown error occurred' })
    }
  }
}
