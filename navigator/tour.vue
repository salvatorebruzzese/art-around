<template>
  <!-- Tour Navigation View -->
  <div
    v-if="!isQuizOngoing"
    class="h-dvh flex flex-col justify-between bg-p-light font-serif text-p-dark selection:bg-p-soft overflow-hidden"
  >
    <!-- Scrollable Main Viewport -->
    <main class="overflow-y-auto min-h-0 max-h-7/10 w-full md:pt-6">
      <!-- Detail View -->
      <div
        v-if="!isMapView && !isFollowersView"
        class="mx-auto w-full max-w-4xl bg-p-light rounded-2xl md:rounded-3xl shadow-lg shadow-p-soft p-6 mb-4 flex overflow-x-auto snap-x snap-mandatory md:grid gap-6"
        :class="isMaster ? 'md:grid-cols-1' : 'md:grid-cols-2'"
      >
        <!-- Slide 1: Media Preview -->
        <section
          class="w-full shrink-0 snap-center flex flex-col items-center justify-center gap-4 md:w-auto md:shrink"
        >
          <figure
            class="w-full h-full aspect-square rounded-2xl overflow-hidden justify-self-center self-center"
          >
            <img
              v-if="currentItem && currentItem.image"
              :src="`/api/assets/${currentItem.image}`"
              alt="Item image"
              class="object-cover w-full h-full"
            />
            <img
              v-else
              src="https://dummyimage.com/900x675/efefef/a3a3a3.png&text=Item"
              class="object-cover w-full h-full"
              alt="Item placeholder"
            />
          </figure>

          <h1
            class="font-serif text-2xl text-p-medium font-bold text-center md:hidden"
          >
            {{ currentItem ? currentItem.name : '--' }}
          </h1>
        </section>

        <!-- Slide 2: Spiegazione (Client/Libre only) -->
        <section
          v-if="!isMaster"
          class="w-full shrink-0 snap-center flex flex-col justify-start md:justify-center gap-4 h-full md:w-auto md:shrink"
        >
          <h1
            class="hidden md:block font-serif text-2xl text-p-medium font-bold"
          >
            {{ currentItem ? currentItem.name : '--' }}
          </h1>

          <div v-if="explanations && explanations.length > 1" class="w-full">
            <label
              class="font-semibold mb-2 text-base text-p-medium font-sans block"
            >
              Livello spiegazione
            </label>
            <div class="flex flex-row gap-4">
              <button
                v-for="(ex, idx) in explanations"
                :key="ex.level || idx"
                type="button"
                @click="
                  ((selectedExplanationIdx = idx), onExplanationIdxChange())
                "
                class="shared-button-flex-secondary shadow-sm shadow-p-soft cursor-pointer transition-colors"
                :class="{
                  '!bg-p-soft !shadow-none': selectedExplanationIdx === idx,
                }"
              >
                {{ getLevelLabel(ex.level) }}
              </button>
            </div>
          </div>

          <div class="flex flex-col">
            <div v-if="explanations && explanations.length" class="my-4">
              <div>
                <div
                  class="text-p-medium font-semibold font-sans mb-1 capitalize"
                >
                  {{ getLevelLabel(selectedExplanation.level) }}
                  <span
                    v-if="selectedExplanation.durationSeconds"
                    class="text-p-medium/50 font-sans text-sm ml-2"
                  >
                    ({{ formatDuration(selectedExplanation.durationSeconds) }})
                  </span>
                </div>
                <div class="text-lg font-serif text-p-dark leading-relaxed">
                  {{ selectedExplanation.text }}
                </div>
              </div>
            </div>
            <div
              v-else-if="currentItem && currentItem.description"
              class="text-lg font-serif text-p-dark leading-relaxed my-4"
            >
              {{
                Array.isArray(currentItem.description)
                  ? currentItem.description[0]
                  : currentItem.description
              }}
            </div>
            <div v-else class="text-p-medium/40 font-sans my-12">
              Nessuna descrizione disponibile.
            </div>
          </div>
        </section>

        <!-- Slide 3: Correlati -->
        <section
          class="w-full shrink-0 snap-center flex flex-col justify-start md:justify-center gap-4 h-full md:w-auto md:shrink"
        >
          <div v-if="refsItems.length" class="mt-6">
            <h3 class="font-semibold text-p-medium/90 font-sans mb-2 text-lg">
              Oggetti correlati
            </h3>
            <div class="flex gap-5 pb-2 overflow-x-auto">
              <div
                v-for="item in refsItems"
                :key="item._id"
                class="min-w-[10rem] flex-shrink-0 rounded-xl bg-p-light shadow border border-p-soft/40 p-3 flex flex-col items-center cursor-pointer hover:scale-105 active:scale-95 transition"
                @click="openRefItem(item._id)"
              >
                <img
                  v-if="item.image"
                  :src="`/api/assets/${item.image}`"
                  alt="ref"
                  class="w-24 h-24 object-cover rounded-lg bg-p-soft mb-2"
                />
                <img
                  v-else
                  src="https://dummyimage.com/96x96/efefef/a3a3a3.png&text=Item"
                  class="w-24 h-24 object-cover rounded-lg bg-p-soft mb-2"
                />
                <div
                  class="font-semibold text-center text-p-medium text-base font-sans truncate max-w-[9rem]"
                >
                  {{ item.name || 'Oggetto' }}
                </div>
              </div>
            </div>
          </div>
          <div
            v-else-if="isMaster"
            class="text-p-medium/40 font-sans my-12 text-center"
          >
            Nessun oggetto correlato disponibile.
          </div>
        </section>
      </div>

      <!-- Map View -->
      <div
        v-else-if="isMapView"
        class="mx-auto w-full max-w-4xl bg-p-light rounded-2xl md:rounded-3xl shadow-lg shadow-p-soft p-6 mb-4 flex flex-col items-center justify-center gap-4"
      >
        <h2 class="text-2xl font-bold text-p-medium">Mappa del Museo</h2>
        <figure
          v-if="tour && tour.map"
          class="w-full h-full max-h-96 rounded-2xl overflow-hidden"
        >
          <img
            :src="`/api/assets/${tour.map}`"
            alt="Mappa del museo"
            class="object-contain w-full h-full"
          />
        </figure>
        <div
          v-else
          class="w-full h-64 rounded-2xl border-2 border-dashed border-p-soft bg-p-soft/20 flex items-center justify-center text-p-medium"
        >
          <p>Mappa non disponibile</p>
        </div>
      </div>

      <!-- Followers / Regia View -->
      <div
        v-else-if="isFollowersView"
        class="mx-auto flex flex-col w-full max-w-4xl gap-6 bg-p-light rounded-2xl md:rounded-3xl shadow-lg shadow-p-soft p-6 mb-4 font-sans"
      >
        <div class="text-center">
          <h2 class="text-2xl font-bold text-p-medium">Utenti connessi</h2>
        </div>

        <div v-if="isMaster" class="w-full flex flex-col gap-4">
          <h3 class="text-lg font-bold text-p-medium">
            Partecipanti Connessi ({{ clients.length }})
          </h3>

          <div v-if="isLoadingClients" class="text-p-medium/60 text-sm">
            Caricamento partecipanti...
          </div>

          <ul v-else-if="clients.length" class="flex flex-wrap gap-2">
            <li
              v-for="client in clients"
              :key="client.id || client._id || client"
              class="px-3 py-1 bg-p-light border border-p-soft rounded-full text-sm font-sans shadow-sm flex items-center gap-2"
            >
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              <span>{{ client.username || client }}</span>
            </li>
          </ul>

          <div v-else class="text-p-medium/40 text-sm">
            Nessun partecipante connesso al momento.
          </div>

          <button
            @click="startQuizSession"
            class="shared-button-full-primary mt-4 py-3 rounded-xl cursor-pointer font-semibold"
          >
            Somministra quiz
          </button>
        </div>
      </div>
    </main>

    <!-- Bottom Dock Navigation -->
    <footer
      class="flex-shrink-0 w-full max-w-4xl mx-auto flex flex-col gap-4 items-center px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <!-- Prev / Next Controls -->
      <div
        v-if="!isMapView && !isGuided"
        class="flex items-center justify-center gap-4 w-full"
      >
        <button
          v-if="canGoPrev || detachedStack.length > 0"
          @click="goPrevOrReturn"
          aria-label="Item precedente"
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

        <button
          v-if="canGoNext"
          @click="goNext"
          aria-label="Item successivo"
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

      <!-- Action Icons -->
      <div class="flex items-center justify-center gap-4">
        <a
          href="/navigator"
          class="shared-button-flex-secondary rounded-full w-12 h-12 shadow-md border border-p-soft hover:border-transparent flex items-center justify-center text-p-medium hover:text-p-light hover:bg-p-medium transition-colors duration-100 ease-out"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 48 48"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            class="pointer-events-none"
          >
            <path
              d="M24 8 A16 16 0 1 0 24 40 A16 16 0 0 0 24 8 Z M24 12 A12 12 0 1 1 24 36 A12 12 0 0 1 24 12 Z M18 30 L22 20 L32 16 L28 26 L18 30 Z M25.5 23.5 A1.5 1.5 0 1 0 25.5 20.5 A1.5 1.5 0 0 0 25.5 23.5 Z"
            />
          </svg>
        </a>

        <!-- Voice Button -->
        <button
          v-if="!isMaster"
          @click="toggleSpeechRecognition"
          class="shared-button-flex-primary rounded-full w-20 h-20 shadow-xl border border-p-soft hover:border-transparent flex items-center justify-center"
        >
          <Transition name="fade" mode="out-in">
            <svg
              v-if="!userIsSpeaking"
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
              <path
                d="M13 10c0-2 1-4 3-4s3 2 3 4v12c0 2-1 4-3 4s-3-2-3-4v-12z"
              />
              <path d="M25 16c0-2 1-4 3-4s3 2 3 4v4c0 2-1 4-3 4s-3-2-3-4v-4z" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="6" y="6" width="20" height="20" rx="2" ry="2" />
            </svg>
          </Transition>
        </button>

        <button
          @click="toggleMapView"
          v-if="!isMaster"
          class="shared-button-flex-secondary rounded-full w-12 h-12 shadow-md border border-p-soft hover:border-transparent flex items-center justify-center"
          :class="{ 'bg-p-soft': isMapView }"
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

        <button
          v-if="isMaster"
          @click="toggleFollowersView"
          class="shared-button-flex-secondary rounded-full w-12 h-12 shadow-md border border-p-soft hover:border-transparent flex items-center justify-center"
          :class="{ 'bg-p-soft': isFollowersView }"
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </button>
      </div>
    </footer>
  </div>

  <!-- Quiz View -->
  <div
    v-if="isQuizOngoing"
    class="h-dvh flex flex-col justify-between bg-p-light font-serif text-p-dark selection:bg-p-soft overflow-hidden"
  >
    <main
      class="overflow-y-auto min-h-0 max-h-full w-full p-4 md:py-8 font-sans"
    >
      <div
        class="mx-auto w-full max-w-2xl bg-p-light rounded-2xl md:rounded-3xl shadow-lg shadow-p-soft p-6 flex flex-col gap-6"
      >
        <!-- Domanda in corso -->
        <template v-if="!isQuizCompleted && currentQuizQuestion">
          <div
            class="flex items-center justify-between border-b border-p-soft/50 pb-4"
          >
            <div class="flex flex-col gap-1">
              <span
                class="text-sm font-semibold tracking-wide uppercase text-p-medium/70"
              >
                Domanda {{ currentQuizQuestionIdx + 1 }} di
                {{ quizQuestions.length }}
              </span>
              <div v-if="currentQuestionTimeLimit" class="text-xs text-p-medium/60">
                Tempo: 
                <span :class="timeDisplayColor" class="font-semibold">
                  {{ quizTimeRemaining }}s
                </span>
              </div>
            </div>
            <span
              class="text-xs px-2.5 py-1 rounded-full bg-p-soft text-p-dark font-medium"
            >
              {{
                Math.round(
                  (currentQuizQuestionIdx / quizQuestions.length) * 100,
                )
              }}% Completato
            </span>
          </div>

          <section class="flex flex-col gap-2">
            <h2
              class="text-xl md:text-2xl font-bold text-p-dark font-serif leading-snug"
            >
              {{
                currentQuizQuestion.questionText ||
                currentQuizQuestion.prompt ||
                currentQuizQuestion.question
              }}
            </h2>
            <p
              v-if="currentQuizQuestion.hint"
              class="text-xs text-p-medium/60 italic"
            >
              {{ currentQuizQuestion.hint }}
            </p>
          </section>

          <div class="flex flex-col gap-3">
            <button
              v-for="(option, idx) in currentQuizQuestion.options"
              :key="idx"
              type="button"
              @click="selectQuizOption(idx)"
              :disabled="isSubmittingQuiz"
              class="w-full text-left p-4 rounded-xl border transition duration-150 ease-in-out flex items-center justify-between group cursor-pointer"
              :class="[
                selectedQuizAnswers[currentQuizQuestionIdx] === idx
                  ? 'bg-p-soft/40 border-p-medium text-p-dark font-semibold shadow-sm'
                  : 'border-p-soft bg-p-light hover:bg-p-soft/20 text-p-dark',
              ]"
            >
              <span class="flex items-center gap-3">
                <span
                  class="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-mono transition"
                  :class="
                    selectedQuizAnswers[currentQuizQuestionIdx] === idx
                      ? 'bg-p-medium text-white border-p-medium'
                      : 'border-p-soft text-p-medium group-hover:border-p-medium'
                  "
                >
                  {{ String.fromCharCode(65 + idx) }}
                </span>
                <span>{{ option }}</span>
              </span>
            </button>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              v-if="currentQuizQuestionIdx < quizQuestions.length - 1"
              @click="nextQuizQuestion"
              :disabled="
                selectedQuizAnswers[currentQuizQuestionIdx] === undefined
              "
              class="shared-button-flex-primary px-6 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Avanti
            </button>
            <button
              v-else
              @click="completeQuiz"
              :disabled="
                selectedQuizAnswers[currentQuizQuestionIdx] === undefined ||
                isSubmittingQuiz
              "
              class="shared-button-full-primary px-6 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {{ isSubmittingQuiz ? 'Invio in corso...' : 'Termina Quiz' }}
            </button>
          </div>
        </template>

        <!-- Risultati completati -->
        <template v-else-if="isQuizCompleted">
          <!-- Participant Results & Review View -->
          <div v-if="!isMaster && !isQuizReviewMode" class="text-center flex flex-col items-center gap-4 py-8">
            <div
              class="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl font-bold"
            >
              ✓
            </div>
            <h2 class="text-2xl font-bold font-serif text-p-dark">
              Quiz Completato!
            </h2>
            <p class="text-p-medium/80 text-sm max-w-sm">
              Tutte le risposte sono state registrate con successo.
            </p>

            <div
              class="my-2 p-4 rounded-xl bg-p-soft/20 border border-p-soft w-full max-w-xs flex justify-around"
            >
              <div class="flex flex-col">
                <span class="text-xs uppercase text-p-medium/60 font-semibold"
                  >Punteggio</span
                >
                <span class="text-2xl font-extrabold text-p-dark">
                  {{ calculatedQuizScore }} / {{ quizQuestions.length }}
                </span>
              </div>
              <div class="border-r border-p-soft/50"></div>
              <div class="flex flex-col">
                <span class="text-xs uppercase text-p-medium/60 font-semibold"
                  >Esito</span
                >
                <span class="text-2xl font-extrabold text-p-dark">
                  {{
                    Math.round(
                      (calculatedQuizScore / (quizQuestions.length || 1)) * 100,
                    )
                  }}%
                </span>
              </div>
            </div>

            <button
              @click="enterQuizReviewMode"
              class="mt-4 px-6 py-2 rounded-lg border border-p-soft text-p-medium hover:bg-p-soft/10 transition cursor-pointer"
            >
              Rivedi Risposte
            </button>
          </div>

          <!-- Quiz Review Screen -->
          <div v-else-if="!isMaster && isQuizReviewMode" class="flex flex-col gap-6">
            <div class="flex items-center justify-between border-b border-p-soft/50 pb-4">
              <span class="text-sm font-semibold tracking-wide uppercase text-p-medium/70">
                Domanda {{ currentQuizQuestionIdx + 1 }} di {{ quizQuestions.length }}
              </span>
              <button
                @click="exitQuizReviewMode"
                class="text-sm text-p-medium/60 hover:text-p-dark transition"
              >
                ✕ Chiudi Revisione
              </button>
            </div>

            <section v-if="currentQuizQuestion" class="flex flex-col gap-4">
              <div>
                <h2 class="text-lg md:text-xl font-bold text-p-dark font-serif mb-2">
                  {{ currentQuizQuestion.questionText }}
                </h2>
                <p v-if="currentQuizQuestion.hint" class="text-xs text-p-medium/60 italic">
                  {{ currentQuizQuestion.hint }}
                </p>
              </div>

              <!-- Answer Options with Feedback -->
              <div class="flex flex-col gap-3">
                <button
                  v-for="(option, idx) in currentQuizQuestion.options"
                  :key="idx"
                  type="button"
                  disabled
                  class="w-full text-left p-4 rounded-xl border transition flex items-start justify-between group"
                  :class="{
                    'bg-green-50 border-green-300': idx === currentQuizQuestion.correct,
                    'bg-red-50 border-red-300': idx === selectedQuizAnswers[currentQuizQuestionIdx] && idx !== currentQuizQuestion.correct,
                    'bg-p-soft/20 border-p-soft': idx !== currentQuizQuestion.correct && idx !== selectedQuizAnswers[currentQuizQuestionIdx],
                  }"
                >
                  <span class="flex items-center gap-3 flex-1">
                    <span
                      class="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-mono transition flex-shrink-0"
                      :class="{
                        'bg-green-500 text-white border-green-500': idx === currentQuizQuestion.correct,
                        'bg-red-500 text-white border-red-500': idx === selectedQuizAnswers[currentQuizQuestionIdx] && idx !== currentQuizQuestion.correct,
                        'border-p-soft text-p-medium': idx !== currentQuizQuestion.correct && idx !== selectedQuizAnswers[currentQuizQuestionIdx],
                      }"
                    >
                      {{ String.fromCharCode(65 + idx) }}
                    </span>
                    <span class="text-p-dark">{{ option }}</span>
                  </span>
                  <span class="ml-2 text-sm font-semibold flex-shrink-0">
                    <span v-if="idx === currentQuizQuestion.correct" class="text-green-600">✓ Corretto</span>
                    <span v-else-if="idx === selectedQuizAnswers[currentQuizQuestionIdx]" class="text-red-600">✗ Sbagliato</span>
                  </span>
                </button>
              </div>
            </section>

            <!-- Navigation -->
            <div class="flex justify-between gap-3 pt-2 mt-4">
              <button
                @click="prevReviewQuestion"
                :disabled="currentQuizQuestionIdx === 0"
                class="px-6 py-2 rounded-lg border border-p-soft text-p-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-p-soft/10 transition"
              >
                ← Precedente
              </button>
              <button
                @click="exitQuizReviewMode"
                class="px-6 py-2 rounded-lg border border-p-soft text-p-medium hover:bg-p-soft/10 transition cursor-pointer"
              >
                Chiudi
              </button>
              <button
                @click="nextReviewQuestion"
                :disabled="currentQuizQuestionIdx === quizQuestions.length - 1"
                class="px-6 py-2 rounded-lg border border-p-soft text-p-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-p-soft/10 transition"
              >
                Prossima →
              </button>
            </div>
          </div>

          <!-- Master Results Dashboard -->
          <div v-else class="flex flex-col gap-6">
            <div class="text-center">
              <h2 class="text-2xl font-bold font-serif text-p-dark mb-2">
                Risultati Quiz
              </h2>
              <p class="text-p-medium/80 text-sm">
                Risposte ricevute da {{ (quizResults && Object.keys(quizResults).length) || 0 }} 
                partecipant{{ (quizResults && Object.keys(quizResults).length) !== 1 ? 'i' : 'e' }}
              </p>
            </div>

            <!-- Results Table -->
            <div v-if="quizResults && Object.keys(quizResults).length > 0" class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b-2 border-p-soft">
                    <th class="text-left py-2 px-3 font-semibold text-p-dark">Partecipante</th>
                    <th class="text-center py-2 px-3 font-semibold text-p-dark">Punteggio</th>
                    <th class="text-center py-2 px-3 font-semibold text-p-dark">Percentuale</th>
                    <th class="text-center py-2 px-3 font-semibold text-p-dark">Invio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(result, userId, idx) in quizResults"
                    :key="userId"
                    class="border-b border-p-soft/30 hover:bg-p-soft/10 transition"
                  >
                    <td class="py-3 px-3 text-p-dark font-medium">
                      {{ userId }}
                    </td>
                    <td class="text-center py-3 px-3 text-p-dark font-semibold">
                      {{ result.answers.filter(a => a !== -1).reduce((acc, ans, idx) => 
                        acc + (ans === quizQuestions[idx].correct ? 1 : 0), 0) }} / {{ quizQuestions.length }}
                    </td>
                    <td class="text-center py-3 px-3 text-p-dark">
                      <span
                        class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                        :class="{
                          'bg-green-100 text-green-700': 
                            Math.round((result.answers.filter(a => a !== -1).reduce((acc, ans, idx) => 
                              acc + (ans === quizQuestions[idx].correct ? 1 : 0), 0) / quizQuestions.length) * 100) >= 70,
                          'bg-yellow-100 text-yellow-700': 
                            Math.round((result.answers.filter(a => a !== -1).reduce((acc, ans, idx) => 
                              acc + (ans === quizQuestions[idx].correct ? 1 : 0), 0) / quizQuestions.length) * 100) >= 50 &&
                            Math.round((result.answers.filter(a => a !== -1).reduce((acc, ans, idx) => 
                              acc + (ans === quizQuestions[idx].correct ? 1 : 0), 0) / quizQuestions.length) * 100) < 70,
                          'bg-red-100 text-red-700': 
                            Math.round((result.answers.filter(a => a !== -1).reduce((acc, ans, idx) => 
                              acc + (ans === quizQuestions[idx].correct ? 1 : 0), 0) / quizQuestions.length) * 100) < 50,
                        }"
                      >
                        {{ Math.round((result.answers.filter(a => a !== -1).reduce((acc, ans, idx) => 
                          acc + (ans === quizQuestions[idx].correct ? 1 : 0), 0) / quizQuestions.length) * 100) }}%
                      </span>
                    </td>
                    <td class="text-center py-3 px-3 text-p-medium/60 text-xs">
                      {{ result.submittedAt ? new Date(result.submittedAt).toLocaleTimeString('it-IT') : '—' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Loading state -->
            <div v-else-if="isLoadingQuizResults" class="text-center py-8">
              <p class="text-p-medium/60">Caricamento risultati in corso...</p>
            </div>

            <!-- No results yet -->
            <div v-else class="text-center py-8">
              <p class="text-p-medium/60 text-sm">Nessun risultato ricevuto ancora.</p>
              <button
                @click="fetchQuizResults"
                class="mt-4 px-4 py-2 rounded-lg border border-p-soft text-p-medium hover:bg-p-soft/10 transition text-sm"
              >
                Aggiorna Risultati
              </button>
            </div>

            <button
              @click="exitQuiz"
              class="shared-button-flex-secondary px-6 py-2 rounded-lg border border-p-soft cursor-pointer"
            >
              Torna al Tour
            </button>
          </div>
        </template>

        <div v-else class="text-center py-12 text-p-medium/40">
          Nessuna domanda disponibile per questo quiz.
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { Transition } from 'vue'
import { TourNavigation } from '../marketplace/tourNav.js'
import { speechRecognizer, startSpeechSynthesis } from './speechSyntesis.js'

class TourController {
  constructor({ itemNav = [], onChange = null } = {}) {
    this.itemNav = Array.isArray(itemNav) ? itemNav.slice() : []
    this.curItemIdx = 0
    this.detachedStack = []
    this.onChange = onChange
  }

  setItemNav(itemNav) {
    this.itemNav = Array.isArray(itemNav) ? itemNav.slice() : []
    this.curItemIdx = 0
    this.detachedStack = []
    this.emit()
  }

  getCurrentItemId() {
    if (this.detachedStack.length > 0) {
      return this.detachedStack[this.detachedStack.length - 1]
    }
    return this.itemNav[this.curItemIdx] || null
  }

  emit() {
    if (typeof this.onChange === 'function') {
      this.onChange({
        curItemIdx: this.curItemIdx,
        detachedStack: this.detachedStack.slice(),
      })
    }
  }

  goPrev() {
    if (this.curItemIdx > 0) {
      this.curItemIdx--
      this.emit()
    }
  }

  goNext() {
    if (this.curItemIdx < this.itemNav.length - 1) {
      this.curItemIdx++
      this.emit()
    }
  }

  openRefItem(itemId) {
    if (!itemId) return
    const navIdx = this.itemNav.findIndex((x) => x === itemId)
    if (navIdx !== -1) {
      this.curItemIdx = navIdx
      this.detachedStack = []
    } else {
      this.detachedStack.push(itemId)
    }
    this.emit()
  }

  returnToNav() {
    if (!this.detachedStack.length) return
    this.detachedStack.pop()
    this.emit()
  }

  goPrevOrReturn() {
    if (this.detachedStack.length) this.returnToNav()
    else this.goPrev()
  }

  teardown() {}
}

class LibreTourController extends TourController {
  constructor(opts = {}) {
    super(opts)
  }
}

class MasterTourController extends TourController {
  constructor({ sessionId, ...opts } = {}) {
    super(opts)
    this.sessionId = sessionId
    this.lastBroadcastItemId = null
    this.abortController = null
    this.isStartingQuiz = false
  }

  emit() {
    super.emit()
    const currentItemId = this.getCurrentItemId()
    if (currentItemId) {
      this.broadcastShowItem(currentItemId)
    }
  }

  async broadcastShowItem(itemId) {
    if (!itemId || !this.sessionId || this.lastBroadcastItemId === itemId) {
      return
    }

    if (this.abortController) {
      this.abortController.abort()
    }
    this.abortController = new AbortController()

    this.lastBroadcastItemId = itemId
    try {
      const url = `/api/sessions/${encodeURIComponent(this.sessionId)}/showItem`
      let res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId }),
        signal: this.abortController.signal,
      })
      if (!res.ok) {
        console.error(`Broadcast showItem failed: ${res.status}`)
      }
    } catch (e) {
      // Ignora abort, ma log altri errori
      if (e.name !== 'AbortError') {
        console.error('Errore broadcastShowItem:', e)
      }
    }
  }

  async startQuiz() {
    if (!this.sessionId || this.isStartingQuiz) return false

    this.isStartingQuiz = true
    try {
      let res = await fetch(
        `/api/sessions/${encodeURIComponent(this.sessionId)}/startQuiz`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
      )

      if (!res.ok) {
        console.error(`Start quiz failed: ${res.status}`)
      }
      return res.ok
    } catch (err) {
      console.error('Errore startQuiz:', err)
      return false
    } finally {
      this.isStartingQuiz = false
    }
  }

  teardown() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }
}

