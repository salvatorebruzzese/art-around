import Alpine from 'alpinejs'

document.addEventListener('alpine:init', () => {
  Alpine.store('userManager', {
    _user: null,
    _userPromise: null,
    async init() {
      if (!this._userPromise) {
        this._userPromise = (async () => {
          console.log('Initalizing User manager')
          const profile = await fetch('/api/profile/')
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
          if (profile) {
            this._user = await fetch(`/api/users/${profile._id}`)
              .then((r) => r.json())
              .catch((e) => console.log(e)) // TODO: better err handl.
          }
          console.log('User manager initialized')
          return this._user
        })()
      }
      return this._userPromise
    },
    async getUser() {
      if (!this._userPromise) {
        await this.init()
      }
      return this._userPromise
    },
  })
})
