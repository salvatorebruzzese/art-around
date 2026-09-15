<!-- eslint-disable vue/multi-word-component-names -->
<template
  class="h-screen overflow-hidden flex flex-col items-center justify-center"
>
  <div
    class="flex flex-col justify-center items-center rounded-xl shadow-md shadow-p-soft py-4 px-8 gap-4 text-center max-w-md mx-4"
  >
    <h1 class="text-3xl text-p-medium">Inserisci il codice</h1>
    <label class="border border-p-soft rounded-sm">
      <input
        class="text-p-dark rounded-sm"
        type="text"
        autocomplete="one-time-code"
        inputmode="text"
        required
      />
    </label>
  </div>
  <a
    href="/navigator/"
    class="block text-center mt-6 text-p-medium hover:text-p-dark hover:underline text-md"
    >Torna indietro</a
  >
</template>
