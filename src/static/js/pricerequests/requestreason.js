import React, { Component } from 'react'

import * as PriceRequestActions from './data/PriceRequestActions'
import PriceRequestStore from './data/PriceRequestStore'

class RequestReason extends Component {
  constructor (props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.reloadRequestReason = this.reloadRequestReason.bind(this)

    this.state = PriceRequestStore.getRequestReason()
  }

  componentDidMount () {
    PriceRequestStore.on('change', this.reloadRequestReason)
  }

  componentWillUnmount () {
    PriceRequestStore.removeListener('change', this.reloadRequestReason)
  }

  handleChange (event) {
    PriceRequestActions.updateRequestReason(event.target.value)
  }

  reloadRequestReason () {
    this.setState(PriceRequestStore.getRequestReason())
  }

  render () {
    return (
      <div className='col-9'>
        <textarea
          className='form-control'
          id='requestReason'
          rows='3'
          onChange={this.handleChange}
          value={this.state.value}
        />
      </div>
    )
  }
}

export default RequestReason
