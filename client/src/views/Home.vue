<template>
  <div class="home-container">
    <div class="card secret-card">
      <div class="card-header">
        <span class="icon">💫</span>
        <h2>今日被宽恕的秘密</h2>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>正在寻找一段温暖的秘密...</p>
      </div>

      <div v-else-if="!hasSecret" class="empty-state">
        <span class="empty-icon">🌸</span>
        <p>{{ message }}</p>
        <button class="btn btn-primary" @click="goToConfess">
          分享第一个秘密
        </button>
      </div>

      <transition name="fade" v-else>
        <div class="secret-content" :key="secret?.id">
          <p class="secret-text">"{{ secret.content }}"</p>
          <div class="secret-footer">
            <span class="status-badge">{{ secret.status }}</span>
            <div class="secret-actions">
              <button
                class="btn-fav"
                :class="{ active: favorited }"
                @click="handleToggleFavorite"
                :title="favorited ? '取消收藏' : '收藏这个秘密'"
              >
                {{ favorited ? '❤️' : '🤍' }}
              </button>
              <button class="btn btn-secondary refresh-btn" @click="fetchRandomSecret">
                🔄 换一个
              </button>
            </div>
          </div>
        </div>
      </transition>

      <div class="card-actions">
        <button class="btn btn-primary" @click="goToConfess">
          我也想倾诉
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFavorites } from '../composables/useFavorites'

const router = useRouter()
const { version, isFavorited, toggleFavorite } = useFavorites()
const loading = ref(true)
const hasSecret = ref(false)
const secret = ref(null)
const message = ref('')

const favorited = computed(() => {
  void version.value
  return secret.value ? isFavorited(secret.value.id) : false
})

function handleToggleFavorite() {
  if (secret.value) {
    toggleFavorite(secret.value)
  }
}

async function fetchRandomSecret() {
  loading.value = true
  try {
    const response = await fetch('/api/secrets/random')
    const data = await response.json()
    hasSecret.value = data.hasSecret
    secret.value = data.secret
    message.value = data.message
  } catch (error) {
    console.error('获取秘密失败:', error)
    hasSecret.value = false
    message.value = '暂时无法连接到服务器'
  } finally {
    loading.value = false
  }
}

function goToConfess() {
  router.push('/confess')
}

onMounted(() => {
  fetchRandomSecret()
})
</script>

<style scoped>
.home-container {
  width: 100%;
  max-width: 600px;
}

.secret-card {
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

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(102, 126, 234, 0.3);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  margin-bottom: 30px;
}

.secret-content {
  padding: 20px 0;
}

.secret-text {
  font-size: 20px;
  line-height: 1.8;
  color: #333;
  font-style: italic;
  text-align: center;
  margin-bottom: 30px;
  padding: 0 10px;
}

.secret-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.secret-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-fav {
  width: 42px;
  height: 42px;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 0;
}

.btn-fav:hover {
  border-color: #f87171;
  transform: scale(1.1);
}

.btn-fav.active {
  border-color: #ef4444;
  background: #fef2f2;
  animation: heartPop 0.3s ease;
}

@keyframes heartPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.status-badge {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  color: #2d5a4a;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.refresh-btn {
  padding: 8px 20px;
  font-size: 14px;
  color: #666;
  background: #f0f0f0;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

.card-actions {
  margin-top: 40px;
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid #eee;
}
</style>
