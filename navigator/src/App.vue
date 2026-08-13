<template>
  <div class="h-screen flex flex-col p-4 bg-p-background-50">
    <!-- Top Half: Museum/Visit/Viewer (Split Layout) -->
    <div
      class="flex-1 min-h-0 mx-auto grid min-w-5/10 max-w-8/10 min-h-5/10 max-h-7/10 md:grid-cols-2 gap-6 bg-white rounded-3xl shadow-lg border border-p-soft p-6 mb-4"
    >
      <!-- Image Container -->
      <figure
        class="w-full max-h-full aspect-square rounded-2xl overflow-hidden justify-self-center self-center"
      >
        <img
          src="https://dummyimage.com/600x600/efefef/a3a3a3.jpg&text=Artwork"
          alt="Artwork"
          class="object-cover w-full h-full"
        />
      </figure>

      <!-- Item Info -->
      <div class="flex flex-col justify-center gap-4">
        <h1 class="font-serif text-4xl text-p-dark font-bold">
          La notte stellata
        </h1>
        <p class="text-lg text-p-medium">Vincent van Gogh</p>
        <div class="border-t border-p-soft pt-4">
          <h2 class="text-sm font-semibold text-p-medium">Museo</h2>
          <p class="text-p-dark">Museum of Modern Art</p>
        </div>
        <div class="border-t border-p-soft pt-4">
          <h2 class="text-sm font-semibold text-p-medium">Data</h2>
          <p class="text-p-dark">1889</p>
        </div>
        <div class="border-t border-p-soft pt-4">
          <h2 class="text-sm font-semibold text-p-medium">Descrizione</h2>
          <input
            type="text"
            readonly
            value="Dettagli dell'opera"
            class="w-full bg-white p-2 mt-1 rounded border border-p-soft text-p-dark font-sans"
          />
        </div>
      </div>
    </div>

    <!-- Bottom Half: Voice Button -->
    <div class="flex-none h-24 flex items-center justify-center">
      <button
        class="shared-button rounded-full w-20 h-20 shadow-xl border border-p-soft flex items-center justify-center"
      >
        <svg
          width="36"
          height="32"
          viewBox="0 0 32 32"
          fill="currentColor"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M1 16c0-2 1-4 3-4s3 2 3 4v4c0 2-1 4-3 4s-3-2-3-4v-4z" />
          <path d="M13 10c0-2 1-4 3-4s3 2 3 4v12c0 2-1 4-3 4s-3-2-3-4v-12z" />
          <path d="M25 16c0-2 1-4 3-4s3 2 3 4v4c0 2-1 4-3 4s-3-2-3-4v-4z" />
        </svg>
      </button>
    </div>
  </div>
</template>
