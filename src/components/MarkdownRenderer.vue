<template>
  <div class="markdown-renderer" v-html="renderedContent"></div>
</template>

<script>
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

export default {
  name: 'MarkdownRenderer',
  props: {
    content: {
      type: String,
      default: ''
    },
    isStreaming: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    renderedContent() {
      const md = new MarkdownIt({
        html: false,
        linkify: true,
        typographer: true,
        highlight: (str, lang) => {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return '<pre class="hljs"><code>' +
                hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                '</code></pre>'
            } catch (__) {}
          }
          return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
        }
      })

      let result = md.render(this.content || '')
      if (this.isStreaming) {
        result = result.replace(/<\/code><\/pre>$/, '<span class="streaming-cursor">▋</span></code></pre>')
      }
      return result
    }
  }
}
</script>

<style lang="scss">
.markdown-renderer {
  line-height: 1.7;
  word-break: break-word;

  code {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
  }

  pre {
    background: #1e1e1e;
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    margin: 12px 0;

    code {
      background: transparent;
      padding: 0;
      color: #d4d4d4;
      font-size: 14px;
      line-height: 1.5;
    }
  }

  p {
    margin: 8px 0;
  }

  ul, ol {
    padding-left: 24px;
    margin: 8px 0;
  }

  li {
    margin: 4px 0;
  }

  blockquote {
    border-left: 4px solid #ddd;
    padding-left: 16px;
    margin: 12px 0;
    color: #666;
  }

  a {
    color: #409eff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;

    th, td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background: #f5f5f5;
    }
  }

  .streaming-cursor {
    display: inline-block;
    animation: blink 1s infinite;
    color: #409eff;
    font-weight: bold;
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
}
</style>
