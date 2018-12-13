<template>
  <div id="disqus_thread"></div>
</template>

<script>
  export default {
    mounted() {
      const disqus_config = function () {
        this.page.url = window.location.origin
        this.page.identifier = window.location.pathname
      }
      (function() {
        const d = document, s = d.createElement('script')
        s.src = 'https://wiki-lucashan-space.disqus.com/embed.js'
        s.setAttribute('data-timestamp', +new Date())
        (d.head || d.body).appendChild(s)
      })()
    }
  }
</script>
