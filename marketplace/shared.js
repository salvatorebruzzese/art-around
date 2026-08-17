import Alpine from 'alpinejs'

Alpine.store('shared', {
  async logout() {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    })
    window.location.href = '../home/'
  },
})
