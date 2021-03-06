import React, { Component } from 'react'

class DropDownSearch extends Component {
  constructor (props) {
    super(props)
    // Props

    this.labelValue = props.labelValue
    this.value = props.value
    this.valueOptions = []

    const that = this
    props.valueOptions.forEach(val => that.valueOptions.push(<option data-tokens={val}> {val} </option>))

    // Other Expected Props
    // 1) validate(id, value)
    // 2) onChange(id, value)

    this.state = {'touched': false, 'giveFeedback': this.props.formSubmitted}

    // Event Binding
    this.handleBlur = this.handleBlur.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleBlur (event) {
    this.setState({'touched': true, 'giveFeedback': true})
  }

  shouldGiveFeedback () {
    return (this.state.touched || this.props.formSubmitted)
  }

  handleChange (event) {
    this.props.onChange(this.props.id, event.target.value)
  }

  render () {
    let feedback
    let feedbackClassName
    const shouldGiveFeedback = this.shouldGiveFeedback()

    if (shouldGiveFeedback) {
      const validated = this.props.validator(this.props.id, this.props.value)
      if (validated) {
        feedback = <div className='valid-feedback' />
        feedbackClassName = 'form-control is-valid'
      } else {
        feedback = <div className='invalid-feedback'> This field is required! </div>
        feedbackClassName = 'form-control is-invalid'
      }
    } else {
      feedbackClassName = 'form-control'
      feedback = false
    }

    return (

      <div className={this.props.className}>
        <label htmlFor={this.props.id}>
          {this.props.labelValue}
        </label>
        <select value={this.props.defaultValue}
          className={feedbackClassName + ' selectpicker'}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          id={this.props.id}
          data-live-search
        >
          {this.valueOptions}
        </select>

        {feedback && feedback ? feedback : ''}
      </div>

    )
  }
}

export default DropDownSearch
