import Alpine from 'alpinejs'
import './userManager.js'
import './quick-nav.js'

document.addEventListener('alpine:init', () => {
  Alpine.data('editorState', () => ({
    // NAVIGATION
    tour: null,
    items: [],
    currentItem: null,
    currentItemIdx: -1,
    ghostIdx: 2,
    currentItemId: null,
    anchorItemId: null,
    itd: 4, // items to display

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
          return tour
        })
        .then((tour) =>
          fetch(`/api/items?${new URLSearchParams({ tour: tour._id })}`),
        )
        .then((res) => res.json())
        .then((items) => {
          console.log('List loaded items: ', items)
          this.items = items
        })
        .catch((e) => console.log('Error ', e))
      // HACK: pretend items as itemNav
      this.currentItemIdx = this.items.findIndex(
        (entry) => entry._id === itemId,
      )
      this.currentItem = await this.loadItem(itemId)
    },

    async loadItem(id) {
      // this.anchorItemId = this.currentItemId
      this.currentItemId = null
      this.currentItem = null
      let idx = this.items.findIndex((i) => i._id === id)
      this.currentItemIdx = idx != -1 ? idx : this.currentItemIdx
      return await fetch('/api/items/' + id)
        .then((r) => {
          if (r.ok) return r.json()
          else throw new Error('Failed loading item')
        })
        .then((item) => {
          this.currentItemId = id
          this.currentItem = item
          this.populateFormData()
        })
    },

    // lazy load item
    // TODO: check if this is used
    async getItem() {
      if (this.currentItem) return this.currentItem
      if (this.currentItemId) {
        return this.loadItem(this.currentItemId)
      }
      //  else if (this.currentItemId) {
      // }
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
      console.log('Data loaded: ', this.formData)
    },
    submitForm() {
      console.log('Subimitting: ', this.formData)
      this.isSubmitting = true
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

    doView(id) {
      let idx = this.items.findIndex((i) => i._id === id)
      const ghostIdx = this.ghostIdx
      const itd = this.itd
      const cap = this.items.length - 1
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

    dragging: false,
    draggingIdx: null,
    overIdx: null,

    get someItems() {
      return this.items ? this.items : [{ _id: 'id', label: 'loading' }]
    },
    onDragStart(idx) {
      this.dragging = true
      this.draggingIdx = idx
      this.overIdx = null
    },
    onDragEnd() {
      this.dragging = false
      this.draggingIdx = null
      this.overIdx = null
    },
    onDragOver(idx, _event) {
      if (this.dragging && this.draggingIdx !== idx) {
        this.overIdx = idx
      }
    },
    onDragLeave(idx) {
      if (this.overIdx === idx) {
        this.overIdx = null
      }
    },
    onDrop(idx, event) {
      if (
        this.dragging &&
        this.draggingIdx !== null &&
        this.draggingIdx !== idx
      ) {
        const moved = this.items.splice(this.draggingIdx, 1)[0]
        let insertIdx = idx
        // Place after if cursor is below halfway point
        const targetRect = event.target.getBoundingClientRect()
        if (event.clientY > targetRect.top + targetRect.height / 2) {
          insertIdx++
        }
        if (insertIdx > this.items.length) insertIdx = this.items.length
        this.items.splice(insertIdx > idx ? insertIdx - 1 : insertIdx, 0, moved)
        this.draggingIdx = null
        this.overIdx = null
        this.dragging = false
      }
    },
  }))
})

window.Alpine = Alpine
Alpine.start()
