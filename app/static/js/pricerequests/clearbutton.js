import React, { Component } from 'react'

import * as PriceRequestActions from './data/PriceRequestActions'

class ClearButton extends Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }
  handleClick (event) {
    PriceRequestActions.clearForm()
    return false
  }

  render () {
    return (
      <div>
        <button
          className='btn btn-outline-info btn-lg'
          onClick={this.handleClick}
          type='button'
        >
      Clear
        </button>
      </div>

    )
  }
}

export default ClearButton
