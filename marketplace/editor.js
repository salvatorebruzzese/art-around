import { TourNavigation } from './tourNav'
import Alpine from 'alpinejs'

import './userManager.js'
import './quick-nav.js'

document.addEventListener('alpine:init', () => {
  Alpine.data(
    'editorState',
    () =>
      new (class extends TourNavigation {
        async init() {
          try {
            await super.initByURL()
          } catch (e) {
            console.log('Err by URL', e)
          }
        }
      })(),
  )
})

window.Alpine = Alpine
Alpine.start()
