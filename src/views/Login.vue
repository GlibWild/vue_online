<template>
  <section style="height: 100%">
    <LoginBackground/>
    <div class="login">
      <h1>登录</h1>
      <el-form
        :model="state.loginForm"
        status-icon
        :rules="state.rules"
        ref="loginFormRef"
        label-width="0"
      >
        <el-form-item label="" prop="userName">
          <el-input
            type="userName"
            v-model="state.loginForm.userName"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item label="" prop="password">
          <el-input
            type="password"
            v-model="state.loginForm.password"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSignIn()" :loading="state.loading">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </section>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { signIn, saveRefreshTime } from '../api/api'
import store from '@/store'
import router from '@/router'
import LoginBackground from '../components/LoginBackground.vue'
// const LoginBackground = defineComponent(() => import('../components/LoginBackground.vue'))
const state = reactive({
  loginForm: {
    userName: '' as string,
    password: '' as string
  } as any,
  rules: {
    userName: [
      {
        validator: (rule: any, value: any, callback: any) => {
          if (!value) {
            return callback(new Error('用户名不能为空'))
          }
        },
        trigger: 'blur'
      }
    ],
    password: [
      {
        validator: (rule: any, value: any, callback: any) => {
          if (!value) {
            return callback(new Error('密码不能为空'))
          }
        },
        trigger: 'blur'
      }
    ]
  } as any,
  loading: false
})
const loginFormRef = ref()
const onSignIn = () => {
  loginFormRef.value.validate((valid: boolean) => {
    if (!valid) return false
    try {
      state.loading = true
      signIn(state.loginForm).then(data => {
        console.log(data)
        setToken(data.token, data.expires_in)
        window.localStorage.user = JSON.stringify(data.userInfo)
      })
    } finally {
      state.loading = false
      router.replace(router.currentRoute.query.redirect + '' || '/')
    }
  })
}
const setToken = (token: any, expires: any) => {
  store.commit('saveToken', token)
  const curTime = new Date()
  const expireDate = new Date(curTime.setSeconds(curTime.getSeconds() + expires))
  store.commit('saveTokenExpire', expireDate)
  window.localStorage.refreshtime = curTime
  saveRefreshTime()
  window.localStorage.expires_in = expires
}
</script>
<style scoped>
.login {
  position: absolute;
  top: 50%;
  right: 10%;
  transform: translateY(-50%);
  width: 300px;
  height: 400px;
  background-color: #333;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  padding: 20px;
}

.login h1 {
  color: #fff;
  text-align: center;
  font-size: 32px;
  margin-bottom: 20px;
}

.login form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login .el-form-item {
  width: 100%;
  height: 40px;
  border: none;
  outline: none;
  background-color: #444;
  color: #fff;
  font-size: 18px;
  /* padding: 10px; */
  margin: 10px;
  border-radius: 5px;
}

.login button {
  width: 100%;
  height: 40px;
  border: none;
  outline: none;
  background-color: #222;
  color: #fff;
  font-size: 18px;
  /* padding: 10px; */
  /* margin: 10px; */
  border-radius: 5px;
  cursor: pointer;
}

.login button:hover {
  background-color: #111;
}
</style>
