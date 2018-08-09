import React, { Component } from 'react'
import * as PriceRequestActions from './data/PriceRequestActions'
import './css/checkbox.css'

class IsDraft extends Component {
  constructor (props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.state = {'checked': this.props.checked}
  }

  handleChange (event) {
    this.setState({
      checked: event.target.checked
    })
    PriceRequestActions.updateDraft(event.target.checked)
  }

  render () {
    return (
      <div className='form-check'>
        <label>
          <input
            type='checkbox'
            name='check'
            className='form-check-input'
            checked={this.state.checked}
            id='isDraft'
            onChange={this.handleChange}
          />
          <span className='label-text'> Draft </span>
        </label>

      </div>
    )
  }
}

export default IsDraft
