import { ref, onMounted, onUnmounted } from 'vue'

const STORAGE_KEY = 'secret_favorites'
const BACKUP_KEY = 'secret_favorites_backup'

const version = ref(0)
const errorMessage = ref('')
const listeners = new Set()

function clearError() {
  errorMessage.value = ''
}

function showError(msg) {
  errorMessage.value = msg
  listeners.forEach(fn => fn(msg))
  setTimeout(clearError, 3000)
}

function safeParse(raw) {
  try {
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) {
      throw new Error('数据格式错误')
    }
    for (const item of data) {
      if (!item || typeof item !== 'object' || !item.id || !item.content) {
        throw new Error('数据项格式错误')
      }
    }
    return data
  } catch (e) {
    throw new Error('收藏数据已损坏')
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return safeParse(raw)
  } catch (e) {
    try {
      const backupRaw = localStorage.getItem(BACKUP_KEY)
      if (backupRaw) {
        const backup = safeParse(backupRaw)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(backup))
        showError('收藏数据已从备份恢复')
        return backup
      }
    } catch (be) {
      // ignore backup failure
    }
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(BACKUP_KEY)
    } catch (ce) {
      // ignore cleanup failure
    }
    showError('收藏数据损坏，已重置为空')
    return []
  }
}

function saveToStorage(favorites) {
  try {
    const data = JSON.stringify(favorites)
    localStorage.setItem(BACKUP_KEY, data)
    localStorage.setItem(STORAGE_KEY, data)
    version.value++
    clearError()
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      showError('浏览器存储空间已满，无法保存收藏')
    } else if (e.name === 'SecurityError') {
      showError('浏览器隐私模式下无法使用收藏功能')
    } else {
      showError('保存收藏失败：' + (e.message || '未知错误'))
    }
    throw e
  }
}

function handleStorageEvent(event) {
  if (event.key === STORAGE_KEY && event.storageArea === localStorage) {
    version.value++
  }
}

export function useFavorites() {
  onMounted(() => {
    window.addEventListener('storage', handleStorageEvent)
  })

  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageEvent)
  })

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
    let action = ''

    if (index > -1) {
      favorites.splice(index, 1)
      action = '取消收藏'
    } else {
      favorites.unshift({
        id: secret.id,
        content: secret.content,
        status: secret.status,
        favoritedAt: new Date().toISOString()
      })
      action = '已收藏'
    }

    try {
      saveToStorage(favorites)
      return { success: true, action }
    } catch (e) {
      return { success: false, action, error: e.message }
    }
  }

  function removeFavorite(secretId) {
    const favorites = loadFromStorage()
    const index = favorites.findIndex(f => f.id === secretId)
    if (index > -1) {
      favorites.splice(index, 1)
      try {
        saveToStorage(favorites)
        return { success: true }
      } catch (e) {
        return { success: false, error: e.message }
      }
    }
    return { success: true }
  }

  function onError(callback) {
    listeners.add(callback)
    return () => listeners.delete(callback)
  }

  return {
    version,
    errorMessage,
    getFavorites,
    isFavorited,
    toggleFavorite,
    removeFavorite,
    onError
  }
}
