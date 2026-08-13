<template>
  <div class="h-screen flex flex-col p-4 bg-p-background-50 gap-4">
    <!-- Top Half: Museum/Visit/Viewer (Detail View) -->
    <div
      class="flex-[2] min-h-0 mx-auto grid w-full max-w-4xl grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-3xl shadow-lg border border-p-soft p-6"
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
      <div class="flex flex-col justify-center gap-4 h-full overflow-y-auto">
        <h1 class="font-serif text-4xl text-p-medium font-bold">
          La notte stellata
        </h1>
        <p class="text-lg text-p-dark">Vincent van Gogh</p>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col">
            <h2 class="text-xs font-semibold text-p-medium uppercase">Museo</h2>
            <p class="text-p-dark">Museum of Modern Art</p>
          </div>
          <div class="flex flex-col">
            <h2 class="text-xs font-semibold text-p-medium uppercase">Data</h2>
            <p class="text-p-dark">1889</p>
          </div>
        </div>

        <div class="flex flex-col">
          <h2 class="text-xs font-semibold text-p-medium uppercase">
            Descrizione
          </h2>
          <p class="text-p-dark font-sans mt-1">
            La Notte stellata è uno dei capolavori più celebri di Vincent van
            Gogh. Dipinto nel giugno del 1889, rappresenta la vista dalla sua
            camera da letto nel manicomio di Saint-Rémy-de-Provence, arricchita
            dall'immaginazione dell'artista con vortici di colore e stelle
            luminose che illuminano il cielo notturno.
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Half: Navigation & Voice Buttons -->
    <div
      class="flex-none h-auto mx-auto w-full max-w-4xl flex flex-col gap-4 items-center px-4 pb-4"
    >
      <!-- Top Layer: Move Buttons -->
      <div class="flex items-center justify-center gap-4 w-full">
        <!-- Previous Button -->
        <button
          class="shared-button-flex-secondary rounded-md w-16 h-16 shadow-lg border border-p-soft hover:border-transparent flex items-center justify-center"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <!-- Next Button -->
        <button
          class="shared-button-flex-secondary rounded-md w-16 h-16 shadow-lg border border-p-soft hover:border-transparent flex items-center justify-center"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <!-- Bottom Layer: Home, Voice, Map Buttons -->
      <div class="flex items-center justify-center gap-4">
        <!-- Home Button -->
        <a
          href="/"
          class="shared-button-flex-secondary rounded-full w-12 h-12 shadow-md border border-p-soft hover:border-transparent flex items-center justify-center"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M24 12 L10 24 H14 V36 H22 V28 H26 V36 H34 V24 H38 Z"
              fill="currentColor"
            />
          </svg>
        </a>

        <!-- Voice Button -->
        <button
          class="shared-button-flex-primary rounded-full w-20 h-20 shadow-xl border border-p-soft hover:border-transparent flex items-center justify-center"
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

        <!-- Map Button -->
        <button
          class="shared-button-flex-secondary rounded-full w-12 h-12 shadow-md border border-p-soft hover:border-transparent flex items-center justify-center"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
