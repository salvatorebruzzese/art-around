import Alpine from 'alpinejs'

class QuickNav extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<div class="flex flex-row justify-center items-center gap-3">
  <div class="flex items-center gap-2">
    <!-- Home -->
    <a
      class="nav-icon-link group !p-0 !border-none shadow-sm rounded-xl hover:!bg-transparent"
      href="/home/"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="48"
          height="48"
          rx="12"
          fill="white"
          stroke="none"
          class="group-hover:fill-[var(--color-p-medium)] transition-colors"
        />
        <path
          d="M24 12 L10 24 H14 V36 H22 V28 H26 V36 H34 V24 H38 Z"
          fill="var(--color-p-medium)"
          class="group-hover:fill-[var(--color-p-light)] transition-colors"
        />
      </svg>
    </a>
    <!-- Marketplace -->
    <a
      class="nav-icon-link group !p-0 !border-none shadow-sm rounded-xl hover:!bg-transparent"
      href="/marketplace/"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="48"
          height="48"
          rx="12"
          fill="white"
          stroke="none"
          class="group-hover:fill-[var(--color-p-medium)] transition-colors"
        />
        <path
          d="M12 20 L15 12 H33 L36 20 V24 H34 V36 H14 V24 H12 V20 Z M18 24 V34 H30 V24 H18 Z M16 18 H32 L30 14 H18 L16 18 Z"
          fill="var(--color-p-medium)"
          class="group-hover:fill-[var(--color-p-light)] transition-colors"
        />
      </svg>
    </a>

    <!-- Dropdown Utente -->
    <div x-data="dropdown" class="avatar dropdown dropdown-center z-20">
      <button
        @click="open = !open"
        class="nav-avatar-trigger list-none cursor-pointer"
      >
        <!-- Temporary guest 'profile picuture' -->
        <img
          x-bind:src="user?.profilePicture ? '/api/assets/'+user.profilePicture : 'https://dummyimage.com/200x200/bbb/fff&text=U'"
        />
      </button>
      <div x-show="open" @click.outside="open = false">
        <ul class="nav-dropdown-menu mt-16">
          <template x-if="user">
            <div>
              <li>
                <a
                  class="shared-button-flex-secondary shadow-none"
                  href="/profile"
                  >Profilo</a
                >
              </li>
              <li>
                <button
                  class="shared-button-flex-warning shadow-none mt-2"
                  @click="$store.shared.logout()"
                >
                  Esci
                </button>
              </li>
            </div>
          </template>
          <template x-if="!user">
            <li>
              <a
                class="shared-button-flex-secondary shadow-none"
                href="/login"
                >Accedi</a
              >
            </li>
          </template>
        </ul>
      </div>
    </div>
    <!-- Editor -->
    <a
      class="nav-icon-link group !p-0 !border-none shadow-sm rounded-xl hover:!bg-transparent"
      href="/editor/"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="48"
          height="48"
          rx="12"
          fill="white"
          stroke="none"
          class="group-hover:fill-[var(--color-p-medium)] transition-colors"
        />
        <path
          transform="translate(24, 24) scale(0.85) translate(-24, -24)"
          d="M14 8 H26 L36 18 V38 A2 2 0 0 1 34 40 H14 A2 2 0 0 1 12 38 V10 A2 2 0 0 1 14 8 Z M26 11 V18 H33 L26 11 Z M18 22 V24 H30 V22 H18 Z M18 28 V30 H30 V28 H18 Z M18 34 V36 H26 V34 H18 Z"
          fill="var(--color-p-medium)"
          class="group-hover:fill-[var(--color-p-light)] transition-colors"
        />
      </svg>
    </a>
    <!-- Navigator -->
    <a
      class="nav-icon-link group !p-0 !border-none shadow-sm rounded-xl hover:!bg-transparent"
      href="/navigator/"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="48"
          height="48"
          rx="12"
          fill="white"
          stroke="none"
          class="group-hover:fill-[var(--color-p-medium)] transition-colors"
        />
        <path
          d="M24 8 A16 16 0 1 0 24 40 A16 16 0 0 0 24 8 Z M24 12 A12 12 0 1 1 24 36 A12 12 0 0 1 24 12 Z M18 30 L22 20 L32 16 L28 26 L18 30 Z M25.5 23.5 A1.5 1.5 0 1 0 25.5 20.5 A1.5 1.5 0 0 0 25.5 23.5 Z"
          fill="var(--color-p-medium)"
          class="group-hover:fill-[var(--color-p-light)] transition-colors"
        />
      </svg>
    </a>
  </div>
</div>
    `

    if (window.Alpine) {
      window.Alpine.initTree(this)
    }
  }
}

customElements.define('quick-nav', QuickNav)

document.addEventListener('alpine:init', () => {
  Alpine.data('dropdown', () => ({
    open: false,
    user: null,
    async init() {
      this.user = await Alpine.store('userManager').getUser()
    },
  }))
})
