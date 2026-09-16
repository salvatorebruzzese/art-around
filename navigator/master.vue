<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    class="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-p-light selection:bg-p-soft font-sans text-p-dark"
  >
    <Transition name="fade" mode="out-in">
      <div
        v-if="!sessionName"
        key="step-1"
        class="flex flex-col items-center w-full max-w-md bg-p-light rounded-2xl border border-p-soft shadow-xl p-8 gap-6 text-center"
      >
        <h1 class="text-3xl font-semibold text-p-medium">
          Scegli un nome in codice per la visita
        </h1>
        <input
          v-model="tempInput"
          type="text"
          class="input input-bordered rounded-full w-full border border-p-soft bg-p-light text-p-dark placeholder-p-medium/60 focus:border-p-medium focus:ring-2 focus:ring-p-soft focus:outline-none font-sans font-normal shadow-sm px-6 py-3 text-base disabled:opacity-50"
          placeholder="Nome in codice"
          @keyup.enter="sessionName = tempInput.trim()"
        />
      </div>
      <div
        v-else
        key="step-2"
        class="flex flex-col items-center w-full max-w-md bg-p-light rounded-2xl border border-p-soft shadow-xl p-8 gap-6 text-center"
      >
        <h1 class="text-3xl font-semibold text-p-medium">Scegli la visita</h1>

        <div class="w-full flex flex-col gap-4">
          <input
            type="text"
            v-model="search"
            :disabled="isLoading"
            class="input input-bordered rounded-full w-full border border-p-soft bg-p-light text-p-dark placeholder-p-medium/60 focus:border-p-medium focus:ring-2 focus:ring-p-soft focus:outline-none font-sans font-normal shadow-sm px-6 py-3 text-base disabled:opacity-50"
            :placeholder="isLoading ? 'Caricamento dati...' : 'Cerca tour'"
            @input="onSearchInput"
          />

          <div v-if="search" class="w-full text-left">
            <div
              class="text-xs text-p-medium/70 mb-2 font-sans font-medium uppercase tracking-wider"
            >
              Risultati
            </div>
            <ul
              class="font-sans max-h-60 overflow-y-auto divide-y divide-p-soft/30 rounded-lg border border-p-soft/30 p-2"
            >
              <li
                v-for="item in searchResults"
                :key="item._id"
                class="py-2.5 px-3 hover:bg-p-soft/20 rounded-lg transition-colors cursor-pointer"
                @click="selectTourToGuide(item)"
              >
                <span class="text-p-dark font-medium block text-sm">{{
                  item.name
                }}</span>
                <span class="text-p-medium/80 text-xs block mt-0.5">{{
                  item.type
                }}</span>
              </li>
              <li
                v-if="!searchResults.length"
                class="text-p-medium/50 py-3 text-center text-sm"
              >
                Nessun risultato trovato.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
    <a
      href="/navigator/"
      class="block text-center mt-6 text-p-medium hover:text-p-dark hover:underline text-md"
      >Torna indietro</a
    >
  </div>
</template>

<script setup>
import { ref, onMounted, Transition } from 'vue'
import { useMuseumSearch } from './museumSearch'
import { checkLogIn } from './checkLogIn'

const { search, searchResults, isLoading, onSearchInput } = useMuseumSearch()

const tempInput = ref('')
const sessionName = ref('')

const selectTourToGuide = (item) => {
  window.location.href =
    '/navigator/master/' + item._id + '?session=' + sessionName.value
}

onMounted(async () => {
  const loggedIn = await checkLogIn()
  if (!loggedIn) return
})
</script>
