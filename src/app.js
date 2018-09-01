import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'

import Button from './components/button'
import { toast } from './api'

const btnDict = {
  create: '创建小程序',
  upload: '上传',
  check: '检查状态',
  'admin-scan': 'Admin 扫码登陆'
}
import DebugChannel from './utils/channels'

const apiLog = new DebugChannel()
console.warn(apiLog)

class Naub extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loginStatus: 0,
      userInfo: {},
      qrImg: '',
      uploadStatus: 0,
      wxappId: '',
      webappId: '',
      channels: []
    }
    this.handleClick = this.handleClick.bind(this)
  }
  refreshLog() {
    this.setState(state => {
      state.channels = Object.values(apiLog.look())
      return state
    })
  }
  handleClick(btn) {
    const startAt = +new Date()
    const traceId = apiLog.traceStart(btn)
    this.refreshLog()
    return toast(btn).then(({ data: { data } }) => {
      apiLog.traceEnd(traceId, { startAt, data })
      this.refreshLog()
      switch (btn) {
        case 'setWxappId':
          return this.handleClick('check')
        case 'check':
          this.setState(state => Object.assign(state, data))
          break
        case 'qrcode':
          this.setState({ qrImg: data.qrcode })
          break
        case 'status':
        case 'info':

        default:
      }
    })
  }
  render() {
    return (
      <div className="main">
        <div className="actions">
          {[
            'create',
            'upload',
            'check',
            0,
            'setWxappId',
            0,
            'admin-scan',
            'admin-check',
            0,
            'qrcode',
            'status',
            'info'
          ].map(
            (btn, idx) =>
              btn ? (
                <Button key={idx} onClick={this.handleClick.bind(null, btn)}>
                  {btnDict[btn] || btn}
                </Button>
              ) : (
                <br key={idx} />
              )
          )}
        </div>
        <div className="meta">
          <pre>
            wxappId:
            {this.state.wxappId + '\n'}
            webappId:
            {this.state.webappId + '\n'}
          </pre>
        </div>
        <div className="qrImg">
          {this.state.qrImg ? <img src={this.state.qrImg} /> : ''}
        </div>
        <div className="api-log">
          <div className="channels">
            {this.state.channels.map(channel => (
              <div className="channel" key={channel.name}>
                {channel.name}
                <ul>
                  {channel.trace.map((trace, idx) => (
                    <li key={idx}>
                      <div className="stamp">
                        {trace.startAt} - {trace.endAt}
                      </div>
                      <pre className="payload">
                        {JSON.stringify(trace.data, null, 1)}
                      </pre>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<Naub />, document.querySelector('#app'))
