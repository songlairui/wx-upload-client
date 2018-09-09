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
      form: {
        appid: '',
        projectname: ''
      },
      loginStatus: 0,
      userInfo: {},
      qrImg: '',
      uploadStatus: 0,
      wxappid: '',
      webappid: '',
      channels: [],
      queryQR: {},
      btnStatus: {
        create: false,
        upload: true,
        check: false,
        setWxappId: false,
        'admin-scan': false,
        'admin-check': false,
        qrcode: false,
        status: false,
        info: false
      }
    }
    this.handleClick = this.handleClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.validate = this.validate.bind(this)
  }
  refreshLog() {
    this.setState(state => {
      state.channels = Object.values(apiLog.look())
      return state
    })
  }
  async validate(btn) {
    switch (btn) {
      case 'qrcode':
        if (this.state.userInfo.signatureExpiredTime > +new Date()) {
          throw new Error('上次登陆在有效期内')
        }
        break
      default:
    }
  }
  async handleClick(btn) {
    await this.validate(btn)
    const startAt = +new Date()
    const traceId = apiLog.traceStart(btn)
    this.setState(state => {
      state.btnStatus[btn] = true
    })
    this.refreshLog()

    return toast(btn, ['setWxappId'].includes(btn) && this.state.form).then(({ data: { data } }) => {
      apiLog.traceEnd(traceId, { startAt, data })
      switch (btn) {
        case 'setWxappId':
          this.handleClick('check')
          break
        case 'check':
          this.setState(state => {
            Object.assign(state, data)
            state.form.appid = state.appInfo.appid || state.form.appid
            return state
          })
          break
        case 'qrcode':
          if (data.qrcode) {
            this.setState(state => {
              state.queryQR.qrcode = data.qrcode
            })
            this.handleClick('status')
          }
          break
        case 'status':
          switch (data.wx_errcode) {
            case 405:
              this.handleClick('info')
              break
            case 404:
            case 408:
              this.handleClick('status')
              break
            default:
          }
          break
        case 'info':

        default:
      }

      this.setState(state => {
        state.btnStatus[btn] = false
      })
      this.refreshLog()
    })
  }
  handleChange(type, e){
    if(!e) return
    const value = e.target.value
    this.setState(state => {
      state.form[type] = value
      return state
    })
  }
  componentDidMount() {
    this.handleClick('check')
  }
  render() {
    return (
      <div className="main">
        <div className="meta">
          {['appid', 'projectname'].map(key => (
            <input type="text" key={key} value={this.state.form[key]} onChange={this.handleChange.bind(this, key)} placeholder={`请输入 ${key}`}/>
          ))}
          常用小程序id: wx898945e5568b4ea3
        </div>
        <div className="actions">
          {[
            'setWxappId',
            0,
            'create',
            'upload',
            'check',
            0,
            'admin-scan',
            'admin-check',
            0,
            'qrcode',
            'status',
            'info',
            0,
            'ticket',
            0,
            'compile',
            'commit',
            'sync'
          ].map(
            (btn, idx) =>
              btn ? (
                <Button
                  pending={this.state.btnStatus[btn]}
                  key={idx}
                  onClick={this.handleClick.bind(null, btn)}
                >
                  {btnDict[btn] || btn}
                </Button>
              ) : (
                <br key={idx} />
              )
          )}
        </div>
        <div className="meta">
          <pre>
            wxappid:
            {this.state.wxappid + '\n'}
            webappid:
            {this.state.webappid + '\n'}
          </pre>
        </div>
        <div className="qrImg">
          {this.state.queryQR.qrcode ? (
            <img width="192" src={this.state.queryQR.qrcode} />
          ) : (
            <div className="img" />
          )}
        </div>
        <div className="api-log">
          <div className="channels">
            {this.state.channels.map(channel => (
              <div className="channel" key={channel.name}>
                {channel.name}
                <ul>
                  {channel.trace.reverse().map((trace, idx) => (
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
