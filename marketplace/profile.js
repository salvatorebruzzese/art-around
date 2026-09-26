import Alpine from 'alpinejs'

document.addEventListener('DOMContentLoaded', async (e) => {
  e.preventDefault()

  try {
    const credentialRes = await fetch('/api/profile')

    if (!credentialRes.ok) {
      throw new Error('HTTP error. Status: ${response.status}')
    }

    const credentials = await credentialRes.json()
    const userResponse = await fetch(
      `/api/users/${encodeURIComponent(credentials._id)}`,
    )

    const user = await userResponse.json()

    const username = document.getElementById('username')
    const email = document.getElementById('email')
    const profilePic = document.getElementById('profilepic')

    if (username) username.textContent = user.username ?? ''
    if (email) email.textContent = user.email ?? ''
    if (profilePic) {
      profilePic.src = user.profilePicture
        ? `/api/assets/${encodeURIComponent(user.profilePicture)}`
        : 'https://dummyimage.com/600x600/efefef/a3a3a3.jpg&text=No+image'
    }
  } catch (err) {
    alert('An error has occured during load.')
    console.log(err)
  }
})

window.Alpine = Alpine
Alpine.start()
