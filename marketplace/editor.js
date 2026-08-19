import Alpine from 'alpinejs'
import './userManager.js'
import './quick-nav.js'
import { ItemNavigator } from './itemNavigator.js'

document.addEventListener('alpine:init', () => {
  Alpine.data('editorState', () => ({
    nav: null,
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
      this.nav = new ItemNavigator()
      this.nav
        .init(tourId, itemId)
        .then((i) => console.log('item: ', i.item))
        .then(() => this.populateFormData())
    },
    populateFormData() {
      this.formData = {
        _id: this.nav?.item?._id || null,
        name: this.nav?.item?.name || '',
        tour: this.nav?.item?.tour || '',
        license: this.nav?.item?.license || '',
        explanations:
          Array.isArray(this.nav?.item?.explanations) &&
          this.nav.item.explanations.length > 0
            ? [
                {
                  level: this.nav.item.explanations[0]?.level || '',
                  text: this.nav.item.explanations[0]?.text || '',
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
  }))
})

window.Alpine = Alpine
Alpine.start()
