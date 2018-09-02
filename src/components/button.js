import React from 'react'

import './button.less'

class Button extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}

    this.debug = this.debug.bind(this)
  }
  debug(...x) {
    if (this.props.onClick) {
      this.props.onClick()
    } else console.warn(...x)
  }
  render() {
    return this.props.pending ? (
      <span className="btn">{this.props.children}</span>
    ) : (
      <button onClick={this.debug}>{this.props.children}</button>
    )
  }
}

export default Button
