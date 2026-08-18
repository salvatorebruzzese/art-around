import Alpine from 'alpinejs'

Alpine.store('viewer', {
  async getTour() {
    const id = window.location.pathname.split('/').pop()
    const response = await fetch('/api/tours/' + id)
    const tour = response.json()
    return tour
  },
})

window.Alpine = Alpine
Alpine.start()
