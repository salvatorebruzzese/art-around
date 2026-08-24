<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Museums List -->
    <div v-for="museum in museums" :key="museum.id" class="mb-8">
      <h2 class="text-xl font-bold underline mb-3 px-4 text-gray-800">
        {{ museum.title }}
      </h2>
      <!-- Horizontally swipeable tours -->
      <div class="overflow-x-auto px-2 -mx-2">
        <div class="flex flex-nowrap gap-4">
          <div
            v-for="tour in museum.tours"
            :key="tour.id"
            class="flex-none w-64 bg-white rounded-xl shadow relative"
          >
            <!-- Photo with overlay -->
            <div class="relative">
              <img
                :src="tour.photo"
                alt="tour"
                class="rounded-t-xl w-full h-36 object-cover"
                style="margin-left: 0; margin-right: 0"
              />
              <div
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-2 rounded-b-xl"
              >
                <div
                  class="text-xs text-white truncate"
                  :title="tour.review"
                  style="
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  "
                >
                  {{
                    tour.review.length > 60
                      ? tour.review.slice(0, 60) + '…'
                      : tour.review
                  }}
                </div>
              </div>
            </div>
            <!-- Info Area -->
            <div class="p-4 flex flex-col gap-1">
              <div class="font-semibold text-gray-900 text-base truncate">
                {{ tour.title }}
              </div>
              <div class="flex items-center text-xs text-gray-500 gap-2">
                <span>
                  <svg
                    class="inline w-4 h-4 mr-1 -mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 8v4l3 2"
                    ></path>
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    ></circle>
                  </svg>
                  {{ tour.time }} min
                </span>
                <span class="ml-3">
                  <svg
                    class="inline w-4 h-4 mr-1 -mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 8c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 4c-2.21 0-4 1.12-4 2.5v2.5h8V14.5c0-1.38-1.79-2.5-4-2.5z"
                    ></path>
                  </svg>
                  €{{ tour.price }}
                </span>
                <span
                  class="ml-auto bg-gray-100 rounded-full px-2 py-0.5 text-gray-600 text-xs"
                >
                  {{ tour.author }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- More Button -->
      <div class="text-right px-4 mt-2">
        <button
          class="text-sm font-medium text-blue-700 hover:underline"
          @click="onMore(museum)"
        >
          More &rarr;
        </button>
      </div>
    </div>

    <!-- NavBar Fixed Bottom -->
    <nav
      class="fixed z-40 bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-between px-5 py-2 shadow"
      style="min-height: 58px"
    >
      <button
        @click="showMenu = true"
        aria-label="Menu"
        class="p-2 rounded-full hover:bg-gray-200"
      >
        <svg
          class="h-6 w-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <button
        @click="showSearch = true"
        aria-label="Search"
        class="flex-1 mx-4"
      >
        <div
          class="flex items-center w-full bg-gray-100 rounded-full px-4 py-2"
        >
          <svg
            class="w-5 h-5 text-gray-500 mr-2"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-4.35-4.35"
            />
          </svg>
          <span class="text-gray-500 text-sm">Search...</span>
        </div>
      </button>
      <button
        @click="showProfile = true"
        aria-label="Profile"
        class="p-1 rounded-full hover:bg-gray-200"
      >
        <img
          v-if="user.avatar"
          :src="user.avatar"
          class="rounded-full w-9 h-9 object-cover border-2 border-blue-300"
          alt="profile"
        />
        <div
          v-else
          class="bg-blue-400 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-lg"
        >
          {{ user.initials }}
        </div>
      </button>
    </nav>

    <!-- Menu Overlay -->
    <transition name="fade">
      <div
        v-if="showMenu"
        class="fixed inset-0 z-50 bg-black/50 flex items-end"
        @click.self="showMenu = false"
      >
        <div class="w-full bg-white rounded-t-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="font-bold text-lg text-gray-800">Menu</div>
            <button
              @click="showMenu = false"
              class="text-gray-600 p-2 rounded hover:bg-gray-100"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ul class="space-y-4">
            <li>
              <button class="w-full text-left text-gray-700 font-medium">
                Home
              </button>
            </li>
            <li>
              <button class="w-full text-left text-gray-700 font-medium">
                Explore
              </button>
            </li>
            <li>
              <button class="w-full text-left text-gray-700 font-medium">
                My Tickets
              </button>
            </li>
            <li>
              <button class="w-full text-left text-gray-700 font-medium">
                Help
              </button>
            </li>
          </ul>
        </div>
      </div>
    </transition>

    <!-- Search Overlay -->
    <transition name="fade">
      <div
        v-if="showSearch"
        class="fixed inset-0 z-50 bg-black/50 flex items-end"
        @click.self="showSearch = false"
      >
        <div class="w-full bg-white rounded-t-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="font-bold text-lg text-gray-800">Search</div>
            <button
              @click="showSearch = false"
              class="text-gray-600 p-2 rounded hover:bg-gray-100"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <input
            type="text"
            v-model="search"
            class="w-full border rounded-lg px-4 py-2 mb-2"
            placeholder="Type to search tours, museums..."
          />
          <div v-if="search" class="mt-3">
            <div class="text-sm text-gray-500 mb-1">Results</div>
            <ul>
              <li
                v-for="item in searchResults"
                :key="item.id"
                class="py-2 border-b last:border-b-0"
              >
                <span class="text-gray-800 font-medium">{{ item.title }}</span>
                <span class="text-gray-400 text-xs block">{{ item.type }}</span>
              </li>
              <li v-if="!searchResults.length" class="text-gray-400 py-2">
                No results found.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition>

    <!-- Profile Overlay -->
    <transition name="fade">
      <div
        v-if="showProfile"
        class="fixed inset-0 z-50 bg-black/50 flex items-end"
        @click.self="showProfile = false"
      >
        <div class="w-full bg-white rounded-t-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <img
                v-if="user.avatar"
                :src="user.avatar"
                class="rounded-full w-12 h-12 object-cover border-2 border-blue-300"
              />
              <div
                v-else
                class="bg-blue-400 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg"
              >
                {{ user.initials }}
              </div>
              <div>
                <div class="font-bold text-lg text-gray-800">
                  {{ user.name }}
                </div>
                <div class="text-gray-500 text-sm">{{ user.email }}</div>
              </div>
            </div>
            <button
              @click="showProfile = false"
              class="text-gray-600 p-2 rounded hover:bg-gray-100"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ul class="space-y-3 mt-4">
            <li>
              <button class="w-full text-left text-gray-700 font-medium">
                Account Settings
              </button>
            </li>
            <li>
              <button class="w-full text-left text-gray-700 font-medium">
                Bookings
              </button>
            </li>
            <li>
              <button class="w-full text-left text-blue-700 font-medium">
                Log Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'MuseumsToursMobile',
  data() {
    return {
      museums: [
        {
          id: 1,
          title: 'Louvre Museum',
          tours: [
            {
              id: 101,
              title: 'Classic Masterpieces',
              photo:
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=480&q=80',
              review:
                'A wonderful and enlightening tour through the most famous artworks of the world. The guide was knowledgeable and engaging...',
              time: 90,
              price: 22,
              author: 'Marie Curie',
            },
            {
              id: 102,
              title: 'Ancient History Tour',
              photo:
                'https://images.unsplash.com/photo-1464983953574-0892a716854b?fit=crop&w=480&q=80',
              review:
                'The exhibits on ancient civilizations are spectacular. Highly recommend this in-depth journey for history lovers.',
              time: 70,
              price: 18,
              author: 'Paul Ricard',
            },
          ],
        },
        {
          id: 2,
          title: 'Uffizi Gallery',
          tours: [
            {
              id: 201,
              title: 'The Renaissance Route',
              photo:
                'https://images.unsplash.com/photo-1509228468518-180dd4864904?fit=crop&w=480&q=80',
              review:
                'A breathtaking experience surrounded by the art and genius of Florence. Beautifully curated tour.',
              time: 120,
              price: 25,
              author: 'G. Vasari',
            },
            {
              id: 202,
              title: 'Hidden Gems',
              photo:
                'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?fit=crop&w=480&q=80',
              review:
                "Found so many works I'd never noticed before. Our guide brought the gallery to life!",
              time: 100,
              price: 21,
              author: 'Marta Rossi',
            },
          ],
        },
      ],
      showMenu: false,
      showSearch: false,
      showProfile: false,
      search: '',
      user: {
        name: 'Anna Bianchi',
        email: 'anna.bianchi@email.com',
        avatar: '',
        initials: 'AB',
      },
    }
  },
  computed: {
    searchResults() {
      if (!this.search.trim()) return []
      const searchLower = this.search.toLowerCase()
      let results = []
      for (const m of this.museums) {
        if (m.title.toLowerCase().includes(searchLower)) {
          results.push({ id: 'm' + m.id, title: m.title, type: 'Museum' })
        }
        for (const t of m.tours) {
          if (t.title.toLowerCase().includes(searchLower)) {
            results.push({ id: 't' + t.id, title: t.title, type: m.title })
          }
        }
      }
      return results
    },
  },
  methods: {
    onMore(museum) {
      // Dummy: alert or route to more
      alert('More tours from ' + museum.title)
    },
  },
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
