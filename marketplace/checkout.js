import Alpine from 'alpinejs'
import './userManager'

document.addEventListener('alpine:init', () => {
  Alpine.data('checkout', () => ({
    tours: [],
    total: 0,
    user: null,

    async init() {
      const url = new URL(window.location.href)
      const toursParam = url.searchParams.get('tours')

      if (!toursParam) return

      const tourIds = toursParam.split(',')

      const fetchPromises = tourIds.map(async (id) => {
        try {
          const response = await fetch('/api/tours/' + id.trim())
          if (response.ok) {
            return await response.json()
          }
        } catch (error) {
          console.error('Errore durante il recupero del tour:', error)
        }
        return null
      })

      const results = await Promise.all(fetchPromises)
      this.tours = results.filter((tour) => tour !== null)
      this.total = this.tours.reduce((sum, tour) => sum + (tour.price || 0), 0)
      this.user = await Alpine.store('userManager').getUser()
    },
  }))
})

window.Alpine = Alpine
Alpine.start()
