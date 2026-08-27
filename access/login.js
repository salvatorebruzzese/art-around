document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm')
  const errorDiv = document.getElementById('error')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    errorDiv.textContent = ''
    const username = form.username.value.trim()
    const password = form.password.value
    if (!username || !password) {
      errorDiv.textContent = 'Username and password are required.'
      return
    }
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        if (document.referrer) {
          window.location.replace(document.referrer)
        } else if (window.history.length > 1) {
          window.history.back()
        } else {
          window.location.href = '/marketplace/'
        }
      } else {
        const data = await res.json().catch(() => ({ error: 'Login failed' }))
        errorDiv.textContent = data.error || 'Login failed.'
      }
    } catch (err) {
      errorDiv.textContent = 'Something went wrong.'
      console.log(err)
    }
  })
})
