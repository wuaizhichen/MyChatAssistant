<template>
  <div class="settings-page">
    <div class="settings-header">
      <el-button icon="el-icon-arrow-left" type="text" @click="$router.push('/chat')">
        返回聊天
      </el-button>
      <h2>设置</h2>
    </div>

    <div class="settings-content">
      <el-card class="settings-card">
        <div slot="header" class="card-header">
          <i class="el-icon-cpu"></i>
          <span>模型设置</span>
        </div>
        <el-form label-width="100px" label-position="left">
          <el-form-item label="AI 模型">
            <el-select v-model="form.model" @change="handleSettingChange">
              <el-option label="GPT-3.5 Turbo" value="gpt-3.5-turbo" />
              <el-option label="GPT-4" value="gpt-4" />
              <el-option label="GPT-4 Turbo" value="gpt-4-turbo" />
              <el-option label="GPT-4o" value="gpt-4o" />
            </el-select>
          </el-form-item>
          <el-form-item label="温度">
            <el-slider
              v-model="form.temperature"
              :min="0"
              :max="2"
              :step="0.1"
              :format-tooltip="v => v.toFixed(1)"
              @change="handleSettingChange"
            />
            <div class="slider-tips">
              <span>精确</span>
              <span>创意</span>
            </div>
          </el-form-item>
          <el-form-item label="最大 Token">
            <el-input-number
              v-model="form.maxTokens"
              :min="256"
              :max="8192"
              :step="256"
              @change="handleSettingChange"
            />
          </el-form-item>
          <el-form-item label="流式输出">
            <el-switch v-model="form.streamEnabled" @change="handleSettingChange" />
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="settings-card">
        <div slot="header" class="card-header">
          <i class="el-icon-user"></i>
          <span>账户信息</span>
        </div>
        <el-form label-width="100px" label-position="left">
          <el-form-item label="用户名">
            <el-input :value="userInfo ? userInfo.username : '-'" disabled />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input :value="userInfo ? userInfo.email : '-'" disabled />
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="settings-card">
        <div slot="header" class="card-header">
          <i class="el-icon-monitor"></i>
          <span>界面设置</span>
        </div>
        <el-form label-width="100px" label-position="left">
          <el-form-item label="主题">
            <el-radio-group v-model="form.theme" @change="handleThemeChange">
              <el-radio-button label="light">浅色</el-radio-button>
              <el-radio-button label="dark">深色</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      form: {
        model: this.$store.getters['settings/model'],
        temperature: this.$store.getters['settings/temperature'],
        maxTokens: this.$store.getters['settings/maxTokens'],
        streamEnabled: this.$store.getters['settings/streamEnabled'],
        theme: this.$store.getters['settings/theme']
      }
    }
  },
  computed: {
    userInfo() {
      return this.$store.getters['user/userInfo']
    }
  },
  created() {
    this.$store.dispatch('user/getUserInfo').catch(() => {})
  },
  methods: {
    handleSettingChange() {
      this.$store.dispatch('settings/updateSettings', this.form)
      this.$message.success('设置已保存')
    },
    handleThemeChange() {
      this.$store.dispatch('settings/updateSettings', { theme: this.form.theme })
      document.body.className = this.form.theme === 'dark' ? 'dark-theme' : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-page {
  height: 100%;
  overflow-y: auto;
  background: #f5f5f5;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;

  h2 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }
}

.settings-content {
  padding: 24px;
  max-width: 680px;
  margin: 0 auto;
}

.settings-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 500;
  }
}

.slider-tips {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
