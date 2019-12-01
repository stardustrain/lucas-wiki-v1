<template>
  <ParentLayout>
    <template #page-bottom>
      <vue-disqus />
    </template>
  </ParentLayout>
</template>

<script>
  import ParentLayout from '@parent-theme/layouts/Layout'

  export default {
    components: {
      ParentLayout,
    },
  }
</script>
