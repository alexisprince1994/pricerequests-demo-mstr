import React, { Component } from 'react'

class CurrentPrice extends Component {
  render () {
    return (

      <div className='form-group'>
        <label htmlFor={this.props.id}>
          {this.props.labelValue}
        </label>

        <input
          className={this.props.className}
          type='text'
          value={this.props.value}
        />
      </div>
    )
  }
}

export default CurrentPrice
