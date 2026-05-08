<template>
  <div class="chat-input">
    <div class="input-wrapper">
      <el-input
        ref="inputRef"
        v-model="inputText"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 6 }"
        placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
        :disabled="disabled"
        @keydown.native="handleKeydown"
      />
      <div class="input-actions">
        <el-button
          v-if="disabled"
          type="danger"
          circle
          size="small"
          icon="el-icon-video-pause"
          @click="$emit('stop')"
        />
        <el-button
          v-else
          type="primary"
          circle
          size="small"
          icon="el-icon-s-promotion"
          :disabled="!inputText.trim()"
          @click="handleSend"
        />
      </div>
    </div>
    <div class="input-footer">
      <span class="footer-text">AI 可能会犯错，请核实重要信息</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatInput',
  props: {
    disabled: Boolean
  },
  data() {
    return {
      inputText: ''
    }
  },
  methods: {
    handleKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.handleSend()
      }
    },
    handleSend() {
      const text = this.inputText.trim()
      if (!text || this.disabled) return
      this.$emit('send', text)
      this.inputText = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-input {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: #f7f7f8;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 8px 12px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
  }

  ::v-deep .el-textarea__inner {
    border: none;
    background: transparent;
    resize: none;
    padding: 4px 0;
    font-size: 15px;
    line-height: 1.5;
    box-shadow: none !important;
  }
}

.input-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.input-footer {
  text-align: center;
  margin-top: 8px;

  .footer-text {
    font-size: 12px;
    color: #b4b4b4;
  }
}
</style>
