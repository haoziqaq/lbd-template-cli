<template>
  <div class="main-container"></div>
</template>

<script>
import { isTrue } from '../../utils/shared'
export default {
  name: 'index',
  data: () => ({
    item: {},
  }),
  methods: {
    async getItem() {
      //模拟请求API
      const getItem = () => new Promise((resolve) => {})

      const { isSuccess, data } = await getItem(this.$route.query.id)
      if (isTrue(isSuccess)) {
        this.item = data?.data?.item ?? {}
      }
    },
  },
}
</script>

<style scoped lang="scss">
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
}
</style>