document.addEventListener('DOMContentLoaded', async (e) => {
  e.preventDefault()

  try {
    const response = await fetch('/credentials')

    if (!response.ok) {
      throw new Error('HTTP error. Status: ${response.status}')
    }

    const data = await response.json()

    const username = document.getElementById('username')
    const email = document.getElementById('email')

    if (username) username.textContent = data.username ?? ''
    if (email) email.textContent = data.email ?? ''
  } catch (err) {
    alert('An error has occured during load.')
    console.log(err)
  }
})
