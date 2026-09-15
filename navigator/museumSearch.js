import { ref, onMounted } from 'vue'

export function useMuseumSearch(options = {}) {
  const museums = ref([])
  const search = ref('')
  const searchResults = ref([])
  const showSearch = ref(false)
  const isLoading = ref(false)
  const error = ref(null)

  const fetchMuseumsAndTours = async () => {
    isLoading.value = true
    error.value = null
    try {
      const museumsRes = await fetch('/api/museums')
      if (!museumsRes.ok)
        throw new Error('Errore durante il recupero dei musei')
      const museumsMeta = await museumsRes.json()

      const allMuseumsFull = await Promise.all(
        museumsMeta.map(async (meta) => {
          try {
            const fullRes = await fetch(`/api/museums/${meta._id}`)
            const fullMuseum = await fullRes.json()
            let tours = []
            const toursRes = await fetch(`/api/tours?museum=${fullMuseum._id}`)
            if (toursRes.ok) {
              tours = await toursRes.json()
            }
            return { ...fullMuseum, tours }
          } catch (err) {
            return { ...meta, tours: [] }
          }
        }),
      )

      for (const m of allMuseumsFull) {
        for (const t of m.tours || []) {
          t._museumName = m.name
          t._tourObj = t
        }
      }

      museums.value = allMuseumsFull
    } catch (err) {
      error.value = err
      museums.value = []
    } finally {
      isLoading.value = false
    }
  }

  const onSearchInput = () => {
    const searchTerm = search.value.trim().toLowerCase()
    if (!searchTerm) {
      searchResults.value = []
      return
    }

    const results = []

    // Filtra unicamente i tour ignorando i musei
    for (const m of museums.value) {
      for (const t of m.tours || []) {
        if (t.name && t.name.toLowerCase().includes(searchTerm)) {
          results.push({
            _id: t._id,
            name: t.name,
            type: m.name || 'Tour',
            _tourObj: t,
          })
        }
      }
    }

    searchResults.value = results
  }

  const goToSearchResult = (item) => {
    const tourData = item._tourObj || item
    if (options.onSelectTour) {
      options.onSelectTour(tourData)
    } else {
      window.location.href = `/navigator/libre/${tourData._id}`
    }
  }

  onMounted(async () => {
    await fetchMuseumsAndTours()
  })

  return {
    museums,
    search,
    searchResults,
    showSearch,
    isLoading,
    error,
    onSearchInput,
    goToSearchResult,
    fetchMuseumsAndTours,
  }
}