class GuidedTourController extends TourController {
  constructor({ sessionId, username, onStartQuiz = null, ...opts } = {}) {
    super(opts)
    this.sessionId = sessionId
    this.username = username
    this.onStartQuiz = onStartQuiz
    this.eventSource = null
    this.hasReceivedFirstEvent = false
    this.refreshScheduled = false
  }

  connect() {
    if (!this.sessionId || typeof window === 'undefined') return
    const randomSuffix = (() => {
      const cryptoObj = globalThis.crypto
      if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
        return Date.now().toString(36)
      }
      const bytes = new Uint8Array(4)
      cryptoObj.getRandomValues(bytes)
      return Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join('')
    })()
    const username = this.username || `guided-${randomSuffix}`
    const joinUrl = `/api/sessions/${encodeURIComponent(this.sessionId)}/join?username=${encodeURIComponent(username)}`

    this.eventSource = new EventSource(joinUrl)

    this.eventSource.onerror = () => {
      if (
        this.eventSource &&
        this.eventSource.readyState === EventSource.CLOSED
      ) {
        const altUrl = `/api/sessions/${encodeURIComponent(this.sessionId)}/join?username=${encodeURIComponent(username)}`
        this.eventSource = new EventSource(altUrl)
        this.bindEvents()
      }
    }

