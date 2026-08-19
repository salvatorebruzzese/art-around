import Alpine from 'alpinejs'
import './userManager.js'
import './quick-nav.js'

document.addEventListener('alpine:init', () => {
  Alpine.data('editorState', () => ({
    user: null,
    async init() {
      console.log('Initializing editorState')
      this.user = await Alpine.store('userManager').getUser()
      console.log('Initialized editorState')
    },
  }))
})

window.Alpine = Alpine
Alpine.start()
