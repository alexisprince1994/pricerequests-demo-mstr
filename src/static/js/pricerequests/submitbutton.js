import React, { Component } from 'react'

import * as PriceRequestActions from './data/PriceRequestActions'

class SubmitButton extends Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (event) {
    PriceRequestActions.submitForm()
    return false
  }

  render () {
    return (
      <div>
        <button
          className='btn btn-outline-success btn-lg'
          onClick={this.handleClick}
          type='button'
        >
      Submit
        </button>
      </div>

    )
  }
}

export default SubmitButton
