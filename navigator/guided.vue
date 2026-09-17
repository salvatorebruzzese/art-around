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
        const response = await fetch(
          `/api/sessions/${encodeURIComponent(cleanId)}`,
        )

        if (!response.ok) {
          this.doesSessionExist = false
          this.errorMessage = 'Sessione non trovata.'
          return
        }

        const session = await response.json()
        this.doesSessionExist = true

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
