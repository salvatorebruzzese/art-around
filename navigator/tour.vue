<template>
  <div
    class="h-dvh flex flex-col justify-between bg-p-light font-serif text-p-dark selection:bg-p-soft overflow-hidden"
  >
    <!-- Scrollable Main Viewport (Top Half: Detail / Map) -->
    <main class="flex-1 min-h-0 overflow-y-auto w-full md:pt-6">
      <!-- Detail View -->
      <div
        v-if="!isMapView"
        class="mx-auto grid w-full max-w-4xl grid-cols-1 md:rounded-3xl md:grid-cols-2 gap-6 bg-p-light rounded-2xl shadow-lg shadow-p-soft p-6 mb-4"
      >
        <!-- Image Container -->
        <figure
          class="w-full max-h-[250px] aspect-square rounded-2xl overflow-hidden justify-self-center self-center"
        >
          <img
            v-if="currentItem && currentItem.image"
            :src="`/api/assets/${currentItem.image}`"
            alt="Item image"
            class="object-cover w-full h-full"
          />
          <img
            v-else
            src="https://dummyimage.com/900x675/efefef/a3a3a3.png&text=Item"
            class="object-cover w-full h-full"
            alt="Item placeholder"
          />
        </figure>

        <!-- Item Info -->
        <div class="flex flex-col justify-start md:justify-center gap-4 h-full">
          <h1 class="font-serif text-2xl text-p-medium font-bold">
            {{ currentItem ? currentItem.name : '--' }}
          </h1>

          <div v-if="explanations && explanations.length > 1" class="w-full">
            <label
              class="font-semibold mb-2 text-base text-p-medium font-sans block"
            >
              Livello spiegazione
            </label>
            <div class="flex flex-row gap-4">
              <button
                v-for="(ex, idx) in explanations"
                :key="ex.level || idx"
                type="button"
                @click="selectedExplanationIdx = idx"
                class="shared-button-flex-secondary shadow-sm shadow-p-soft cursor-pointer transition-colors"
                :class="{
                  '!bg-p-soft !shadow-none': selectedExplanationIdx === idx,
                }"
              >
                {{ getLevelLabel(ex.level) }}
              </button>
            </div>
          </div>
          <div class="flex flex-col">
            <div v-if="explanations && explanations.length" class="my-4">
              <div>
                <div
                  class="text-p-medium font-semibold font-sans mb-1 capitalize"
                >
                  {{ getLevelLabel(selectedExplanation.level) }}
                  <span
                    v-if="selectedExplanation.durationSeconds"
                    class="text-p-medium/50 font-sans text-sm ml-2"
                  >
                    ({{ formatDuration(selectedExplanation.durationSeconds) }})
                  </span>
                </div>
                <div class="text-lg font-serif text-p-dark leading-relaxed">
                  {{ selectedExplanation.text }}
                </div>
              </div>
            </div>
            <!-- Fallback description if no explanations -->
            <div
              v-else-if="currentItem && currentItem.description"
              class="text-lg font-serif text-p-dark leading-relaxed my-4"
            >
              {{
                Array.isArray(currentItem.description)
                  ? currentItem.description[0]
                  : currentItem.description
              }}
            </div>
            <div v-else class="text-p-medium/40 font-sans my-12">
              Nessuna descrizione disponibile.
            </div>
          </div>
        </div>
      </div>

      <!-- Map View -->
      <div
        v-else
        class="mx-auto grid w-full max-w-4xl grid-cols-1 md:rounded-3xl md:grid-cols-2 gap-6 bg-p-light rounded-2xl shadow-lg shadow-p-soft p-6 mb-4"
      >
        <div class="text-center">
          <h2 class="text-2xl font-bold text-p-medium">Mappa del Museo</h2>
          <p class="text-p-dark mt-2">Visualizzazione del percorso</p>
        </div>
      </div>
    </main>

    <!-- Bottom Dock: Navigation & Voice Buttons -->
    <footer
      class="flex-shrink-0 w-full max-w-4xl mx-auto flex flex-col gap-4 items-center px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <!-- Top Layer: Move Buttons -->
      <div
        v-if="!isMapView"
        class="flex items-center justify-center gap-4 w-full"
      >
        <!-- Previous Button -->
        <button
          v-if="!isGuided && canGoPrev"
          @click="goPrev"
          aria-label="Item precedente"
          class="shared-button-flex-secondary rounded-md w-16 h-16 shadow-lg border border-p-soft hover:border-transparent flex items-center justify-center"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <!-- Next Button -->
        <button
          v-if="!isGuided && canGoNext"
          @click="goNext"
          aria-label="Item successivo"
          class="shared-button-flex-secondary rounded-md w-16 h-16 shadow-lg border border-p-soft hover:border-transparent flex items-center justify-center"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <!-- Bottom Layer: Home, Voice, Map Buttons -->
      <div class="flex items-center justify-center gap-4">
        <!-- Navigator Button -->
        <a
          href="/navigator"
          class="shared-button-flex-secondary rounded-full w-12 h-12 shadow-md border border-p-soft hover:border-transparent flex items-center justify-center text-p-medium hover:text-p-light hover:bg-p-medium transition-colors duration-100 ease-out"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 48 48"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            class="pointer-events-none"
          >
            <!-- Il path eredita currentColor istantaneamente o tramite la transizione del wrapper -->
            <path
              d="M24 8 A16 16 0 1 0 24 40 A16 16 0 0 0 24 8 Z M24 12 A12 12 0 1 1 24 36 A12 12 0 0 1 24 12 Z M18 30 L22 20 L32 16 L28 26 L18 30 Z M25.5 23.5 A1.5 1.5 0 1 0 25.5 20.5 A1.5 1.5 0 0 0 25.5 23.5 Z"
            />
          </svg>
        </a>

        <!-- Voice Button -->
        <button
          class="shared-button-flex-primary rounded-full w-20 h-20 shadow-xl border border-p-soft hover:border-transparent flex items-center justify-center"
        >
          <svg
            width="36"
            height="32"
            viewBox="0 0 32 32"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M1 16c0-2 1-4 3-4s3 2 3 4v4c0 2-1 4-3 4s-3-2-3-4v-4z" />
            <path d="M13 10c0-2 1-4 3-4s3 2 3 4v12c0 2-1 4-3 4s-3-2-3-4v-12z" />
            <path d="M25 16c0-2 1-4 3-4s3 2 3 4v4c0 2-1 4-3 4s-3-2-3-4v-4z" />
          </svg>
        </button>

        <!-- Map Button -->
        <button
          @click="isMapView = !isMapView"
          class="shared-button-flex-secondary rounded-full w-12 h-12 shadow-md border border-p-soft hover:border-transparent flex items-center justify-center"
          :class="{ 'bg-p-soft': isMapView }"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
        </button>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref } from 'vue'
