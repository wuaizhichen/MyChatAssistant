<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">🤖</div>
          <h2>智能聊天平台</h2>
          <p>登录以开始对话</p>
        </div>

        <el-tabs v-model="activeTab" stretch>
          <el-tab-pane label="登录" name="login">
            <el-form
              ref="loginForm"
              :model="loginForm"
              :rules="loginRules"
              @submit.native.prevent="handleLogin"
            >
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  placeholder="用户名"
                  prefix-icon="el-icon-user"
                  size="large"
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="密码"
                  prefix-icon="el-icon-lock"
                  size="large"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  :loading="loading"
                  size="large"
                  round
                  class="login-btn"
                  native-type="submit"
                >
                  登录
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="注册" name="register">
            <el-form
              ref="registerForm"
              :model="registerForm"
              :rules="registerRules"
              @submit.native.prevent="handleRegister"
            >
              <el-form-item prop="username">
                <el-input
                  v-model="registerForm.username"
                  placeholder="用户名"
                  prefix-icon="el-icon-user"
                  size="large"
                />
              </el-form-item>
              <el-form-item prop="email">
                <el-input
                  v-model="registerForm.email"
                  placeholder="邮箱"
                  prefix-icon="el-icon-message"
                  size="large"
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="密码"
                  prefix-icon="el-icon-lock"
                  size="large"
                  show-password
                />
              </el-form-item>
              <el-form-item prop="confirmPassword">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="确认密码"
                  prefix-icon="el-icon-lock"
                  size="large"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  :loading="loading"
                  size="large"
                  round
                  class="login-btn"
                  native-type="submit"
                >
                  注册
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>

        <div class="guest-entry">
          <el-divider>或者</el-divider>
          <el-button
            type="info"
            plain
            round
            size="large"
            class="guest-btn"
            icon="el-icon-view"
            @click="handleGuestLogin"
          >
            游客模式体验
          </el-button>
          <p class="guest-tip">游客模式下数据保存在本地，登录后可同步至云端</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { register } from '@/api/user'

export default {
  name: 'Login',
  data() {
    const validateConfirm = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    return {
      activeTab: 'login',
      loading: false,
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      loginRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      registerRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码至少6个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirm, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async handleLogin() {
      const valid = await this.$refs.loginForm.validate().catch(() => false)
      if (!valid) return

      this.loading = true
      try {
        await this.$store.dispatch('user/login', this.loginForm)
        this.$message.success('登录成功')
        this.$router.push('/')
      } catch (err) {
        this.$message.error(err.message || '登录失败')
      } finally {
        this.loading = false
      }
    },
    async handleRegister() {
      const valid = await this.$refs.registerForm.validate().catch(() => false)
      if (!valid) return

      this.loading = true
      try {
        await register({
          username: this.registerForm.username,
          email: this.registerForm.email,
          password: this.registerForm.password
        })
        this.$message.success('注册成功，请登录')
        this.activeTab = 'login'
        this.loginForm.username = this.registerForm.username
      } catch (err) {
        this.$message.error(err.message || '注册失败')
      } finally {
        this.loading = false
      }
    },
    handleGuestLogin() {
      this.$store.dispatch('user/enterGuestMode')
      this.$message.success('已进入游客模式')
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .logo {
    font-size: 48px;
    margin-bottom: 12px;
  }

  h2 {
    margin: 0 0 8px;
    color: #333;
    font-size: 24px;
  }

  p {
    color: #999;
    margin: 0;
  }
}

.login-btn {
  width: 100%;
}

.guest-entry {
  margin-top: 8px;

  .guest-btn {
    width: 100%;
  }

  .guest-tip {
    text-align: center;
    font-size: 12px;
    color: #b4b4b4;
    margin-top: 12px;
  }
}
</style>
