import { reactive } from 'vue'

export async function checkLogIn() {
  const user = reactive({
    name: '',
    email: '',
    avatar: '',
    initials: '',
  })
  try {
    const res = await fetch('/api/profile')
    if (!res.ok) {
      window.location.href = '/login'
      return false
    }
    const result = await res.json()
    if (!result || !result.username) {
      window.location.href = '/login'
      return false
    }
    user.name = result.username || ''
    user.email = result.email || ''
    user.avatar = result.avatar || ''
    if (user.name) {
      user.initials =
        user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase() || ''
    } else {
      user.initials = ''
    }
    return true
  } catch (e) {
    window.location.href = '/login'
    return false
  }
}
