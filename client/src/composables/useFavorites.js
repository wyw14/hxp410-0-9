import { ref } from 'vue'

const STORAGE_KEY = 'secret_favorites'

const version = ref(0)

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  version.value++
}

export function useFavorites() {
  function getFavorites() {
    return loadFromStorage()
  }

  function isFavorited(secretId) {
    const favorites = loadFromStorage()
    return favorites.some(f => f.id === secretId)
  }

  function toggleFavorite(secret) {
    const favorites = loadFromStorage()
    const index = favorites.findIndex(f => f.id === secret.id)

    if (index > -1) {
      favorites.splice(index, 1)
    } else {
      favorites.unshift({
        id: secret.id,
        content: secret.content,
        status: secret.status,
        favoritedAt: new Date().toISOString()
      })
    }

    saveToStorage(favorites)
  }

  function removeFavorite(secretId) {
    const favorites = loadFromStorage()
    const index = favorites.findIndex(f => f.id === secretId)
    if (index > -1) {
      favorites.splice(index, 1)
      saveToStorage(favorites)
    }
  }

  return {
    version,
    getFavorites,
    isFavorited,
    toggleFavorite,
    removeFavorite
  }
}
