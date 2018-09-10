import React, { Component } from 'react'

import Button from './button'

class ButtonGroup extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="btn-group">
        {this.props.btnNames.map(
          (btn, idx) =>
            btn ? (
              <Button
                pending={this.props.btnStatus[btn]}
                key={idx}
                onClick={this.props.onClick.bind(this, btn)}
              >
                {this.props.btnDict[btn] || btn}
              </Button>
            ) : (
              <br key={idx} />
            )
        )}
      </div>
    )
  }
}

export default ButtonGroup
