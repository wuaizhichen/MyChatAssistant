<template>
  <div class="chat-layout">
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header" v-if="!sidebarCollapsed">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="small"
          round
          @click="handleNewChat"
          class="new-chat-btn"
        >
          <span>新建对话</span>
        </el-button>
        <el-button
          icon="el-icon-s-fold"
          size="small"
          circle
          @click="sidebarCollapsed = true"
          class="collapse-btn"
        />
      </div>
      <div class="sidebar-header collapsed-header" v-else>
        <el-button
          circle
          class="header-action-btn expand-btn"
          @click="sidebarCollapsed = false"
        >
          <span class="btn-icon">☰</span>
        </el-button>
        <el-button
          type="primary"
          circle
          class="header-action-btn"
          @click="handleNewChat"
        >
          <span class="btn-icon">+</span>
        </el-button>
      </div>
      <ConversationList
        :collapsed="sidebarCollapsed"
        @select="handleSelectConversation"
        @delete="handleDeleteConversation"
        @expand="sidebarCollapsed = false"
      />
      <div class="sidebar-footer" v-if="!sidebarCollapsed">
          <div class="guest-banner" v-if="isGuest">
            <div class="guest-info">
              <i class="el-icon-view"></i>
              <span>游客模式</span>
            </div>
            <el-button type="text" size="mini" @click="$router.push('/login')" class="login-link">
              登录账号
            </el-button>
          </div>
          <el-button
            type="text"
            icon="el-icon-setting"
            @click="$router.push('/settings')"
            class="footer-btn"
          >
            <span>设置</span>
          </el-button>
          <el-button
            type="text"
            icon="el-icon-switch-button"
            @click="handleLogout"
            class="footer-btn"
          >
            <span>{{ isGuest ? '退出' : '登出' }}</span>
          </el-button>
      </div>
    </div>
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import ConversationList from '@/components/ConversationList.vue'

export default {
  name: 'ChatLayout',
  components: { ConversationList },
  data() {
    return {
      sidebarCollapsed: false
    }
  },
  computed: {
    isGuest() {
      return this.$store.getters['user/isGuest']
    }
  },
  created() {
    this.$store.dispatch('chat/fetchConversations')
  },
  methods: {
    handleNewChat() {
      this.$router.push('/chat').catch(() => {})
    },
    handleSelectConversation(id) {
      this.$store.dispatch('chat/selectConversation', id)
      if (this.$route.params.id !== id) {
        this.$router.push(`/chat/${id}`).catch(() => {})
      }
    },
    handleDeleteConversation(id) {
      this.$confirm('确定删除此对话？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('chat/deleteConversation', id)
        this.$message.success('已删除')
      }).catch(() => {})
    },
    handleLogout() {
      const msg = this.isGuest ? '确定退出游客模式？' : '确定退出登录？'
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('user/logout')
        this.$router.push('/login')
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #f5f5f5;
}

.sidebar {
  width: 260px;
  background: #202123;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  flex-shrink: 0;

  &.collapsed {
    width: 64px;
  }
}

.sidebar-header {
  padding: 12px;
  display: flex;
  gap: 8px;
  align-items: center;

  .new-chat-btn {
    flex: 1;
  }

  .collapse-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.collapsed-header {
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  .header-action-btn {
    width: 36px;
    height: 36px;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &.el-button--primary {
      background: #409eff;
      border: none;
      color: #fff;
    }

    &:not(.el-button--primary) {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #fff;
    }

    &:hover {
      opacity: 0.85;
    }

    .btn-icon {
      font-size: 18px;
      line-height: 1;
    }
  }
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 4px;

  .footer-btn {
    color: #b4b4b4;
    font-size: 14px;

    &:hover {
      color: #fff;
    }
  }
}

.guest-banner {
  width: 100%;
  background: rgba(255, 165, 0, 0.15);
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .guest-info {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #ffa500;
    font-size: 13px;
  }

  .login-link {
    color: #409eff;
    font-size: 12px;
    padding: 0;

    &:hover {
      color: #66b1ff;
    }
  }
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
