import axios from 'axios'

const hostname = location.hostname

const http = axios.create({
  baseURL: `http://${hostname}:7070`
})

export async function toast(action, payload) {
  return http.post('/toast', { action, payload })
}

export async function quick(action, payload) {
  return http.post(`/${action}`, payload)
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
