<template>
  <ParentLayout>
    <template v-if="!$page.frontmatter.disableDisqus" #page-bottom>
      <Disqus />
    </template>
  </ParentLayout>
</template>

<script>
import ParentLayout from "@parent-theme/layouts/Layout";

export default {
  components: {
    ParentLayout
  },
  watch: {
    $route(to, from) {
      if (to.path !== from.path) {
        if (typeof window !== "undefined" && window.DISQUS) {
          window.DISQUS.reset({ reload: true });
        }
      }
    }
  }
};
</script>

<style lang="css" scoped>
#disqus_thread {
  max-width: 740px;
  margin: 0 auto;
  padding: 2rem 2.5rem;
}
</style>
