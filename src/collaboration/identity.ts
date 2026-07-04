import { ADJECTIVES, NOUNS, USER_COLORS } from './constants'
import type { UserIdentity } from './types'

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function createRandomIdentity(): UserIdentity {
  return {
    name: `${randomItem(ADJECTIVES)} ${randomItem(NOUNS)}`,
    color: randomItem(USER_COLORS),
  }
}
