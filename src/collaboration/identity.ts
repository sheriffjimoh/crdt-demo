import { ADJECTIVES, NOUNS, USER_COLORS } from './constants'
import type { UserIdentity } from './types'

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function createRandomIdentity(): UserIdentity {
  const color = randomItem(USER_COLORS)

  return {
    name: `${randomItem(ADJECTIVES)} ${randomItem(NOUNS)}`,
    color,
    colorLight: `${color}33`,
  }
}