    this.bindEvents()
  }

  bindEvents() {
    if (!this.eventSource) return

    // Schedule a refresh check after join - if no real events arrive, reload
    if (!this.refreshScheduled && typeof window !== 'undefined') {
      this.refreshScheduled = true
      setTimeout(() => {
        // If we haven't received any real event (showItem/startQuiz), refresh
        if (!this.hasReceivedFirstEvent) {
          window.location.reload()
        }
      }, 2000)
    }

    this.eventSource.addEventListener('showItem', (event) => {
      try {
        this.hasReceivedFirstEvent = true
        const payload = JSON.parse(event.data || '{}')
        this.showItem(payload.itemId)
      } catch (_err) {}
    })

    this.eventSource.addEventListener('startQuiz', () => {
      this.hasReceivedFirstEvent = true
      if (typeof this.onStartQuiz === 'function') {
        this.onStartQuiz()
      }
    })
  }

  showItem(itemId) {
    if (!itemId) return
    const navIdx = this.itemNav.findIndex((x) => x === itemId)
    if (navIdx !== -1) {
      this.curItemIdx = navIdx
      this.detachedStack = []
    } else {
      this.detachedStack = [itemId]
    }
    this.emit()
  }

  goPrev() {}
  goNext() {}
  openRefItem() {}
  returnToNav() {}
  goPrevOrReturn() {}

  teardown() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }
}

