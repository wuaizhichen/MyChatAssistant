<template>
  <div class="markdown-renderer" v-html="renderedContent"></div>
</template>

<script>
import { renderMarkdown } from '@/utils'

export default {
  name: 'MarkdownRenderer',
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  computed: {
    renderedContent() {
      return renderMarkdown(this.content)
    }
  }
}
</script>

<style lang="scss">
.markdown-renderer {
  font-size: 15px;
  line-height: 1.7;
  color: #333;
  word-break: break-word;

  p {
    margin: 0 0 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 20px 0 10px;
    font-weight: 600;
    line-height: 1.4;
  }

  h1 { font-size: 1.6em; }
  h2 { font-size: 1.4em; }
  h3 { font-size: 1.2em; }

  ul, ol {
    padding-left: 24px;
    margin: 8px 0;
  }

  li {
    margin: 4px 0;
  }

  blockquote {
    margin: 12px 0;
    padding: 8px 16px;
    border-left: 4px solid #ddd;
    background: #f9f9f9;
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
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: #fafafa;
    }
  }

  code {
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  }

  .hljs-code-block {
    margin: 12px 0;
    border-radius: 8px;
    overflow: hidden;
    background: #1e1e1e;

    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 12px;
      background: #2d2d2d;

      .code-lang {
        color: #999;
        font-size: 12px;
      }

      .copy-btn {
        background: none;
        border: 1px solid #555;
        color: #ccc;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;

        &:hover {
          background: #3d3d3d;
          color: #fff;
        }
      }
    }

    code {
      display: block;
      padding: 16px;
      overflow-x: auto;
      background: transparent;
      color: #d4d4d4;
      font-size: 14px;
      line-height: 1.5;
    }
  }

  hr {
    border: none;
    border-top: 1px solid #e8e8e8;
    margin: 16px 0;
  }

  img {
    max-width: 100%;
    border-radius: 8px;
  }
}
</style>
