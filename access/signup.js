document
  .getElementById('signup-form')
  .addEventListener('submit', async function (e) {
    e.preventDefault()
    const username = document.getElementById('username').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Signup successful! Welcome ${data.user.username}`)
        // Optionally redirect:
        // window.location.href = '/profile';
      } else {
        alert(data.error || 'Signup failed')
      }
    } catch (err) {
      alert('An error occurred during signup.')
      console.log(err)
    }
  })
