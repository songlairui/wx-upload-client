import nanoid from 'nanoid'

class DebugChannel {
  constructor(raw) {
    this.raw = raw
    this.firstStamp = 0
    this.latestStamp = 0
    this.channels = {}
    this.dict = {}
  }
  clear() {
    this.channels = {}
    this.dict = {}
    this.firstStamp = 0
    this.latestStamp = 0
  }
  init(name) {
    if (typeof this.channels[name] === 'undefined') {
      this.channels[name] = { name, trace: [] }
      this.sync()
    }
  }
  trace(name, payload) {
    this.init(name)
    const endAt = +new Date()
    if (!this.firstStamp && payload && payload.startAt) {
      this.firstStamp = payload.startAt
    }
    this.latestStamp = endAt
    this.channels[name].trace.push(Object.assign(payload, { endAt }))
    return
  }
  traceStart(name, payload) {
    this.init(name)
    const startAt = +new Date()
    if (!this.firstStamp && payload && payload.startAt) {
      this.firstStamp = payload.startAt
    }
    const traceId = nanoid()
    this.dict[traceId] = name
    this.channels[name].trace.push(
      Object.assign({}, payload, { startAt, traceId })
    )
    return traceId
  }
  traceEnd(traceId, payload) {
    if (!traceId) return
    const name = this.dict[traceId]
    if (!name) return
    if (
      !this.channels[name] ||
      !this.channels[name].trace.find(item => item.traceId === traceId)
    ) {
      traceId = this.traceStart(name, payload)
    }
    const trace = this.channels[name].trace.find(
      item => item.traceId === traceId
    )
    const endAt = +new Date()
    Object.assign(trace, payload, { endAt })
  }
  sync() {
    this.raw && this.raw.splice(0, Infinity, ...Object.values(this.channels))
  }
  look() {
    return new Proxy(this.channels, {
      get(target, prop) {
        return target[prop]
      },
      set() {
        console.error('please do not modify outside')
        return false
      }
    })
  }
}

export default DebugChannel
