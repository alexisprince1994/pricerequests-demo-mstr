import React, { Component } from 'react'

class RequestReason extends Component {
  constructor (props) {
    super(props)
    this.state = {value: this.props.value}

    this.onChange = this.onChange.bind(this)
  }

  onChange (event) {
    this.setState({
      value: event.target.value
    })
  }
  // TO DO
  // FIGURE OUT WHY THIS DOESN'T ALIGN CORRECTLY.
  render () {
    return (
      <div className='form-group'>
        <label htmlFor='requestReason'> Reason for Request </label>
        <div className='form-group-row'>
          <div className='col-9'>
            <textarea className='form-control' id='requestReason' rows='3' />
          </div>
        </div>
      </div>
    )
  }
}

export default RequestReason
