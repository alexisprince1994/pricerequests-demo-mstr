import React, { Component } from 'react'

class RequestedPrice extends Component {
  constructor (props) {
    super(props)
    // Props

    // Other Expected Props
    // 1) validate(id, value)
    // 2) onChange(id, value)

    this.state = {'touched': false,
      'giveFeedback': this.props.giveFeedback,
      'requestedPrice': this.props.requestedPrice
    }

    // Event Binding
    this.handleBlur = this.handleBlur.bind(this)
  }

  handleBlur (event) {
    this.setState({'touched': true, 'giveFeedback': true})
  }

  shouldGiveFeedback () {
    // If they focused through it or the parent component recognizes
    // that the entire form was submitted without this being touched.
    return (this.state.touched || this.props.giveFeedback)
  }

  render () {
    let feedback
    let feedbackClassName
    const shouldGiveFeedback = (this.state.touched || this.props.giveFeedback)

    if (shouldGiveFeedback) {
      if (this.props.errorMessage) {
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

      <div className='col-3'>
        <label htmlFor='requestedPrice'>
              Requested Price
        </label>
        <input type='text'
          className={feedbackClassName}
          id='requestedPrice'
          onBlur={this.handleBlur}
          value={this.state.requestedPrice}
          placeholder={this.props.normalPrice}
          onChange={this.props.handleRequestedChange}
        />
        {feedback && feedback ? feedback : ''}
      </div>

    )
  }
}

export default RequestedPrice
