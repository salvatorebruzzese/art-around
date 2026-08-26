<template>
  <div
    v-if="isOpen || isAnimating || showPeek"
    class="swipe-overlay"
    :style="{
      transform: `translateY(${translateYValue}px)`,
      transition: isDragging
        ? 'none'
        : 'transform 0.3s cubic-bezier(0.33,1,0.68,1)',
      touchAction: 'none',
    }"
    @touchstart="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend="onTouchEnd"
    @mousedown="onMouseDown"
  >
    <div class="swipe-handle"></div>
    <div
      class="swipe-content"
      :style="{
        pointerEvents: isPeek ? 'none' : 'auto',
        opacity: isPeek ? 0.7 : 1,
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'swipeOverlay',
  data() {
    return {
      isOpen: false,
      isAnimating: false,
      startY: null,
      currentY: null,
      translateY: 0,
      isDragging: false,
      overlayHeight: 0,
      dragDirection: null,
      mouseMoveListener: null,
      mouseUpListener: null,
      peekHeight: 56, // Enough to show handle+bit of content
    }
  },
  computed: {
    showPeek() {
      return !this.isOpen && !this.isAnimating
    },
    isPeek() {
      return (
        this.showPeek &&
        this.translateYValue >= this.overlayHeight - this.peekHeight - 1
      )
    },
    translateYValue() {
      if (this.isOpen || this.isAnimating) {
        return this.translateY
      }
      return this.overlayHeight - this.peekHeight
    },
  },
  mounted() {
    this.overlayHeight = window.innerHeight
    window.addEventListener('resize', this.updateHeight)
    // Show as peek on mount
    this.isOpen = false
    this.isAnimating = false
    this.translateY = 0
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateHeight)
    this.removeMouseListeners()
  },
  methods: {
    isEventFromNoSwipe(e) {
      let el = e.target
      while (el) {
        if (
          el.classList &&
          (el.classList.contains('no-swipe') || // classical class check
            el.tagName.toLowerCase() === 'no-swipe') // tag check (Vue custom elements)
        ) {
          return true
        }
        el = el.parentNode
      }
      return false
    },
    updateHeight() {
      this.overlayHeight = window.innerHeight
    },
    openOverlay() {
      if (this.isOpen) return
      this.isOpen = true
      this.isAnimating = true
      this.translateY = this.overlayHeight - this.peekHeight
      this.$nextTick(() => {
        requestAnimationFrame(() => {
          this.translateY = 0
          setTimeout(() => {
            this.isAnimating = false
            this.translateY = 0
          }, 300)
        })
      })
    },
    closeOverlay() {
      if (!this.isOpen) return
      this.isAnimating = true
      this.translateY = this.overlayHeight - this.peekHeight
      setTimeout(() => {
        this.isOpen = false
        this.isAnimating = false
        this.translateY = 0
      }, 300)
    },
    onTouchStart(e) {
      if (
        (!this.isOpen && !this.isAnimating && !this.showPeek) ||
        (e.touches && e.touches.length !== 1)
      )
        return
      if (this.isEventFromNoSwipe(e)) return

      this.startY = e.touches[0].clientY
      this.currentY = this.startY
      this.isDragging = true
      this.dragDirection = null
    },
    onTouchMove(e) {
      if (
        !this.isDragging ||
        (!this.isOpen && !this.isAnimating && !this.showPeek)
      )
        return
      const touch = e.touches[0]
      const deltaY = touch.clientY - this.startY
      if (!this.dragDirection) {
        this.dragDirection =
          Math.abs(deltaY) > 5 ? (deltaY < 0 ? 'up' : 'down') : null
      }
      if (this.isOpen && deltaY > 0) {
        // drag down to close
        this.translateY = deltaY
      } else if (!this.isOpen && deltaY < 0) {
        // drag up to open from peek
        this.translateY = this.overlayHeight - this.peekHeight + deltaY
        if (this.translateY < 0) this.translateY = 0
      } else if (!this.isOpen && deltaY > 0) {
        // drag down even more - restrict
        this.translateY = this.overlayHeight - this.peekHeight + deltaY * 0.3
      }
    },
    onTouchEnd(e) {
      if (!this.isDragging) return
      this.isDragging = false
      const endY = e.changedTouches[0].clientY
      const deltaY = endY - this.startY
      if (this.isOpen && deltaY > this.overlayHeight / 4) {
        this.closeOverlay()
      } else if (!this.isOpen && deltaY < -this.peekHeight / 2) {
        this.openOverlay()
      } else {
        this.translateY = this.isOpen ? 0 : this.overlayHeight - this.peekHeight
      }
    },
    onMouseDown(e) {
      if (!this.isOpen && !this.isAnimating && !this.showPeek) return
      if (this.isEventFromNoSwipe(e)) return
      this.startY = e.clientY
      this.currentY = this.startY
      this.isDragging = true
      this.dragDirection = null
      this.mouseMoveListener = this.onMouseMove
      this.mouseUpListener = this.onMouseUp
      window.addEventListener('mousemove', this.mouseMoveListener)
      window.addEventListener('mouseup', this.mouseUpListener)
    },
    onMouseMove(e) {
      if (!this.isDragging) return
      const deltaY = e.clientY - this.startY
      if (!this.dragDirection) {
        this.dragDirection =
          Math.abs(deltaY) > 5 ? (deltaY < 0 ? 'up' : 'down') : null
      }
      if (this.isOpen && deltaY > 0) {
        this.translateY = deltaY
      } else if (!this.isOpen && deltaY < 0) {
        this.translateY = this.overlayHeight - this.peekHeight + deltaY
        if (this.translateY < 0) this.translateY = 0
      } else if (!this.isOpen && deltaY > 0) {
        this.translateY = this.overlayHeight - this.peekHeight + deltaY * 0.3
      }
    },
    onMouseUp(e) {
      if (!this.isDragging) return
      this.isDragging = false
      const deltaY = e.clientY - this.startY
      this.removeMouseListeners()
      if (this.isOpen && deltaY > this.overlayHeight / 4) {
        this.closeOverlay()
      } else if (!this.isOpen && deltaY < -this.peekHeight / 2) {
        this.openOverlay()
      } else {
        this.translateY = this.isOpen ? 0 : this.overlayHeight - this.peekHeight
      }
    },
    removeMouseListeners() {
      if (this.mouseMoveListener) {
        window.removeEventListener('mousemove', this.mouseMoveListener)
        this.mouseMoveListener = null
      }
      if (this.mouseUpListener) {
        window.removeEventListener('mouseup', this.mouseUpListener)
        this.mouseUpListener = null
      }
    },
  },
}
</script>

<style scoped>
.swipe-overlay {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: rgb(255, 255, 255);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -4px 24px 0 rgba(0, 0, 0, 0.14);
  will-change: transform;
  overflow: hidden;
  touch-action: none !important;
  pointer-events: auto;
}
.swipe-handle {
  width: 56px;
  height: 6px;
  background: #ccc;
  border-radius: 3px;
  margin: 14px auto 10px;
  cursor: grab;
  pointer-events: auto;
}
.swipe-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 20px 40px 20px;
  background: none;
  transition: opacity 0.2s;
}
</style>
