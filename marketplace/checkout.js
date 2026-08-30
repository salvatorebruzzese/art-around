import Alpine from 'alpinejs'
import './userManager'

document.addEventListener('alpine:init', () => {
  Alpine.data('checkout', () => ({
    tourIds: [],
    tours: [],
    total: 0,
    user: null,

    async init() {
      const url = new URL(window.location.href)
      const toursParam = url.searchParams.get('tours')

      if (!toursParam) return

      this.tourIds = toursParam
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)

      const fetchPromises = this.tourIds.map(async (id) => {
        try {
          const res = await fetch(`/api/tours/${id}`)
          if (res.ok) return await res.json()
        } catch (err) {
          console.error('Errore durante il recupero del tour:', err)
        }
        return null
      })

      const results = await Promise.all(fetchPromises)
      this.tours = results.filter((tour) => tour !== null)
      this.total = this.tours.reduce((sum, tour) => sum + (tour.price || 0), 0)
      this.user = await Alpine.store('userManager').getUser()
    },
    async updateUser() {
      if (!this.user?._id) {
        console.error('Utente non valido o ID mancante.')
        return
      }

      this.user.purchasedTours = [
        ...new Set([...this.user.purchasedTours, ...this.tourIds]),
      ] // Update user with new elements only
      try {
        const response = await fetch('/api/users/' + this.user._id, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.user), // Updated user
        })
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()
        console.log('Updated:', data)
      } catch (error) {
        console.error('Fetch error:', error)
      }
    },
  }))
})

window.Alpine = Alpine
Alpine.start()
