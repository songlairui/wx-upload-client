class DebugChannel {
  constructor(raw) {
    this.raw = raw
    this.firstStamp = 0
    this.latestStamp = 0
    this.channels = {}
  }
  clear() {
    this.channels = {}
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
    if (!this.firstStamp && payload.startAt) {
      this.firstStamp = payload.startAt
    }
    this.latestStamp = endAt
    this.channels[name].trace.push(Object.assign(payload, { endAt }))
  }
  traceEnd() {
    // TODO improve
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
