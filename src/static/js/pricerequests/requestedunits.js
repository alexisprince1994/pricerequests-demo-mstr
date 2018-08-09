import React, { Component } from 'react'
import * as PriceRequestActions from './data/PriceRequestActions'
import PriceRequestStore from './data/PriceRequestStore'

class RequestedUnits extends Component {
  constructor (props) {
    super(props)
    // Props

    // Event Binding
    this.handleBlur = this.handleBlur.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.reloadUnits = this.reloadUnits.bind(this)

    // Creating State from store
    this.state = PriceRequestStore.getRequestedUnits()
  }

  componentDidMount () {
    PriceRequestStore.on('change', this.reloadUnits)
  }

  componentWillUmount () {
    PriceRequestStore.removeListener('change', this.reloadUnits)
  }

  handleBlur (event) {
    PriceRequestActions.requestedUnitsBlurred()
  }

  handleChange (event) {
    PriceRequestActions.updateRequestedUnits(event.target.value)
  }

  reloadUnits () {
    this.setState(PriceRequestStore.getRequestedUnits())
  }

  render () {
    let feedback
    let feedbackClassName

    if (this.state.giveFeedback) {
      if (this.state.feedbackMessage) {
        feedback = <div className='invalid-feedback'>{this.props.errorMessage}</div>
        feedbackClassName = 'form-control is-invalid'
      } else {
        feedback = <div className='valid-feedback' />
        feedbackClassName = 'form-control is-valid'
      }
    } else {
      feedbackClassName = 'form-control'
      feedback = false
    }

    return (

      <div>
        <input type='text'
          className={feedbackClassName}
          id='requestedUnits'
          onBlur={this.handleBlur}
          value={this.state.value}
          onChange={this.handleChange}
        />
        {feedback && feedback ? feedback : ''}
      </div>

    )
  }
}

export default RequestedUnits
