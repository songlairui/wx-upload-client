import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'

import ButtonGroup from './components/button-group'
import { toast, quick } from './api'
import codes from './codes'

const btnDict = {
  create: '创建小程序',
  upload: '上传',
  check: '检查状态',
  'admin-scan': 'Admin 扫码登陆'
}
const defaultForm = {
  taskid: '',
  appid: '',
  projectname: '',
  webappid: 'random-id',
  zipurl:
    'http://paas-dist.oss-cn-hangzhou.aliyuncs.com/prod/update-package/paas-team/paasjira/beta/0.0.1/39e8c424-57dc-bcf8-db29-e9d6f885228f-miniProgram.zip'
}
import DebugChannel from './utils/channels'

const apiLog = new DebugChannel()

let timer = {
  queryTask: null
}

class Naub extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      form: {
        taskid: '',
        appid: '',
        projectname: '',
        webappid: 'random-id',
        zipurl:
          'http://paas-dist.oss-cn-hangzhou.aliyuncs.com/prod/update-package/paas-team/paasjira/beta/0.0.1/39e8c424-57dc-bcf8-db29-e9d6f885228f-miniProgram.zip'
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
    this.clearPolling = this.clearPolling.bind(this)
    this.clearTraces = this.clearTraces.bind(this)
  }
  clearPolling() {
    timer.queryTask && clearTimeout(timer.queryTask)
  }
  clearTraces() {
    this.setState(state => {
      state.channels = []
      return state
    })
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
  async handleClick(xhttp, btn) {
    if (!btn) {
      btn = xhttp
      xhttp = toast
    }
    console.warn('this', this)
    await this.validate(btn)
    const startAt = +new Date()
    const traceId = apiLog.traceStart(btn)
    this.setState(state => {
      state.btnStatus[btn] = true
    })
    this.refreshLog()
    console.warn('api', xhttp.name)
    return xhttp(
      btn,
      ['setWxappId', 'file', 'quick-upload', 'query-task'].includes(btn) &&
        this.state.form
    ).then(({ data }) => {
      apiLog.traceEnd(traceId, { startAt, data })
      if (!['quick-upload', 'query-task'].includes(btn)) {
        data = data.data
      }
      let again = true
      switch (btn) {
        case 'quick-upload':
          this.setState(state => {
            state.form.taskid = data.taskid
            return state
          })
          timer.queryTask && clearTimeout(timer.queryTask)
          timer.queryTask = setTimeout(() => {
            this.handleClick(quick, 'query-task')
          }, 2000)
          break
        case 'query-task':
          console.warn(data)
          switch (data.code) {
            case codes.UPLOAD_FINISH:
            case 400:
              again = false
              break
            case codes.SCAN_WAITING:
              this.setState(state => {
                if (data.data.qrcode) state.queryQR.qrcode = data.data.qrcode
                return state
              })
              break
            default:
          }
          if (again) {
            timer.queryTask && clearTimeout(timer.queryTask)
            timer.queryTask = setTimeout(() => {
              this.handleClick(quick, btn)
            }, 2000)
          }

          break
        case 'setWxappId':
          this.handleClick('check')
          break
        case 'check':
          this.setState(state => {
            Object.assign(state, data)
            Object.keys(data.appInfo).forEach(key => {
              !data.appInfo[key] && delete data.appInfo[key]
            })
            Object.assign(state.form, defaultForm, data.appInfo)
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
        return state
      })
      this.refreshLog()
    })
  }
  handleChange(type, e) {
    if (!e) return
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
        <div className="meta">常用小程序id: wx898945e5568b4ea3</div>
        <div className="actions">
          <ButtonGroup
            btnStatus={this.state.btnStatus}
            btnNames={['quick-upload', 'query-task']}
            btnDict={btnDict}
            onClick={this.handleClick.bind(this, quick)}
          />

          {['taskid', 'webappid', 'zipurl', 'appid'].map(
            key =>
              key ? (
                <div className="input-item" key={key}>
                  <span>{`${key}:`}</span>
                  <input
                    type="text"
                    value={this.state.form[key]}
                    onChange={this.handleChange.bind(this, key)}
                    placeholder={`请输入 ${key}`}
                  />
                </div>
              ) : (
                <br />
              )
          )}
          <ButtonGroup
            btnStatus={this.state.btnStatus}
            btnNames={[
              'setWxappId',
              'file',
              0,
              'check',
              'report',
              'admin-scan',
              'admin-check',
              'qrcode',
              'status',
              'info',
              'ticket',
              'compile',
              'commit',
              'sync'
            ]}
            btnDict={btnDict}
            onClick={this.handleClick}
          />
          <button onClick={this.clearPolling}>clear timer</button>
          <button onClick={this.clearTrace}>clear traces</button>
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