export default {
  name: 'TourNavigationMobile',
  data() {
    return {
      tourId: '',
      tour: null,
      itemNav: [],
      items: [],
      clients: [],
      curItemIdx: 0,
      detachedStack: [],
      refsItems: [],
      bottomOverlay: false,
      audioPlaying: false,
      touch0: null,
      openTouch0: null,
      loadedItemsMap: {},
      isMapView: false,
      isFollowersView: false,
      isLoadingClients: false,
      userIsSpeaking: false,
      currentSpokenCommand: '',
      currentRecognizer: null,
      clientsInterval: null,
      selectedExplanationIdx: 0,
      userSelectedLevel: null,
      controller: null,
      controllerMode: 'libre',
      sessionId: '',
      sessionUsername: '',
      // Quiz
      isQuizOngoing: false,
      isQuizCompleted: false,
      isQuizReviewMode: false,
      isSubmittingQuiz: false,
      currentQuizQuestionIdx: 0,
      selectedQuizAnswers: {},
      quizQuestions: [],
      quizResults: null,
      isLoadingQuizResults: false,
      quizTimeRemaining: 0,
      quizTimeInterval: null,
    }
  },
  computed: {
    isGuided() {
      return this.controllerMode === 'guided'
    },
    isMaster() {
      return this.controllerMode === 'master'
    },
    currentItem() {
      const idxObj = this.getCurrentIdxObj()
      if (!idxObj) return null
      return this.items.find((i) => i._id === idxObj)
    },
    canGoPrev() {
      return this.detachedStack.length === 0 && this.curItemIdx > 0
    },
    canGoNext() {
      return (
        this.detachedStack.length === 0 &&
        this.curItemIdx < this.itemNav.length - 1
      )
    },
    explanations() {
      if (
        this.currentItem &&
        Array.isArray(this.currentItem.explanations) &&
        this.currentItem.explanations.length > 0
      ) {
        return this.currentItem.explanations.filter(
          (ex) =>
            ex &&
            typeof ex === 'object' &&
            typeof ex.text === 'string' &&
            ex.text.trim().length > 0,
        )
      }
      return []
    },
    selectedExplanation() {
      const exps = this.explanations
      if (!exps.length) return {}
      return exps[this.selectedExplanationIdx] || exps[0]
    },
    currentQuizQuestion() {
      return this.quizQuestions[this.currentQuizQuestionIdx] || null
    },
    calculatedQuizScore() {
      return this.quizQuestions.reduce((acc, question, idx) => {
        return (
          acc + (this.selectedQuizAnswers[idx] === question.correct ? 1 : 0)
        )
      }, 0)
    },
    currentQuestionTimeLimit() {
      const q = this.currentQuizQuestion
      return q?.timeLimit || null
    },
    isTimeExpired() {
      return this.quizTimeRemaining !== null && this.quizTimeRemaining <= 0 && this.currentQuestionTimeLimit
    },
    timeDisplayColor() {
      if (!this.currentQuestionTimeLimit) return 'text-p-dark'
      if (this.quizTimeRemaining <= 5) return 'text-red-600'
      if (this.quizTimeRemaining <= 10) return 'text-yellow-600'
      return 'text-p-dark'
    },
  },
  watch: {
    currentItem: {
      handler(newVal) {
        if (newVal && Array.isArray(newVal.refs)) {
          const refs = newVal.refs
            .filter((refId) => refId !== undefined && refId !== null)
            .filter((refId) => this.items.some((i) => i._id === refId))
          this.refsItems = refs
            .map((refId) => this.items.find((i) => i._id === refId))
            .filter(Boolean)
        } else {
          this.refsItems = []
        }
        this.stopAudio()
        this.setBestExplanationIdx()
      },
      immediate: true,
    },
    isFollowersView(newVal) {
      if (newVal) {
        this.startClientsPolling()
      } else {
        this.stopClientsPolling()
      }
    },
    explanations() {
      this.setBestExplanationIdx()
    },
    currentSpokenCommand(newVal) {
      if (!newVal) return

      const command = newVal
        .trim()
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')

      switch (command) {
        case 'avanti':
          if (this.canGoNext) this.goNext()
          break

        case 'indietro':
          if (this.canGoPrev || this.detachedStack.length > 0) {
            this.goPrevOrReturn()
          }
          break

        case 'opera':
        case 'spiegami':
          this.handleExplanationCommand()
          break

        case 'autoreopera':
        case 'autore opera':
        case 'autore':
          this.handleAuthorCommand()
          break

        case 'complicaspiegazione':
        case 'complica spiegazione':
          this.changeExplanationLevel(1)
          break

        case 'semplificaspiegazione':
        case 'semplifica spiegazione':
          this.changeExplanationLevel(-1)
          break

        case 'entratamostra':
        case 'entrata mostra':
        case 'entrata':
          this.handleLocationFeedback(
            this.tour?.entranceLocation || this.tour?.entrance,
            "L'entrata della mostra si trova all'ingresso principale.",
          )
          break

        case 'uscitamostra':
        case 'uscita mostra':
        case 'uscita':
          this.handleLocationFeedback(
            this.tour?.exitLocation || this.tour?.exit,
            "L'uscita della mostra si trova al termine del percorso espositivo.",
          )
          break

        case 'posizioneopera':
        case 'posizione opera':
        case "dove si trova l'opera":
          this.handleLocationFeedback(
            this.currentItem?.location || this.currentItem?.position,
            this.currentItem
              ? `L'opera ${this.currentItem.name} si trova nella sala corrente.`
              : 'Nessuna opera selezionata.',
          )
          break

        case 'posizionebagno':
        case 'posizione bagno':
        case 'bagno':
        case 'bagni':
          this.handleLocationFeedback(
            this.tour?.restroomsLocation || this.tour?.toilets,
            "I servizi igienici si trovano vicino all'atrio principale.",
          )
          break

        case 'posizionereception':
        case 'posizione reception':
        case 'reception':
          this.handleLocationFeedback(
            this.tour?.receptionLocation || this.tour?.reception,
            "La reception si trova all'ingresso dell'edificio.",
          )
          break

        default:
          break
      }

      this.$nextTick(() => {
        this.currentSpokenCommand = null
      })
    },
  },
  created() {
    this.initTour()
  },
  methods: {
    toggleSpeechRecognition() {
      if (this.userIsSpeaking) {
        if (this.currentRecognizer) {
          this.currentRecognizer.abort()
        }
        this.userIsSpeaking = false
        return
      }

      try {
        this.currentRecognizer = speechRecognizer()
        if (!this.currentRecognizer) {
          console.error(
            'SpeechRecognition non supportato dal browser o funzione non definita.',
          )
          return
        }

        this.currentRecognizer.onresult = (event) => {
          this.currentSpokenCommand = event.results[0][0].transcript
        }

        this.currentRecognizer.onerror = (err) => {
          console.error('Errore SpeechRecognition:', err)
          this.userIsSpeaking = false
        }

        this.currentRecognizer.onend = () => {
          this.userIsSpeaking = false
        }

        this.currentRecognizer.start()
        this.userIsSpeaking = true
      } catch (err) {
        console.error('Impossibile avviare il riconoscimento vocale:', err)
        this.userIsSpeaking = false
      }
    },
    resolveTourSettings() {
      let tourId = ''
      let mode = 'libre'
      let sessionId = ''
      let username = ''

      if (typeof window !== 'undefined') {
        const fullUrl = window.location.href
        const modeMatch = fullUrl.match(/\b(libre|guided|master)\b/i)
        if (modeMatch) {
          mode = modeMatch[1].toLowerCase()
        }

        const url = new URL(fullUrl)
        const segments = url.pathname.split('/').filter(Boolean)
        const hexCandidate = segments.find((s) => /^[0-9a-fA-F]{24}$/.test(s))
        if (hexCandidate) {
          tourId = hexCandidate
        } else if (
          segments.length >= 2 &&
          segments[0].toLowerCase().startsWith('tour')
        ) {
          const segVal = segments[1]
          if (!['guided', 'master', 'libre'].includes(segVal.toLowerCase())) {
            tourId = segVal
          }
        }

        const urlParams = new URLSearchParams(window.location.search)
        sessionId = urlParams.get('session') || urlParams.get('sessionId') || ''
        username = urlParams.get('username') || ''
      }

      if (!tourId) {
        tourId =
          this.$route?.params?.id ||
          this.$route?.params?.tourId ||
          this.$route?.query?.tour ||
          ''
      }

      return { tourId, mode, sessionId, username }
    },
    applyControllerState(state) {
      this.curItemIdx = state.curItemIdx
      this.detachedStack = state.detachedStack
    },
    setupController() {
      // Skip if guided controller already set up early in initTour
      if (this.controllerMode === 'guided' && this.controller) {
        this.controller.setItemNav(this.itemNav)
        return
      }

      if (this.controller) {
        this.controller.teardown()
      }
      const common = {
        itemNav: this.itemNav,
        onChange: this.applyControllerState,
      }

      if (this.controllerMode === 'master' && this.sessionId) {
        this.controller = new MasterTourController({
          ...common,
          sessionId: this.sessionId,
        })
      } else {
        this.controllerMode = 'libre'
        this.controller = new LibreTourController(common)
      }
      this.controller.setItemNav(this.itemNav)
    },
    async initTour() {
      const settings = this.resolveTourSettings()
      this.tourId = settings.tourId
      this.controllerMode = settings.mode
      this.sessionId = settings.sessionId
      this.sessionUsername = settings.username

      try {
        // For guided tours, connect to SSE immediately to avoid missing events
        if (this.controllerMode === 'guided' && this.sessionId) {
          const common = {
            itemNav: this.itemNav,
            onChange: this.applyControllerState,
          }
          this.controller = new GuidedTourController({
            ...common,
            sessionId: this.sessionId,
            username: this.sessionUsername,
            onStartQuiz: async () => {
              await this.handleStartQuizEvent()
            },
          })
          this.controller.connect()
        }

        if (this.sessionId && (!this.tourId || this.tourId === 'demo-tour')) {
          let sRes = await fetch(
            `/api/sessions/${encodeURIComponent(this.sessionId)}`,
          )
          if (sRes.ok) {
            const sData = await sRes.json()
            if (sData.tour) {
              this.tourId =
                typeof sData.tour === 'object'
                  ? sData.tour._id || sData.tour.id
                  : sData.tour
            }
          }
        }

        if (this.tourId && this.tourId !== 'demo-tour') {
          const nav = new TourNavigation()
          await nav.initialize(this.tourId, null)
          this.tour = nav.tour

          if (!this.tour?.quiz) {
            let tRes = await fetch(
              `/api/tour/${encodeURIComponent(this.tourId)}`,
            )
            if (tRes.ok) {
              const tourFull = await tRes.json()
              const quizObj = tourFull.quiz || tourFull.tour?.quiz
              if (quizObj) {
                this.tour = { ...(this.tour || {}), quiz: quizObj }
              }
            }
          }

          this.itemNav = Array.isArray(this.tour?.itemNav)
            ? this.tour.itemNav.slice()
            : []
          let allItemIds = new Set()
          this.loadedItemsMap = {}
          const fetchedItems =
            nav.items && typeof nav.items === 'object' ? nav.items : {}
          Object.entries(fetchedItems).forEach(([id, item]) => {
            if (id && item) {
              allItemIds.add(id)
              this.loadedItemsMap[id] = item
            }
          })
          if (Array.isArray(this.itemNav)) {
            this.itemNav.forEach(
              (id) => typeof id === 'string' && allItemIds.add(id),
            )
          }
          if (Array.isArray(this.tour?.items)) {
            this.tour.items.forEach(
              (id) => typeof id === 'string' && allItemIds.add(id),
            )
          }
          await this.fetchItemIdsRecursive(Array.from(allItemIds))
          this.items = Array.from(allItemIds)
            .map((id) => this.loadedItemsMap[id])
            .filter(Boolean)
        }

        this.curItemIdx = 0
        this.detachedStack = []
        this.setupController()
      } catch (e) {
        console.error('Errore durante initTour:', e)
        if (this.controller) this.controller.teardown()
        this.controller = null
        this.tour = null
        this.items = []
        this.itemNav = []
        this.loadedItemsMap = {}
      }
    },
    async loadQuizData() {
      const normalizeQuestion = (q) => ({
        ...q,
        questionText: q.questionText || q.prompt || q.question,
      })

      if (
        this.tour?.quiz &&
        Array.isArray(this.tour.quiz.questions) &&
        this.tour.quiz.questions.length > 0
      ) {
        this.quizQuestions = this.tour.quiz.questions.map(normalizeQuestion)
        return
      }

      if (!this.tourId && this.sessionId) {
        try {
          const sRes = await fetch(
            `/api/sessions/${encodeURIComponent(this.sessionId)}`,
          )
          if (sRes.ok) {
            const sData = await sRes.json()
            if (sData.tour) {
              this.tourId =
                typeof sData.tour === 'object'
                  ? sData.tour._id || sData.tour.id
                  : sData.tour
            }
          }
        } catch (e) {
          console.error('Errore recupero sessione:', e)
        }
      }

      const effectiveTourId = this.tourId || this.tour?._id
      if (effectiveTourId && effectiveTourId !== 'demo-tour') {
        try {
          let res = await fetch(
            `/api/tours/${encodeURIComponent(effectiveTourId)}`,
          )
          if (res.ok) {
            const data = await res.json()
            const quizObj = data.quiz || data.tour?.quiz
            if (
              quizObj &&
              Array.isArray(quizObj.questions) &&
              quizObj.questions.length > 0
            ) {
              this.quizQuestions = quizObj.questions.map(normalizeQuestion)
              if (this.tour) this.tour.quiz = quizObj
              return
            }
          }
        } catch (err) {
          console.error('Errore nel recupero del quiz via API:', err)
        }
      }

      this.quizQuestions = []
      console.warn('Nessun dato quiz trovato nel modello del tour.')
    },
    async fetchItemIdsRecursive(ids) {
      const toFetch = ids.filter((id) => id && !this.loadedItemsMap[id])
      const fetches = toFetch.map(async (id) => {
        try {
          const res = await fetch(`/api/items/${id}`)
          if (!res.ok) return null
          const item = await res.json()
          this.loadedItemsMap[id] = item
          return item
        } catch (e) {
          this.loadedItemsMap[id] = null
          return null
        }
      })
      const itemsObjs = await Promise.all(fetches)
      let refsToFetch = []
      for (const item of itemsObjs) {
        if (item && Array.isArray(item.refs)) {
          for (let refId of item.refs) {
            if (refId && !this.loadedItemsMap[refId]) {
              refsToFetch.push(refId)
            }
          }
        }
      }
      refsToFetch = [...new Set(refsToFetch)]
      if (refsToFetch.length > 0) {
        await this.fetchItemIdsRecursive(refsToFetch)
      }
    },
    getCurrentIdxObj() {
      if (this.detachedStack.length > 0) {
        return this.detachedStack[this.detachedStack.length - 1]
      } else if (this.itemNav && this.itemNav[this.curItemIdx]) {
        return this.itemNav[this.curItemIdx]
      }
      return null
    },
    goPrev() {
      if (this.controller) this.controller.goPrev()
    },
    goNext() {
      if (this.controller) this.controller.goNext()
    },
    goPrevOrReturn() {
      if (this.controller) this.controller.goPrevOrReturn()
    },
    openRefItem(itemId) {
      if (this.controller) this.controller.openRefItem(itemId)
    },
    returnToNav() {
      if (this.controller) this.controller.returnToNav()
    },
    togglePlay() {
      if (!this.currentItem || !this.currentItem.audio) return
      const audioEl = this.$refs.audioEl
      if (!audioEl) return
      if (this.audioPlaying) {
        audioEl.pause()
        this.audioPlaying = false
      } else {
        audioEl.play()
        this.audioPlaying = true
      }
    },
    stopAudio() {
      const audioEl = this.$refs.audioEl
      if (audioEl) {
        audioEl.pause()
        audioEl.currentTime = 0
        this.audioPlaying = false
      }
    },
    getLevelLabel(level) {
      if (!level) return 'Descrizione'
      switch (level) {
        case 'simple':
          return 'Semplice'
        case 'normal':
          return 'Normale'
        case 'advanced':
          return 'Avanzata'
        default:
          return level && typeof level === 'string'
            ? level.charAt(0).toUpperCase() + level.slice(1)
            : 'Descrizione'
      }
    },
    formatDuration(seconds) {
      if (typeof seconds !== 'number' || isNaN(seconds)) return ''
      const m = Math.floor(seconds / 60)
      const s = Math.round(seconds % 60)
      return m > 0 ? `${m}m ${s}s` : `${s}s`
    },
    onExplanationIdxChange() {
      const exps = this.explanations
      if (!exps.length) {
        this.userSelectedLevel = null
        return
      }
      const idx = this.selectedExplanationIdx
      if (exps[idx] && exps[idx].level) {
        this.userSelectedLevel = exps[idx].level
      } else {
        this.userSelectedLevel = null
      }
    },
    setBestExplanationIdx() {
      const exps = this.explanations
      if (!exps.length) {
        this.selectedExplanationIdx = 0
        return
      }
      if (exps.length === 1) {
        this.selectedExplanationIdx = 0
        return
      }
      if (this.userSelectedLevel) {
        const prefIdx = exps.findIndex(
          (ex) => ex.level === this.userSelectedLevel,
        )
        if (prefIdx !== -1) {
          this.selectedExplanationIdx = prefIdx
          return
        }
        const possibleLevels = ['simple', 'normal', 'advanced']
        const userIdx = possibleLevels.indexOf(this.userSelectedLevel)
        let nearestIdx = null
        let nearestDistance = Infinity
        exps.forEach((ex, idx) => {
          const exIdx = possibleLevels.indexOf(ex.level)
          if (exIdx === -1 || userIdx === -1) return
          const dist = Math.abs(exIdx - userIdx)
          if (dist < nearestDistance) {
            nearestDistance = dist
            nearestIdx = idx
          }
        })
        if (nearestIdx !== null) {
          this.selectedExplanationIdx = nearestIdx
          return
        }
        this.selectedExplanationIdx = 0
        return
      }
      this.selectedExplanationIdx = 0
    },
    toggleMapView() {
      this.isMapView = !this.isMapView
      if (this.isMapView) this.isFollowersView = false
    },
    toggleFollowersView() {
      this.isFollowersView = !this.isFollowersView
      if (this.isFollowersView) this.isMapView = false
    },
    startClientsPolling() {
      this.fetchClients()
      this.stopClientsPolling()
      this.clientsInterval = setInterval(() => {
        if (this.isFollowersView) {
          this.fetchClients()
        }
      }, 2500)
    },
    stopClientsPolling() {
      if (this.clientsInterval) {
        clearInterval(this.clientsInterval)
        this.clientsInterval = null
      }
    },
    async fetchClients() {
      if (!this.sessionId || this.isLoadingClients) return

      this.isLoadingClients = true
      try {
        let res = await fetch(
          `/api/sessions/${encodeURIComponent(this.sessionId)}/clients`,
        )
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        this.clients = await res.json()
      } catch (err) {
        console.error('Errore nel caricamento dei clients:', err)
      } finally {
        this.isLoadingClients = false
      }
    },
    handleAuthorCommand() {
      if (!this.currentItem) return

      const isArtwork =
        !this.currentItem.type ||
        this.currentItem.type.toLowerCase() === 'artwork'

      if (isArtwork && (this.currentItem.author || this.currentItem.autore)) {
        const author = this.currentItem.author || this.currentItem.autore
        const message = `L'autore di quest'opera è ${author}`
        startSpeechSynthesis(message)
      } else {
        const fallback =
          "Informazione sull'autore non disponibile per questa voce."
        startSpeechSynthesis(fallback)
      }
    },
    handleExplanationCommand() {
      if (!this.currentItem) return

      const isArtwork =
        !this.currentItem.type ||
        this.currentItem.type.toLowerCase() === 'artwork'

      if (isArtwork) {
        startSpeechSynthesis(this.selectedExplanation.text)
      } else {
        const fallback =
          "Informazione sull'opera non disponibile per questa voce."
        startSpeechSynthesis(fallback)
      }
    },
    changeExplanationLevel(delta) {
      if (!this.explanations || this.explanations.length <= 1) return

      const nextIdx = this.selectedExplanationIdx + delta
      if (nextIdx >= 0 && nextIdx < this.explanations.length) {
        this.selectedExplanationIdx = nextIdx
        this.onExplanationIdxChange()

        const currentLevel = this.getLevelLabel(this.selectedExplanation.level)
        startSpeechSynthesis(`Livello impostato su: ${currentLevel}`)
      }
    },
    handleLocationFeedback(specificInfo, defaultInfo) {
      const textToSpeak =
        typeof specificInfo === 'string' && specificInfo.trim().length > 0
          ? specificInfo
          : defaultInfo

      startSpeechSynthesis(textToSpeak)
    },
    async startQuizSession() {
      if (this.controller && typeof this.controller.startQuiz === 'function') {
        const ok = await this.controller.startQuiz()
        if (ok) {
          await this.handleStartQuizEvent()
        }
      }
    },
    async handleStartQuizEvent() {
      await this.loadQuizData()
      this.currentQuizQuestionIdx = 0
      this.selectedQuizAnswers = {}
      this.isQuizCompleted = false
      this.quizResults = null
      this.isQuizOngoing = true
      this.stopAudio()
      this.stopClientsPolling()
      this.startQuestionTimer()
    },
    startQuestionTimer() {
      this.stopQuestionTimer()
      const timeLimit = this.currentQuestionTimeLimit
      if (!timeLimit) {
        this.quizTimeRemaining = null
        return
      }
      this.quizTimeRemaining = timeLimit
      this.quizTimeInterval = setInterval(() => {
        if (this.quizTimeRemaining > 0) {
          this.quizTimeRemaining--
        } else {
          this.stopQuestionTimer()
          // Auto-advance to next question when time expires
          if (this.currentQuizQuestionIdx < this.quizQuestions.length - 1) {
            this.nextQuizQuestion()
          }
        }
      }, 1000)
    },
    stopQuestionTimer() {
      if (this.quizTimeInterval) {
        clearInterval(this.quizTimeInterval)
        this.quizTimeInterval = null
      }
      this.quizTimeRemaining = null
    },
    selectQuizOption(optionIdx) {
      this.selectedQuizAnswers[this.currentQuizQuestionIdx] = optionIdx
    },
    nextQuizQuestion() {
      if (this.currentQuizQuestionIdx < this.quizQuestions.length - 1) {
        this.currentQuizQuestionIdx++
        this.startQuestionTimer()
      }
    },
    async completeQuiz() {
      this.isSubmittingQuiz = true
      try {
        if (this.sessionId) {
          const answersArray = this.quizQuestions.map((_, idx) =>
            this.selectedQuizAnswers[idx] !== undefined
              ? this.selectedQuizAnswers[idx]
              : -1,
          )

          let res = await fetch(
            `/api/sessions/${encodeURIComponent(this.sessionId)}/submitQuiz`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ answers: answersArray }),
            },
          )
        }
        this.isQuizCompleted = true
        
        // If master, fetch results after a short delay to let all participants submit
        if (this.isMaster && this.sessionId) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.fetchQuizResults()
            }, 1500)
          })
        }
      } catch (err) {
        console.error('Errore durante invio risposte quiz:', err)
      } finally {
        this.isSubmittingQuiz = false
      }
    },
    async fetchQuizResults() {
      if (!this.sessionId || this.isLoadingQuizResults) return
      
      this.isLoadingQuizResults = true
      try {
        let res = await fetch(
          `/api/sessions/${encodeURIComponent(this.sessionId)}/quizResults`,
        )
        if (res.ok) {
          this.quizResults = await res.json()
        }
      } catch (err) {
        console.error('Errore nel caricamento risultati quiz:', err)
      } finally {
        this.isLoadingQuizResults = false
      }
    },
    enterQuizReviewMode() {
      this.isQuizReviewMode = true
      this.currentQuizQuestionIdx = 0
    },
    exitQuizReviewMode() {
      this.isQuizReviewMode = false
    },
    nextReviewQuestion() {
      if (this.currentQuizQuestionIdx < this.quizQuestions.length - 1) {
        this.currentQuizQuestionIdx++
      }
    },
    prevReviewQuestion() {
      if (this.currentQuizQuestionIdx > 0) {
        this.currentQuizQuestionIdx--
      }
    },
    exitQuiz() {
      this.stopQuestionTimer()
      this.isQuizOngoing = false
      this.isQuizCompleted = false
      this.isQuizReviewMode = false
      this.currentQuizQuestionIdx = 0
      this.selectedQuizAnswers = {}
      this.quizResults = null
    },
  },
  beforeUnmount() {
    this.stopQuestionTimer()
    this.stopClientsPolling()
    if (this.controller) {
      this.controller.teardown()
      this.controller = null
    }
    this.stopAudio()
  },
}
</script>
