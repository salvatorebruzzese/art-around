<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    class="flex flex-col justify-center items-center rounded-xl shadow-md shadow-p-soft py-4 px-8 gap-4 text-center max-w-md mx-4"
  >
    <h1 class="text-3xl text-p-medium">Inserisci il codice</h1>
    <label class="border border-p-soft rounded-sm">
      <input
        v-model="sessionId"
        class="text-p-dark rounded-sm"
        type="text"
        autocomplete="one-time-code"
        inputmode="text"
        required
        @keyup.enter="checkSessionAndGo"
      />
    </label>
    <p v-if="errorMessage" class="text-sm text-p-warning">
      {{ errorMessage }}
    </p>
  </div>
  <a
    href="/navigator"
    class="block text-center mt-6 text-p-medium hover:text-p-dark hover:underline text-md"
  >
    Torna indietro
  </a>
</template>

<script>
export default {
  name: 'GuidedTourMobile',
  data() {
    return {
      sessionId: '',
      doesSessionExist: false,
      errorMessage: '',
    }
  },
  methods: {
    async checkSessionAndGo() {
      const cleanId = this.sessionId.trim()
      if (!cleanId) return

      this.errorMessage = ''

      try {
        // First check if session exists
        const sessionResponse = await fetch(
          `/api/sessions/${encodeURIComponent(cleanId)}`,
        )

        if (!sessionResponse.ok) {
          this.doesSessionExist = false
          this.errorMessage = 'Sessione non trovata.'
          return
        }

        const session = await sessionResponse.json()
        this.doesSessionExist = true

        // Authenticate the temporary user and get session cookie
        const authResponse = await fetch(
          `/api/sessions/${encodeURIComponent(cleanId)}/joinAuth?username=${encodeURIComponent(cleanId)}`,
          {
            method: 'POST',
            credentials: 'include',
          },
        )

        if (!authResponse.ok) {
          this.errorMessage = 'Errore di autenticazione.'
          return
        }

        // Now redirect with authenticated session cookie
        window.location.href = `/navigator/guided/${encodeURIComponent(session.tour)}/?session=${encodeURIComponent(session.id)}`
      } catch (err) {
        console.error('Errore durante la verifica:', err)
        this.doesSessionExist = false
        this.errorMessage = 'Errore di rete.'
      }
    },
  },
}
</script>