import { TourNavigation } from '../marketplace/tourNav.js'

class TourController {
  constructor({ itemNav = [], onChange = null } = {}) {
    this.itemNav = Array.isArray(itemNav) ? itemNav.slice() : []
    this.curItemIdx = 0
    this.detachedStack = []
    this.onChange = onChange
  }

  setItemNav(itemNav) {
    this.itemNav = Array.isArray(itemNav) ? itemNav.slice() : []
    this.curItemIdx = 0
    this.detachedStack = []
    this.emit()
  }

  getCurrentItemId() {
    if (this.detachedStack.length > 0) {
      return this.detachedStack[this.detachedStack.length - 1]
    }
    return this.itemNav[this.curItemIdx] || null
  }

  emit() {
    if (typeof this.onChange === 'function') {
      this.onChange({
        curItemIdx: this.curItemIdx,
        detachedStack: this.detachedStack.slice(),
      })
    }
  }

  goPrev() {
    if (this.curItemIdx > 0) {
      this.curItemIdx--
      this.emit()
    }
  }

  goNext() {
    if (this.curItemIdx < this.itemNav.length - 1) {
      this.curItemIdx++
      this.emit()
    }
  }

  openRefItem(itemId) {
    if (!itemId) return
    const navIdx = this.itemNav.findIndex((x) => x === itemId)
    if (navIdx !== -1) {
      this.curItemIdx = navIdx
      this.detachedStack = []
    } else {
      this.detachedStack.push(itemId)
    }
    this.emit()
  }

  returnToNav() {
    if (!this.detachedStack.length) return
    this.detachedStack.pop()
    this.emit()
  }

  teardown() {}
}

class LibreTourController extends TourController {
  constructor({ onShowItem, ...opts } = {}) {
    super(opts)
    this.onShowItem = onShowItem
  }

  emit() {
    super.emit()
    const currentItemId = this.getCurrentItemId()
    if (currentItemId && typeof this.onShowItem === 'function') {
      this.onShowItem(currentItemId)
    }
  }
}

class GuidedTourController extends TourController {
  constructor({ sessionId, username, ...opts } = {}) {
    super(opts)
    this.sessionId = sessionId
    this.username = username
    this.eventSource = null
  }

