import Alpine from 'alpinejs'
import './userManager.js'
import './quick-nav.js'

document.addEventListener('alpine:init', () => {
  Alpine.data('editorState', () => ({
    // NAVIGATION
    tour: null,
    items: [],
    itemNav: [],
    itemsCache: [],
    stash: [],
    currentItem: null,
    currentItemIdx: -1,
    ghostIdx: 2,
    currentItemId: null,
    anchorItemId: null,
    itd: 4, // items to display

    // Drag and drop state
    dragging: false,
    draggingIdx: null,
    draggingBoard: null, // "items" or "stash"
    overIdx: null,
    overBoard: null, // target board during dragover

    // FORM
    submitting: false, // TODO: suspend input and show loading icon
    formData: {
      _id: null,
      name: '',
      tour: '',
      license: '',
      explanations: [{ level: '', text: '', duration: 0 }],
    },

    async init() {
      let metaNav = []
      Alpine.store('userManager')
        .getUser()
        .then((u) => (this.user = u))
      const url = new URL(window.location.href)
      const tourId = url.pathname.split('/').filter(Boolean).at(2)
      const itemId = url.searchParams.get('item')

      await fetch('/api/tours/' + tourId)
        .then((r) => {
          if (r.ok) {
            return r.json()
          } else throw new Error('Tour not found')
        })
        .then((tour) => {
          this.tour = tour
          console.log(tour)
          metaNav = tour.itemNav
          return tour
        })
        .then((tour) =>
          fetch(`/api/items?${new URLSearchParams({ tour: tour._id })}`),
        )
        .then((res) => res.json())
        .then((items) => {
          this.items = items
          this.itemNav = metaNav
            .map((id) => items.find((item) => item._id === id))
            .filter(Boolean)
        })
        .catch((e) => console.log('Error ', e))
      this.currentItemIdx = this.itemNav.findIndex((i) => i._id === itemId)
      await this.loadItem(itemId)
    },

    populateFormData() {
      this.formData = {
        _id: this.currentItem?._id || null,
        name: this.currentItem?.name || '',
        tour: this.currentItem?.tour || '',
        license: this.currentItem?.license || '',
        explanations:
          Array.isArray(this.currentItem?.explanations) &&
          this.currentItem.explanations.length > 0
            ? [
                {
                  level: this.currentItem?.explanations[0]?.level || '',
                  text: this.currentItem?.explanations[0]?.text || '',
                  duration: 0, // HACK:TODO: implement
                },
              ]
            : [
                {
                  level: '',
                  text: '',
                  duration: 0, // HACK:TODO: implement
                },
              ],
      }
    },
    submitForm() {
      this.isSubmitting = true
      // invalidate cache
      if (this.formData._id) {
        let idx = this.itemsCache.findIndex((i) => i._id === this.formData._id)
        this.itemsCache.splice(idx, idx == -1 ? 0 : 1)
      }
      fetch('/api/items/' + this.formData._id, {
        method: this.formData._id ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.formData),
      })
        .then(async (response) => {
          this.isSubmitting = false
          if (response.ok) {
            // TODO: show success or reload/navigate
            // location.reload();
            // or: this.$dispatch('item-updated', await response.json());
            // https://alpinejs.dev/magics/dispatch
            alert('Modifiche salvate con successo.')
          } else {
            const err = await response.json().catch(() => ({}))
            alert('Errore nel salvataggio: ', err.error.message)
          }
        })
        .catch((error) => {
          this.isSubmitting = false
          alert('Errore di rete: ' + error.message)
        })
    },

    // Boards configuration
    boards() {
      return [
        {
          name: 'items',
          title: 'Items',
          arr: this.itemNav,
          controls: true,
        },
        {
          name: 'stash',
          title: 'Stash',
          arr: this.stash,
          controls: false,
        },
      ]
    },

    async saveItemNav() {
      let patch = {
        itemNav: this.itemNav.map((item) => item._id),
        items: Array.from(new Set([...this.items, ...this.stash])).map(
          (i) => i._id,
        ),
      }
      fetch('/api/tours/' + this.tour._id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patch),
      })
        .then(async (response) => {
          this.isSubmitting = false
          if (response.ok) {
            // TODO: show success or reload/navigate
            // location.reload();
            // or: this.$dispatch('item-updated', await response.json());
            // https://alpinejs.dev/magics/dispatch
            alert('Modifiche salvate con successo.')
          } else {
            const err = await response.json().catch(() => ({}))
            alert('Errore nel salvataggio: ', err.error.message)
          }
        })
        .catch((error) => {
          this.isSubmitting = false
          alert('Errore di rete: ' + error.message)
        })
    },

    // Determine if given id should display in items list pager window
    doView(id) {
      let idx = this.itemNav.findIndex((i) => i._id === id)
      const ghostIdx = this.ghostIdx
      const itd = this.itd
      const cap = this.itemNav.length - 1
      if (ghostIdx <= 1) {
        return idx >= 0 && idx <= itd - 1
      }
      if (ghostIdx >= cap - 2) {
        return idx >= cap - 3 && idx <= cap
      }
      return (
        Math.abs(idx - ghostIdx) <= 2 &&
        idx >= ghostIdx - 2 &&
        idx <= ghostIdx + 1
      )
    },

    // List controls (UP/DOWN/RESET) only on "items"
    upItems() {
      if (this.ghostIdx > this.itd / 2) this.ghostIdx--
    },
    downItems() {
      if (this.ghostIdx < this.itemNav.length - 3) this.ghostIdx++
    },
    resetItems() {
      this.ghostIdx = this.currentItemIdx
    },

    // Radio/load logic unified
    async loadItem(id) {
      this.currentItemId = null
      this.currentItem = null
      let idx = this.itemNav.findIndex((i) => i._id === id)
      if (idx !== -1) {
        this.currentItemIdx = idx
      }
      let cacheIdx = this.itemsCache.findIndex((i) => i._id === id)
      if (cacheIdx === -1) {
        await fetch('/api/items/' + id)
          .then((r) => {
            if (r.ok) return r.json()
            else throw new Error('Failed loading item')
          })
          .then((item) => {
            this.currentItemId = id
            this.currentItem = item
            this.populateFormData()
            this.itemsCache.push(item)
          })
      } else {
        this.currentItemId = id
        this.currentItem = this.itemsCache.at(cacheIdx)
        this.populateFormData()
      }
    },

    // Generalized Drag/Drop Handlers

    onDragStart(board, idx) {
      this.dragging = true
      this.draggingIdx = idx
      this.draggingBoard = board
      this.overIdx = null
      this.overBoard = null
    },

    onDragEnd() {
      this.dragging = false
      this.draggingIdx = null
      this.draggingBoard = null
      this.overIdx = null
      this.overBoard = null
    },

    onDragOver(board, idx, _event) {
      if (
        this.dragging &&
        (this.draggingBoard !== board || this.draggingIdx !== idx)
      ) {
        this.overIdx = idx
        this.overBoard = board
      }
    },

    onDragLeave(board, idx) {
      if (this.overBoard === board && this.overIdx === idx) {
        this.overIdx = null
        this.overBoard = null
      }
    },

    // board is "items" or "stash". idx is drop index, event is drag/drop event
    onDrop(board, idx, event) {
      if (
        !this.dragging ||
        this.draggingIdx === null ||
        this.draggingBoard === null
      )
        return
      if (this.draggingBoard === board && this.draggingIdx === idx) return
      // Defensive: get source/target arrays
      const sources = { items: this.itemNav, stash: this.stash }
      let sourceArr = sources[this.draggingBoard]
      let targetArr = sources[board]

      // Pop source
      const moved = sourceArr.splice(this.draggingIdx, 1)[0]
      let insertIdx = idx
      // Place after if cursor is below halfway point
      const targetRect = event.target.getBoundingClientRect()
      if (event.clientY > targetRect.top + targetRect.height / 2) {
        insertIdx++
      }
      if (insertIdx > targetArr.length) insertIdx = targetArr.length
      targetArr.splice(insertIdx > idx ? insertIdx - 1 : insertIdx, 0, moved)
      console.log(sourceArr, targetArr, this.itemNav, this.stash)
      // Reset drag state
      this.dragging = false
      this.draggingIdx = null
      this.draggingBoard = null
      this.overIdx = null
      this.overBoard = null
    },

    // Drop into empty board
    onDropEmpty(board, _event) {
      if (
        !this.dragging ||
        this.draggingIdx === null ||
        this.draggingBoard === null
      )
        return
      const sources = { items: this.itemNav, stash: this.stash }
      let sourceArr = sources[this.draggingBoard]
      let targetArr = sources[board]
      const moved = sourceArr.splice(this.draggingIdx, 1)[0]
      targetArr.push(moved)
      this.dragging = false
      this.draggingIdx = null
      this.draggingBoard = null
      this.overIdx = null
      this.overBoard = null
    },

    // Utility for repeat rendering
    isDragging(board, idx) {
      return (
        this.dragging &&
        this.draggingBoard === board &&
        this.draggingIdx === idx
      )
    },
    isOver(board, idx) {
      return (
        this.overBoard === board &&
        this.overIdx === idx &&
        this.dragging &&
        !(this.draggingBoard === board && this.draggingIdx === idx)
      )
    },
  }))
})

window.Alpine = Alpine
Alpine.start()
