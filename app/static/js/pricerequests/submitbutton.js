import React, { Component } from 'react'

import * as PriceRequestActions from './data/PriceRequestActions'

class SubmitButton extends Component {
  render () {
    return (
      <div>
        <button
          className='btn btn-outline-success btn-lg'
          onClick={this.props.handleSubmit}
          type='button'
        >
      Submit
        </button>
      </div>

    )
  }
}

export default SubmitButton
