import { getUserByName } from '../../../lib/db'
import { NextApiRequest, NextApiResponse } from 'next'

interface ErrorResponse {
  message: string;
}

interface User {
  // Define the user properties based on the expected response from getUserByName
  id: string;
  name: string;
  email: string;
  // Add other properties as needed
}

export default async function getUser(req: NextApiRequest, res: NextApiResponse<User | ErrorResponse>) {
  const { username } = req.query

  if (!username || Array.isArray(username)) {
    res.status(400).json({ message: 'Username must be provided.' })
    return;
  }

  try {
    const user = await getUserByName(username as string)
    res.status(200).json(user)
  } catch (err: any) {
    if (err.code === 'user/not-found') {
      res
        .status(404)
        .json({ message: 'A user with that name could not be found.' })
    } else {
      res.status(500).json({ message: 'Internal error.' + err })
    }
  }
}