  connect() {
    if (!this.sessionId || typeof window === 'undefined') return
    const randomSuffix = (() => {
      const cryptoObj = globalThis.crypto
      if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
        return Date.now().toString(36)
      }
      const bytes = new Uint8Array(4)
      cryptoObj.getRandomValues(bytes)
      return Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join('')
    })()
    const username = this.username || `guided-${randomSuffix}`
    const joinUrl = `/api/sessions/${encodeURIComponent(this.sessionId)}/join?username=${encodeURIComponent(username)}`
    this.eventSource = new EventSource(joinUrl)
    this.eventSource.addEventListener('showItem', (event) => {
      try {
        const payload = JSON.parse(event.data || '{}')
        this.showItem(payload.itemId)
      } catch (_err) {
        // ignore malformed events
      }
    })
  }

  showItem(itemId) {
    if (!itemId) return
    const navIdx = this.itemNav.findIndex((x) => x === itemId)
    if (navIdx !== -1) {
      this.curItemIdx = navIdx
      this.detachedStack = []
    } else {
      this.detachedStack = [itemId]
    }
    this.emit()
  }

  goPrev() {}
  goNext() {}
  openRefItem() {}
  returnToNav() {}

  teardown() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }
}

export default {
  name: 'TourNavigationMobile',
  data() {
    return {
      tourId: '',
      tour: null,
      itemNav: [],
      items: [],
      curItemIdx: 0,
      detachedStack: [],
      refsItems: [],
      bottomOverlay: false,
      audioPlaying: false,
      audioRate: 1,
      touch0: null,
      openTouch0: null,
      loadedItemsMap: {},
      overlayVisible: ref(false),
      isMapView: ref(false),
      audioMuted: false,
      audioVolume: 1,
      selectedExplanationIdx: 0,
      userSelectedLevel: null,
      controller: null,
      controllerMode: 'libre',
      sessionId: '',
      sessionUsername: '',
      lastBroadcastItemId: null,
    }
  },
  computed: {
    isGuided() {
      return this.controllerMode === 'guided'
    },
    currentItem() {
      const idxObj = this.getCurrentIdxObj()
      if (!idxObj) return null
      return this.items.find((i) => i._id === idxObj)
    },
    canGoPrev() {
      return this.detachedStack.length === 0 && this.curItemIdx > 0
    },
    canGoNext() {
      return (
        this.detachedStack.length === 0 &&
        this.curItemIdx < this.itemNav.length - 1
      )
    },
    explanations() {
      if (
        this.currentItem &&
        Array.isArray(this.currentItem.explanations) &&
        this.currentItem.explanations.length > 0
      ) {
        return this.currentItem.explanations.filter(
          (ex) =>
            ex &&
            typeof ex === 'object' &&
            typeof ex.text === 'string' &&
            ex.text.trim().length > 0,
        )
      }
      return []
    },
    selectedExplanation() {
      // returns the currently selected explanation, fallback to first
      const exps = this.explanations
      if (!exps.length) return {}
      return exps[this.selectedExplanationIdx] || exps[0]
    },
  },
  watch: {
    currentItem: {
      handler(newVal) {
        if (newVal && Array.isArray(newVal.refs)) {
          const refs = newVal.refs
            .filter((refId) => refId !== undefined && refId !== null)
            .filter((refId) => this.items.some((i) => i._id === refId))
          this.refsItems = refs
            .map((refId) => this.items.find((i) => i._id === refId))
            .filter(Boolean)
        } else {
          this.refsItems = []
        }
        this.stopAudio()
        // select explanation index based on cached level if possible, else fallback
        this.setBestExplanationIdx()
      },
      immediate: true,
    },
    explanations(newList, oldList) {
      this.setBestExplanationIdx()
    },
    audioMuted(muted) {
      this.syncAudioProps()
    },
    audioRate(rate) {
      this.syncAudioProps()
    },
    bottomOverlay(val) {
      if (!val) this.syncAudioProps()
    },
  },
  created() {
    this.initTour()
    // Restore cached audioRate if present, else set default
    if (typeof window !== 'undefined') {
      const cachedRate = localStorage.getItem('audioRate')
      const r = parseFloat(cachedRate)
      if (!isNaN(r) && [0.75, 1, 1.25, 1.5, 2].includes(r)) {
        this.audioRate = r
      } else {
        this.audioRate = 1
      }
    } else {
      this.audioRate = 1
    }
  },
  methods: {
    resolveTourSettings() {
      let tourId = ''
      let mode = 'libre'
      let sessionId = ''
      let username = ''
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        tourId = url.pathname.split('/').filter(Boolean).at(1)

        const urlParams = new URLSearchParams(window.location.search)
        mode = urlParams.get('mode') === 'guided' ? 'guided' : 'libre'
        sessionId = urlParams.get('session') || urlParams.get('sessionId') || ''
        username = urlParams.get('username') || ''
      }
      if (!tourId) {
        tourId =
          this.$route?.params?.id || this.$route?.query?.tour || 'demo-tour'
      }
      return { tourId, mode, sessionId, username }
    },
    applyControllerState(state) {
      this.curItemIdx = state.curItemIdx
      this.detachedStack = state.detachedStack
    },
    setupController() {
      if (this.controller) {
        this.controller.teardown()
      }
      const common = {
        itemNav: this.itemNav,
        onChange: this.applyControllerState,
      }
      if (this.controllerMode === 'guided' && this.sessionId) {
        this.controller = new GuidedTourController({
          ...common,
          sessionId: this.sessionId,
          username: this.sessionUsername,
        })
        this.controller.connect()
      } else {
        this.controllerMode = 'libre'
        this.controller = new LibreTourController({
          ...common,
          onShowItem: (itemId) => this.broadcastShowItem(itemId),
        })
      }
      this.controller.setItemNav(this.itemNav)
    },
    async broadcastShowItem(itemId) {
      if (
        !itemId ||
        !this.sessionId ||
        this.controllerMode !== 'libre' ||
        this.lastBroadcastItemId === itemId
      ) {
        return
      }
      this.lastBroadcastItemId = itemId
      try {
        await fetch(
          `/api/sessions/${encodeURIComponent(this.sessionId)}/showItem`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ itemId }),
          },
        )
      } catch (_e) {
        // best effort sync for guided listeners
      }
    },
    async initTour() {
      const settings = this.resolveTourSettings()
      this.tourId = settings.tourId
      this.controllerMode = settings.mode
      this.sessionId = settings.sessionId
      this.sessionUsername = settings.username
      this.lastBroadcastItemId = null
      try {
        const nav = new TourNavigation()
        await nav.initialize(this.tourId, null)
        this.tour = nav.tour
        this.itemNav = Array.isArray(this.tour.itemNav)
          ? this.tour.itemNav.slice()
          : []
        let allItemIds = new Set()
        this.loadedItemsMap = {}
        const fetchedItems =
          nav.items && typeof nav.items === 'object' ? nav.items : {}
        Object.entries(fetchedItems).forEach(([id, item]) => {
          if (id && item) {
            allItemIds.add(id)
            this.loadedItemsMap[id] = item
          }
        })
        if (Array.isArray(this.itemNav)) {
          this.itemNav.forEach(
            (id) => typeof id === 'string' && allItemIds.add(id),
          )
        }
        if (Array.isArray(this.tour.items)) {
          this.tour.items.forEach(
            (id) => typeof id === 'string' && allItemIds.add(id),
          )
        }
        await this.fetchItemIdsRecursive(Array.from(allItemIds))
        const itemsArr = Array.from(allItemIds)
          .map((id) => this.loadedItemsMap[id])
          .filter(Boolean)
        this.items = itemsArr
        this.curItemIdx = 0
        this.detachedStack = []
        this.setupController()
      } catch (e) {
        if (this.controller) this.controller.teardown()
        this.controller = null
        this.tour = null
        this.items = []
        this.itemNav = []
        this.loadedItemsMap = {}
      }
    },
    async fetchItemIdsRecursive(ids) {
      const toFetch = ids.filter((id) => id && !this.loadedItemsMap[id])
      const fetches = toFetch.map(async (id) => {
        try {
          const res = await fetch(`/api/items/${id}`)
          if (!res.ok) return null
          const item = await res.json()
          this.loadedItemsMap[id] = item
          return item
        } catch (e) {
          this.loadedItemsMap[id] = null
          return null
        }
      })
      const itemsObjs = await Promise.all(fetches)
      let refsToFetch = []
      for (const item of itemsObjs) {
        if (item && Array.isArray(item.refs)) {
          for (let refId of item.refs) {
            if (refId && !this.loadedItemsMap[refId]) {
              refsToFetch.push(refId)
            }
          }
        }
      }
      refsToFetch = [...new Set(refsToFetch)]
      if (refsToFetch.length > 0) {
        await this.fetchItemIdsRecursive(refsToFetch)
      }
    },
    getCurrentIdxObj() {
      if (this.detachedStack.length > 0) {
        return this.detachedStack[this.detachedStack.length - 1]
      } else if (this.itemNav && this.itemNav[this.curItemIdx]) {
        return this.itemNav[this.curItemIdx]
      }
      return null
    },
    goPrev() {
      if (this.controller) this.controller.goPrev()
    },
    goNext() {
      if (this.controller) this.controller.goNext()
    },
    openRefItem(itemId) {
      if (this.controller) this.controller.openRefItem(itemId)
    },
    returnToNav() {
      if (this.controller) this.controller.returnToNav()
    },
    togglePlay() {
      if (!this.currentItem || !this.currentItem.audio) return
      const audioEl = this.$refs.audioEl
      if (!audioEl) return
      if (this.audioPlaying) {
        audioEl.pause()
        this.audioPlaying = false
      } else {
        this.syncAudioProps()
        audioEl.play()
        this.audioPlaying = true
      }
    },
    stopAudio() {
      const audioEl = this.$refs.audioEl
      if (audioEl) {
        audioEl.pause()
        audioEl.currentTime = 0
        this.audioPlaying = false
      }
    },
    toggleMute() {
      this.audioMuted = !this.audioMuted
      this.syncAudioProps()
    },
    syncAudioProps() {
      this.$nextTick(() => {
        const audioEl = this.$refs.audioEl
        if (audioEl) {
          audioEl.muted = this.audioMuted
          audioEl.volume = this.audioVolume
          audioEl.playbackRate = this.audioRate
        }
      })
    },
    onAudioRateChange(rate) {
      this.audioRate = rate
      if (typeof window !== 'undefined') {
        localStorage.setItem('audioRate', rate)
      }
      this.syncAudioProps()
    },
    getLevelLabel(level) {
      if (!level) return 'Descrizione'
      switch (level) {
        case 'simple':
          return 'Semplice'
        case 'normal':
          return 'Normale'
        case 'advanced':
          return 'Avanzata'
        default:
          return level && typeof level === 'string'
            ? level.charAt(0).toUpperCase() + level.slice(1)
            : 'Descrizione'
      }
    },
    formatDuration(seconds) {
      if (typeof seconds !== 'number' || isNaN(seconds)) return ''
      const m = Math.floor(seconds / 60)
      const s = Math.round(seconds % 60)
      return m > 0 ? `${m}m ${s}s` : `${s}s`
    },
    onExplanationIdxChange() {
      // store user-selected level string for later cache
      const exps = this.explanations
      if (!exps.length) {
        this.userSelectedLevel = null
        return
      }
      const idx = this.selectedExplanationIdx
      if (exps[idx] && exps[idx].level) {
        this.userSelectedLevel = exps[idx].level
      } else {
        this.userSelectedLevel = null
      }
    },
    setBestExplanationIdx() {
      // On current item or explanations change, try to select the cached user-selected level if possible.
      const exps = this.explanations
      // If no explanations, reset
      if (!exps.length) {
        this.selectedExplanationIdx = 0
        return
      }
      // If only one, always 0
      if (exps.length === 1) {
        this.selectedExplanationIdx = 0
        return
      }
      // Try to find user preferred level
      if (this.userSelectedLevel) {
        // Try exact match first
        const prefIdx = exps.findIndex(
          (ex) => ex.level === this.userSelectedLevel,
        )
        if (prefIdx !== -1) {
          this.selectedExplanationIdx = prefIdx
          return
        }
        // If not found, try to find the nearest
        const possibleLevels = ['simple', 'normal', 'advanced']
        const userIdx = possibleLevels.indexOf(this.userSelectedLevel)
        // pick the first available in order nearest the userIdx
        let nearestIdx = null
        let nearestDistance = Infinity
        exps.forEach((ex, idx) => {
          const exIdx = possibleLevels.indexOf(ex.level)
          if (exIdx === -1 || userIdx === -1) return
          const dist = Math.abs(exIdx - userIdx)
          if (dist < nearestDistance) {
            nearestDistance = dist
            nearestIdx = idx
          }
        })
        if (nearestIdx !== null) {
          this.selectedExplanationIdx = nearestIdx
          return
        }
        // Fallback: select the first
        this.selectedExplanationIdx = 0
        return
      }
      // No cached level, default to 0
      this.selectedExplanationIdx = 0
    },
  },
  beforeUnmount() {
    if (this.controller) {
      this.controller.teardown()
      this.controller = null
    }
    this.stopAudio()
  },
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.24s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
