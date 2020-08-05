<template>
  <div class="main-container">
    <van-list
      finished-text="没有更多了"
      v-model="itemsParams.isLoading"
      :finished="!itemsParams.hasMore"
      @load="getItems"
    >
      <div
        class="list-item"
        v-for="item in items"
        :key="item.id"
      >
      </div>
    </van-list>
  </div>
</template>

<script>
  import { isTrue } from '../../utils/shared';
  import { List } from 'vant';
  export default {
    name: "index",
    components: {
      [List.name]: List
    },
    data: () => ({
      items: [],
      itemsParams: {
        page: 1,
        limit: 10,
        isLoading: false,
        hasMore: true,
      }
    }),
    methods: {
      async getItems() {
        //请求API
        const getItems = () => new Promise(resolve => {});

        const { isSuccess, data } = await getItems(this.itemsParams);
        if (isTrue(isSuccess)) {
          const items = data?.data?.list ?? [];
          this.items.push(...items);
          this.itemsParams.hasMore = this.itemsParams.limit === items.length;
          this.itemsParams.page++;
          this.itemsParams.isLoading = false;
        }
      }
    }
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