import { getUserByName } from '../../../lib/db'
import { NextApiRequest, NextApiResponse } from 'next'

// Define a type for the user object
type User = {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

// Define a type for the error object
type Error = {
  code: string;
  message: string;
}

// Define an enum for error codes
enum ErrorCode {
  UserNotFound = 'user/not-found',
  InternalError = 'internal-error'
}

export default async function getUser(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query

  if (!username || Array.isArray(username)) {
    res.status(400).json({ message: 'Username must be provided.' })
    return;
  }

  try {
    const user: User = await getUserByName(username as string)
    res.status(200).json(user)
  } catch (err) {
    const error = err as Error;
    if (error.code === ErrorCode.UserNotFound) {
      res
        .status(404)
        .json({ message: 'A user with that name could not be found.' })
    } else {
      res.status(500).json({ message: 'Internal error.' + error.message })
    }
  }
}
