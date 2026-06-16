<template>
  <div class="favorites-container">
    <transition name="fade">
      <div v-if="toastMessage" class="toast-container">
        <div class="toast" :class="toastType">
          {{ toastMessage }}
        </div>
      </div>
    </transition>

    <div class="card favorites-card">
      <div class="card-header">
        <span class="icon">❤️</span>
        <h2>我的收藏</h2>
        <p class="subtitle" v-if="favorites.length > 0">共 {{ favorites.length }} 个收藏的秘密</p>
      </div>

      <div v-if="favorites.length === 0" class="empty-state">
        <span class="empty-icon">💫</span>
        <p>还没有收藏任何秘密</p>
        <p class="empty-hint">在首页浏览秘密时，点击 ♡ 即可收藏</p>
        <button class="btn btn-primary" @click="goHome">
          去首页看看
        </button>
      </div>

      <transition-group name="list" tag="div" class="favorites-list" v-else>
        <div class="favorite-item" v-for="item in favorites" :key="item.id">
          <div class="favorite-content">
            <p class="favorite-text">"{{ item.content }}"</p>
            <div class="favorite-meta">
              <span class="status-badge">{{ item.status }}</span>
              <span class="favorite-time">{{ formatTime(item.favoritedAt) }}</span>
            </div>
          </div>
          <button
            class="btn-remove"
            @click="handleRemove(item.id)"
            title="取消收藏"
          >
            ✕
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFavorites } from '../composables/useFavorites'

const router = useRouter()
const { version, getFavorites, removeFavorite, onError } = useFavorites()
const toastMessage = ref('')
const toastType = ref('success')
let toastTimer = null
let unsubscribeError = null

function showToast(msg, type = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toastMessage.value = msg
  toastType.value = type
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

const favorites = computed(() => {
  void version.value
  return getFavorites()
})

function handleRemove(id) {
  const result = removeFavorite(id)
  if (result.success) {
    showToast('已取消收藏', 'success')
  }
}

function formatTime(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${h}:${m}`
}

function goHome() {
  router.push('/')
}

onMounted(() => {
  unsubscribeError = onError((msg) => {
    showToast(msg, 'error')
  })
})

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
  if (unsubscribeError) unsubscribeError()
})
</script>

<style scoped>
.favorites-container {
  width: 100%;
  max-width: 650px;
}

.favorites-card {
  animation: slideUp 0.6s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.card-header h2 {
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.subtitle {
  color: #999;
  font-size: 14px;
  margin-top: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
}

.empty-state p {
  color: #666;
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-hint {
  color: #999;
  font-size: 14px;
  margin-bottom: 30px;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 4px;
}

.favorite-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  background: #fafafa;
  border-radius: 15px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.favorite-item:hover {
  background: #f5f3ff;
  border-color: rgba(102, 126, 234, 0.2);
}

.favorite-content {
  flex: 1;
  min-width: 0;
}

.favorite-text {
  font-size: 15px;
  line-height: 1.7;
  color: #333;
  font-style: italic;
  margin-bottom: 10px;
  word-break: break-word;
}

.favorite-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  color: #2d5a4a;
  padding: 4px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.favorite-time {
  color: #bbb;
  font-size: 12px;
}

.btn-remove {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  background: white;
  color: #9ca3af;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}

.btn-remove:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
