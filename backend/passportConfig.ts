import passport from 'passport'
import { toPrivateUser, User } from './user/model.js'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcrypt'

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username })
      if (!user) return done(null, false, { message: 'Incorrect username.' })
      const match = await bcrypt.compare(password, user.password)
      if (!match) return done(null, false, { message: 'Incorrect password.' })
      return done(null, toPrivateUser(user))
    } catch (err) {
      return done(err)
    }
  }),
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done) => {
  done(null, user._id)
})
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    if (!user) return done(null, null)
    return done(null, toPrivateUser(user))
  } catch (err) {
    done(err)
  }
})
