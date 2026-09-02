<template>
  <div
    class="min-h-screen pb-32 bg-p-light font-serif text-p-dark selection:bg-p-soft overflow-x-hidden"
  >
    <!-- Museums List -->
    <div v-for="museum in museums" :key="museum._id" class="mb-14">
      <h2
        class="text-2xl font-bold underline mb-3 px-4 font-serif text-p-dark/90"
      >
        {{ museum.name }}
      </h2>
      <!-- Horizontally swipeable tours -->
      <div class="scrollbar-hide overflow-x-auto px-2 -mx-2">
        <div class="flex flex-nowrap gap-6">
          <div
            v-for="tour in museum.tours"
            :key="tour._id"
            class="flex-none w-72 h-96 bg-white rounded-2xl shadow-md border border-p-soft/40 relative transition-all hover:shadow-xl cursor-pointer"
            @click="showTourConfirm(tour)"
          >
            <!-- Photo with overlay -->
            <div
              class="relative h-48 rounded-t-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-p-light to-p-soft/20"
            >
              <img
                :src="
                  tour.thumbnail
                    ? `/api/assets/${tour.thumbnail}`
                    : 'https://dummyimage.com/320x240/efefef/a3a3a3.jpg&text=Tour'
                "
                alt="tour"
                class="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
              />
            </div>
            <!-- Info Area -->
            <div
              class="p-5 flex flex-col gap-2 bg-p-soft/10 rounded-b-2xl h-[calc(100%-12rem)]"
            >
              <div
                class="font-semibold text-p-medium text-lg truncate font-serif"
              >
                {{ tour.name }}
              </div>
              <div
                class="flex items-center text-xs text-p-medium/70 gap-3 font-sans"
              >
                <span class="flex items-center gap-1">
                  <svg
                    class="inline w-4 h-4 -mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 8v4l3 2"
                    ></path>
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    ></circle>
                  </svg>
                  {{ getItemsDuration(tour.items) || '--' }} min
                </span>
                <span class="flex items-center gap-1">
                  <svg
                    class="inline w-4 h-4 -mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 8c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 4c-2.21 0-4 1.12-4 2.5v2.5h8V14.5c0-1.38-1.79-2.5-4-2.5z"
                    ></path>
                  </svg>
                  €{{ tour.price != null ? tour.price : '--' }}
                </span>
                <span
                  class="ml-auto bg-p-soft/40 rounded-full px-2 py-0.5 text-p-medium text-xs font-sans"
                >
                  {{ getAuthorName(tour.author) || 'Unknown' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- More Button -->
      <div class="text-right px-4 mt-3">
        <button
          class="shared-button-fit-secondary px-5 font-sans"
          @click="onMore(museum)"
        >
          Mostra altro &rarr;
        </button>
      </div>
    </div>

    <!-- NavBar Fixed Bottom -->
    <nav
      class="fixed z-40 bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t border-p-soft/60 flex items-center justify-between px-4 py-3 shadow-lg"
      style="min-height: 56px"
    >
      <a
        href="/home"
        class="nav-icon-link group !p-0 !border-none shadow-sm rounded-xl hover:!bg-transparent"
        ><svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            width="48"
            height="48"
            rx="12"
            fill="white"
            stroke="none"
            class="group-hover:fill-[var(--color-p-medium)] transition-colors"
          />
          <path
            d="M24 12 L10 24 H14 V36 H22 V28 H26 V36 H34 V24 H38 Z"
            fill="var(--color-p-medium)"
            class="group-hover:fill-[var(--color-p-light)] transition-colors"
          /></svg
      ></a>
      <button
        @click="showSearch = true"
        aria-label="Search"
        class="flex-1 mx-4"
      >
        <div
          class="flex items-center w-full bg-p-soft/20 rounded-full px-5 py-2 shadow-sm transition-all font-sans hover:bg-p-soft/40"
        >
          <svg
            class="w-5 h-5 text-p-medium mr-2"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-4.35-4.35"
            />
          </svg>
          <span class="text-p-medium/60 text-sm">Cerca tour, musei…</span>
        </div>
      </button>
    </nav>

    <!-- Search Overlay -->
    <transition name="fade">
      <div
        v-if="showSearch"
        class="fixed inset-0 z-50 bg-p-dark/50 backdrop-blur-sm flex items-end"
        @click.self="showSearch = false"
      >
        <div
          class="w-full bg-white rounded-t-2xl border border-p-soft shadow-2xl p-8"
        >
          <div class="flex items-center justify-between mb-6">
            <div class="font-bold text-2xl text-p-dark font-serif">Cerca</div>
            <button @click="showSearch = false" class="nav-icon-link">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <input
            type="text"
            v-model="search"
            class="input input-bordered rounded-full w-full border-p-soft bg-white text-p-dark placeholder-p-medium focus:border-p-medium focus:ring-2 focus:ring-p-soft focus:outline-none font-sans font-normal shadow-sm px-6 py-3 mb-3 text-lg"
            placeholder="Cerca tra tour e musei…"
            @input="onSearchInput"
          />
          <div v-if="search" class="mt-4">
            <div class="text-sm text-p-medium/60 mb-2 font-sans">Risultati</div>
            <ul class="font-sans" style="overflow: auto">
              <li
                v-for="item in searchResults"
                :key="item._id"
                class="py-2 border-b border-p-soft/30 last:border-b-0 cursor-pointer"
                @click="goToSearchResult(item)"
              >
                <span class="text-p-dark font-semibold">{{ item.name }}</span>
                <span class="text-p-medium/80 text-xs block">{{
                  item.type
                }}</span>
              </li>
              <li v-if="!searchResults.length" class="text-p-medium/50 py-2">
                Nessun risultato trovato.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition>

    <!-- Tour Start Confirmation Overlay -->
    <transition name="fade">
      <div
        v-if="showTourConfirmOverlay"
        class="fixed inset-0 z-50 bg-p-dark/40 backdrop-blur-sm flex items-end"
        @click.self="closeTourConfirm"
      >
        <div
          class="w-full bg-white rounded-t-2xl border border-p-soft shadow-2xl p-8"
        >
          <div class="flex items-center justify-between mb-6">
            <div class="font-bold text-2xl text-p-dark font-serif">
              Avvia tour?
            </div>
            <button @click="closeTourConfirm" class="nav-icon-link">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="mb-6">
            <div class="font-bold text-lg text-p-dark font-serif mb-1">
              {{ selectedTour?.name }}
            </div>
            <div class="text-p-medium text-base font-sans mb-2">
              Sei sicuro di voler iniziare questo tour?
            </div>
          </div>
          <div class="flex gap-4">
            <button
              class="shared-button-full-primary flex-1 font-sans"
              @click="confirmStartTour"
            >
              Ok
            </button>
            <button
              class="shared-button-full-secondary flex-1 font-sans"
              @click="closeTourConfirm"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'

// State (Reactive Variables)
const museums = ref([])
const showSearch = ref(false)
const search = ref('')
const user = reactive({
  name: '',
  email: '',
  avatar: '',
  initials: '',
})
const authors = reactive({})
const showTourConfirmOverlay = ref(false)
const selectedTour = ref(null)
const allTours = ref([])
const allMuseums = ref([])
const searchResults = ref([])
const itemsMeta = ref({})
const itemsByTour = ref({})

// Methods
const onMore = (museum) => {
  window.location.href = `/navigator/museum/${museum._id}`
}

const goToSearchResult = (item) => {
  if (item.type === 'Museo') {
    window.location.href = `/navigator/museum/${item._id}`
  } else {
    showTourConfirm(item._tourObj || item)
  }
}

const getAuthorName = (authorId) => {
  if (!authorId) return ''
  return authors[authorId] || ''
}

const fetchAuthor = async (authorId) => {
  if (!authorId || authors[authorId] !== undefined) return
  try {
    const res = await fetch(`/api/users/${authorId}`)
    if (!res.ok) throw new Error('Not found')
    const userData = await res.json()
    authors[authorId] = userData.username || 'Unknown'
  } catch (e) {
    authors[authorId] = 'Unknown'
  }
}

const fetchAllTourItems = async () => {
  let tourIds = []
  itemsByTour.value = {}

  for (const m of museums.value) {
    for (const tour of m.tours || []) {
      if (tour._id) tourIds.push(tour._id)
    }
  }

  const newItemsMeta = {}

  await Promise.all(
    tourIds.map(async (tid) => {
      const res = await fetch(`/api/items?tour=${tid}`)
      if (res.ok) {
        const items = await res.json()
        const itemDetails = await Promise.all(
          items.map(async (imeta) => {
            try {
              const idataRes = await fetch(`/api/items/${imeta._id}`)
              if (idataRes.ok) {
                return await idataRes.json()
              }
            } catch {}
            return null
          }),
        )
        const validDetails = itemDetails.filter(Boolean)
        newItemsMeta[tid] = validDetails
        itemsByTour.value[tid] = validDetails
      }
    }),
  )

  itemsMeta.value = newItemsMeta
}

const fetchMuseumsAndTours = async () => {
  try {
    const museumsRes = await fetch('/api/museums')
    let museumsMeta = await museumsRes.json()

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
    museums.value = allMuseumsFull

    let allToursRes = await fetch('/api/tours')
    let toursData = allToursRes.ok ? await allToursRes.json() : []
    allMuseums.value = museumsMeta
    allTours.value = toursData

    for (const m of museums.value) {
      for (const t of m.tours || []) {
        t._museumName = m.name
        t._tourObj = t
      }
    }

    const authorIds = new Set()
    for (const museum of museums.value) {
      for (const tour of museum.tours || []) {
        if (tour.author) authorIds.add(tour.author)
      }
    }

    await Promise.all(Array.from(authorIds).map((id) => fetchAuthor(id)))

    await fetchAllTourItems()
  } catch (err) {
    museums.value = []
  }
}

const getItemsDuration = (itemIds) => {
  if (!Array.isArray(itemIds) || !itemIds.length) return '--'

  let foundItems = []
  for (const k in itemsByTour.value) {
    const items = itemsByTour.value[k]
    if (Array.isArray(items)) {
      foundItems = foundItems.concat(
        items.filter((itm) => itemIds.includes(itm._id)),
      )
    }
  }

  let totalSec = 0
  for (const itm of foundItems) {
    if (Array.isArray(itm.explanations) && itm.explanations.length) {
      let expl =
        itm.explanations.find((e) => e.level === 'normal') ||
        itm.explanations[0]
      if (expl && typeof expl.durationSeconds === 'number')
        totalSec += expl.durationSeconds
    }
  }

  return Math.round(totalSec / 60) || '--'
}

const showTourConfirm = (tour) => {
  selectedTour.value = tour
  showTourConfirmOverlay.value = true
}

const closeTourConfirm = () => {
  showTourConfirmOverlay.value = false
  selectedTour.value = null
}

const confirmStartTour = () => {
  if (selectedTour.value && selectedTour.value._id) {
    window.location.href = `/navigator/${selectedTour.value._id}`
  }
}

const checkLoggedIn = async () => {
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

const openProfile = () => {
  window.location.href = '/profile'
}

const onSearchInput = async () => {
  const searchTerm = search.value.trim().toLowerCase()
  if (!searchTerm) {
    searchResults.value = []
    return
  }

  let results = []

  for (const m of museums.value) {
    if (m.name && m.name.toLowerCase().includes(searchTerm)) {
      results.push({ _id: m._id, name: m.name, type: 'Museo' })
    }
  }

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

// Watchers
watch(
  museums,
  (newMuseums) => {
    const authorIds = new Set()
    for (const museum of newMuseums) {
      for (const tour of museum.tours || []) {
        if (tour.author && authors[tour.author] === undefined) {
          authorIds.add(tour.author)
        }
      }
    }
    if (authorIds.size > 0) {
      Promise.all(Array.from(authorIds).map((id) => fetchAuthor(id)))
    }
  },
  { deep: true },
)

// Lifecycle Hook
onMounted(async () => {
  const loggedIn = await checkLoggedIn()
  if (!loggedIn) return
  await fetchMuseumsAndTours()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
