import express, { Request, Response } from 'express'
import {
  UserPatch,
  UserQuery,
  SignupInput,
  privateUserFields,
} from './model.js'
import UserService from './service.js'
import mongoose from 'mongoose'
import { ensureAuth } from '../accessControl.js'
import { handleLeft } from '../shared/router.js'
import { project } from '../shared/utils.js'

const router = express.Router()

// Public signup endpoint (no auth required)
export async function signup(req: Request, res: Response) {
  const validation = SignupInput.validate(req.body)
  if (validation.isLeft())
    return res.status(400).json({ error: validation.extract() })
  const input = validation.unsafeCoerce()

  const result = await UserService.signup(input)
  result.caseOf({
    Right: (user) => res.status(201).json(project(privateUserFields, user)),
    Left: (error) => {
      switch (error.type) {
        case 'DBError':
          return res.status(500).json({ error })
        case 'ConflictError':
          return res.status(409).json({ error })
        default:
          return res.status(400).json({ error })
      }
    },
  })
}
router.post('/signup', signup)

router.get('/', async (req: Request, res: Response) => {
  const validation = UserQuery.validate(req.query)
  if (validation.isLeft())
    return res.status(400).json({ error: validation.extract() })

  const query = validation.unsafeCoerce()
  const result = await UserService.listUsers(query)
  result.caseOf({
    Right: (userList) => res.json(userList),
    Left: (e) => {
      switch (e.type) {
        case 'DBError':
          return res.status(500).json({ error: e })
        default:
          return res.status(404).json({ error: e })
      }
    },
  })
})

router.get('/:id', ensureAuth, async (req: Request, res: Response) => {
  const userID = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const currentUserId = req.user!._id
  if (!mongoose.Types.ObjectId.isValid(userID))
    return res.status(400).json({ message: 'Malformed user ID' })
  const id = mongoose.Types.ObjectId.createFromHexString(userID)

  const result = await UserService.getUser(id, currentUserId)
  result.caseOf({
    Right: (user) => res.json(user),
    Left: handleLeft(res),
  })
})

// router.post('/', ensureAuth, async (req: Request, res: Response) => {
//   // Not implemented, see service for admin create
// })

router.patch('/:id', ensureAuth, async (req: Request, res: Response) => {
  const userID = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const currentUserId = req.user!._id
  if (!mongoose.Types.ObjectId.isValid(userID))
    return res.status(400).json({ message: 'Malformed user ID' })
  const id = mongoose.Types.ObjectId.createFromHexString(userID)

  const validation = UserPatch.validate(req.body)
  if (validation.isLeft())
    return res.status(400).json({ error: validation.extract() })
  const input = validation.unsafeCoerce()

  const result = await UserService.patchUser(id, input, currentUserId)
  result.caseOf({
    Right: (user) => res.json(user),
    Left: handleLeft(res),
  })
})

router.delete('/:id', ensureAuth, async (req: Request, res: Response) => {
  const userID = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const currentUserId = req.user!._id
  if (!mongoose.Types.ObjectId.isValid(userID))
    return res.status(400).json({ message: 'Malformed user ID' })
  const id = mongoose.Types.ObjectId.createFromHexString(userID)

  const result = await UserService.deleteUser(id, currentUserId)
  result.caseOf({
    Right: (user) => res.json(user),
    Left: handleLeft(res),
  })
})

export default router
