import type * as Y from 'yjs'

interface ChangedRange {
  start: number
  oldEnd: number
  newEnd: number
}

function findChangedRange(oldValue: string, newValue: string): ChangedRange {
  let start = 0
  while (
    start < oldValue.length &&
    start < newValue.length &&
    oldValue[start] === newValue[start]
  ) {
    start += 1
  }

  let oldEnd = oldValue.length
  let newEnd = newValue.length
  while (
    oldEnd > start &&
    newEnd > start &&
    oldValue[oldEnd - 1] === newValue[newEnd - 1]
  ) {
    oldEnd -= 1
    newEnd -= 1
  }

  return { start, oldEnd, newEnd }
}

export function applyTextDiff(ydoc: Y.Doc, yText: Y.Text, newValue: string): void {
  const oldValue = yText.toString()
  const { start, oldEnd, newEnd } = findChangedRange(oldValue, newValue)

  ydoc.transact(() => {
    if (oldEnd > start) {
      yText.delete(start, oldEnd - start)
    }

    if (newEnd > start) {
      yText.insert(start, newValue.slice(start, newEnd))
    }
  })
}
