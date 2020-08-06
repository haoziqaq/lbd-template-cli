<template>
  <div class="main-container"></div>
</template>

<script>
import { Toast } from 'vant'
import { isTrue, isDef } from '../../utils/shared'
import { validate } from '../../utils/validator'
export default {
  name: 'index',
  data: () => ({
    formData: {
      name: '',
      mobile: '',
      company: '',
    },
  }),
  methods: {
    async submit() {
      //模拟请求API
      const submit = () => new Promise((resolve) => {})

      const rules = [
        { name: 'name', required: true, message: '姓名不能为空' },
        { name: 'mobile', type: 'PHONE', message: '电话格式有误' },
        { name: 'company', required: true, message: '请选择您所在的公司' },
      ]
      const errorMessage = validate(this.form, rules)
      if (isDef(errorMessage)) {
        Toast(errorMessage)
        return
      }
      Toast.loading('正在提交')
      const { isSuccess } = await submit(this.formData)
      if (isTrue(isSuccess)) {
        Toast.loading('提交成功')
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