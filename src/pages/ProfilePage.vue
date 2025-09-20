<template>
  <q-dialog v-model="dialog" persistent no-shake position="bottom">
    <q-card class="fullscreen-dialog">
      <!-- Header Section with Gradient Background -->
      <div class="profile-header">
        <q-btn
          flat
          round
          icon="close"
          @click="closeProfileDialog"
          size="md"
          class="close-btn"
          color="white"
        />

        <!-- User Avatar -->
        <div class="avatar-container">
          <q-avatar size="120px" class="user-avatar">
            <q-icon name="person" size="60px" color="white" />
          </q-avatar>
        </div>

        <!-- User Name -->
        <div class="user-name">
          {{ authStore.userInfo.name || 'کاربر گرامی' }}
        </div>

        <!-- User Role Badge -->
        <div class="user-role-badge">
          <q-chip
            :label="authStore.userInfo.userRole || 'کاربر'"
            color="white"
            text-color="primary"
            size="md"
            class="role-chip"
          />
        </div>
      </div>

      <!-- Profile Information Cards -->
      <div class="profile-content">
        <div class="info-cards">
          <!-- Personal Info Card -->
          <q-card class="info-card" flat bordered>
            <q-card-section>
              <div class="card-header">
                <q-icon name="person_outline" size="24px" color="primary" />
                <span class="card-title">اطلاعات شخصی</span>
              </div>
              <q-separator class="q-my-md" />
              <div class="info-row">
                <span class="info-label">نام و نام خانوادگی:</span>
                <span class="info-value">{{ authStore.userInfo.name || 'نامشخص' }}</span>
              </div>
            </q-card-section>
          </q-card>

          <!-- Role Info Card -->
          <q-card class="info-card" flat bordered>
            <q-card-section>
              <div class="card-header">
                <q-icon name="work_outline" size="24px" color="primary" />
                <span class="card-title">نقش سازمانی</span>
              </div>
              <q-separator class="q-my-md" />
              <div class="info-row">
                <span class="info-label">سمت:</span>
                <span class="info-value">{{ authStore.userInfo.userRole || 'کاربر' }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Action Buttons -->
        <div class="action-section">
          <q-btn
            label="خروج از حساب کاربری"
            color="negative"
            size="lg"
            class="logout-btn"
            @click="logout"
            icon="logout"
            no-caps
            rounded
          />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const props = defineProps({
  modelValue: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])
const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const closeProfileDialog = () => {
  router.push('/')
}

const logout = () => {
  authStore.logout()
  router.push('/auth/login')
}
</script>

<style lang="scss" scoped>
.fullscreen-dialog {
  height: 100vh !important;
  max-height: 100vh !important;
  min-height: 100vh !important;
  border-radius: 0 !important;
  overflow: hidden;
}

// Profile Header with Gradient
.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px 60px;
  position: relative;
  text-align: center;
  color: white;

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 50%;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
      transition: all 0.3s ease;
    }
  }

  .avatar-container {
    margin: 20px 0;

    .user-avatar {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border: 4px solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
        border-color: rgba(255, 255, 255, 0.5);
      }
    }
  }

  .user-name {
    font-size: 28px;
    font-weight: 600;
    margin: 16px 0 8px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .user-role-badge {
    margin-top: 12px;

    .role-chip {
      font-weight: 500;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
    }
  }
}

// Profile Content
.profile-content {
  flex: 1;
  padding: 30px 20px;
  background: #f8f9fa;
  overflow-y: auto;

  .info-cards {
    margin-bottom: 30px;

    .info-card {
      margin-bottom: 20px;
      border-radius: 16px !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(102, 126, 234, 0.1) !important;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
        }
      }

      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;

        .info-label {
          font-size: 14px;
          color: #6c757d;
          font-weight: 500;
        }

        .info-value {
          font-size: 16px;
          color: #2c3e50;
          font-weight: 600;
          text-align: right;
        }
      }
    }
  }

  .action-section {
    padding: 20px 0;
    text-align: center;

    .logout-btn {
      width: 100%;
      max-width: 300px;
      height: 56px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

// Responsive Design
@media (max-width: 480px) {
  .profile-header {
    padding: 30px 15px 50px;

    .user-name {
      font-size: 24px;
    }

    .avatar-container .user-avatar {
      width: 100px !important;
      height: 100px !important;
    }
  }

  .profile-content {
    padding: 20px 15px;

    .info-cards .info-card {
      .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;

        .info-value {
          text-align: right;
          width: 100%;
        }
      }
    }
  }
}

// Animation for dialog entrance
:deep(.q-dialog__inner) {
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// Override Quasar dialog styles for fullscreen
:deep(.q-dialog__inner--minimized > div) {
  max-height: 100vh !important;
}

:deep(.q-dialog__inner) {
  max-height: 100vh !important;
}

// Smooth transitions for all interactive elements
* {
  transition: all 0.3s ease;
}
</style>
