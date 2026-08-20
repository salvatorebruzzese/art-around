export function createDragDropManager() {
  return {
    dragging: false,
    draggingIdx: null,
    draggingBoard: null,
    overIdx: null,
    overBoard: null,

    onDragStart(board, idx) {
      this.dragging = true
      this.draggingIdx = idx
      this.draggingBoard = board
      this.overIdx = null
      this.overBoard = null
    },

    onDragEnd() {
      this.dragging = false
      this.draggingIdx = null
      this.draggingBoard = null
      this.overIdx = null
      this.overBoard = null
    },

    onDragOver(board, idx) {
      if (
        this.dragging &&
        (this.draggingBoard !== board || this.draggingIdx !== idx)
      ) {
        this.overIdx = idx
        this.overBoard = board
      }
    },

    onDragLeave(board, idx) {
      if (this.overBoard === board && this.overIdx === idx) {
        this.overIdx = null
        this.overBoard = null
      }
    },

    isDragging(board, idx) {
      return (
        this.dragging &&
        this.draggingBoard === board &&
        this.draggingIdx === idx
      )
    },

    isOver(board, idx) {
      return (
        this.overBoard === board &&
        this.overIdx === idx &&
        this.dragging &&
        !(this.draggingBoard === board && this.draggingIdx === idx)
      )
    },
  }
}
