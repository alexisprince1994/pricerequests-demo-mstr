import React, { Component } from 'react'
import * as PriceRequestActions from './data/PriceRequestActions'
import PriceRequestStore from './data/PriceRequestStore'

class RequestedPrice extends Component {
  constructor (props) {
    super(props)

    // Event Binding
    this.handleBlur = this.handleBlur.bind(this)
    this.reloadRequestedPrice = this.reloadRequestedPrice.bind(this)
    this.state = PriceRequestStore.getRequestedPrice()
  }

  componentDidMount () {
    PriceRequestStore.on('change', this.reloadRequestedPrice)
  }

  componentWillUnmount () {
    PriceRequestStore.removeListener('change', this.reloadRequestedPrice)
  }

  handleBlur (event) {
    PriceRequestActions.requestedPriceBlurred()
  }

  handleChange (event) {
    PriceRequestActions.updateRequestedPrice(event.target.value)
  }

  reloadRequestedPrice () {
    this.setState(PriceRequestStore.getRequestedPrice())
  }

  render () {
    let feedback
    let feedbackClassName

    if (this.state.giveFeedback) {
      if (this.state.feedbackMessage) {
        feedback = <div className='invalid-feedback'>{this.state.feedbackMessage}</div>
        feedbackClassName = 'form-control is-invalid'
      } else {
        feedback = <div className='valid-feedback' />
        feedbackClassName = 'form-control is-valid'
      }
    } else {
      feedbackClassName = 'form-control'
      feedback = false
    }

    if (this.state.shouldClear) {
      feedbackClassName = 'form-control'
      feedback = false
    }

    return (

      <div>
        <input type='text'
          className={feedbackClassName}
          id='requestedPrice'
          onBlur={this.handleBlur}
          value={this.state.value}
          onChange={this.handleChange}
        />
        {feedback && feedback ? feedback : ''}
      </div>

    )
  }
}

export default RequestedPrice
