import React, { Component } from 'react'

class RequestedUnits extends Component {
  constructor (props) {
    super(props)
    // Props

    // Other Expected Props
    // 1) validate(id, value)
    // 2) onChange(id, value)

    this.state = {'touched': false,
      'giveFeedback': this.props.giveFeedback,
      'requestedUnits': this.props.requestedUnits
    }

    // Event Binding
    this.handleBlur = this.handleBlur.bind(this)
  }

  handleBlur (event) {
    this.setState({'touched': true, 'giveFeedback': true})
    this.props.handleUnitsBlur(event)
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
        <label htmlFor='requestedUnits'>
              Requested Units
        </label>
        <input type='text'
          className={feedbackClassName}
          id='requestedUnits'
          onBlur={this.handleBlur}
          value={this.state.requestedUnits}
          onChange={this.props.handleUnitsChange}
        />
        {feedback && feedback ? feedback : ''}
      </div>

    )
  }
}

export default RequestedUnits
