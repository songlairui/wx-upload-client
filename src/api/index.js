import axios from 'axios'

const http = axios.create({
  baseURL: 'http://10.5.24.107:7070'
})

export async function toast(action) {
  return http.post('/toast', { action })
}

export async function prepare(params) {
  return http.post('/prepares', params)
}

export async function qrcode() {
  return http.get('/login/qrcode')
}
export async function loginStatus() {
  return http.get('/login/status')
}
export async function loginInfo() {
  return http.get('/login/info')
}
