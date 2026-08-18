import Alpine from 'alpinejs'

document.addEventListener('alpine:init', () => {
  Alpine.store('userManager', {
    user: null,
    async init() {
      const profile = await fetch('/api/profile/')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)

      if (profile) {
        this.user = await fetch(`/api/users/${profile._id}`)
          .then((r) => r.json())
          .catch((e) => console.log(e)) // TODO: better err handl.
      }
    },
  })
  Alpine.store('userManager').init()
})
