import React, { Component } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import * as PriceRequestActions from './data/PriceRequestActions'
import PriceRequestStore from './data/PriceRequestStore'

class Customer extends Component {
  constructor (props) {
    super(props)
    // Props

    // Binding functions
    this.handleBlur = this.handleBlur.bind(this)
    this.onSelect = this.onSelect.bind(this)
    this.reloadCustomer = this.reloadCustomer.bind(this)
    this.onInputChange = this.onInputChange.bind(this)

    // Initializing state w/ default values
    const customerDetails = PriceRequestStore.getCustomer()
    const defaultLoading = {isLoading: false}
    this.state = Object.assign({}, customerDetails, defaultLoading)
  }

  componentDidMount () {
    PriceRequestStore.on('change', this.reloadCustomer)
  }

  componentWillUnmount () {
    PriceRequestStore.removeListener('change', this.reloadCustomer)
  }

  onInputChange (label) {
    PriceRequestActions.updateCustomer(null, label, false)
  }

  reloadCustomer () {
    this.setState(PriceRequestStore.getCustomer(),
      () => {
        if (this.state.shouldClear) {
          this.typeahead.getInstance().clear()
        }
      })
  }

  onSelect (selected) {
    // Needing to use buildFeedback as a callback to make sure
    // we wait until the async call of setState is complete.

    if (selected.length !== 0) {
      const selectedObj = selected[0]
      PriceRequestActions.updateCustomer(selectedObj.id, selectedObj.label, true)
    }
  }

  handleBlur (event) {
    // Needing to use buildFeedback as a callback to make sure
    // we wait until the async call of setState is complete.
    PriceRequestActions.customerBlurred()
  }

  render () {
    const { giveFeedback, feedbackType, shouldClear } = this.state
    let { feedbackMessage } = this.state
    let goodFeedback = (feedbackType === 1)
    let badFeedback = (feedbackType === -1 ? true : null)

    goodFeedback = (!shouldClear ? goodFeedback : null)
    badFeedback = (!shouldClear ? badFeedback : null)
    feedbackMessage = (!shouldClear ? feedbackMessage : null)

    return (
      <div>
        <div className='form-group row'>
          <AsyncTypeahead
            className='col-9 col-md-offset-4'
            onInputChange={this.onInputChange}
            isLoading={this.state.isLoading}
            onBlur={this.handleBlur}
            onChange={this.onSelect}
            isValid={goodFeedback}
            isInvalid={badFeedback}
            ref={(typeahead) => this.typeahead = typeahead}
            options={this.state.options}
            onSearch={query => {
              this.setState({isLoading: true})
              fetch(`customers?q=${query}`, {
                credentials: 'include'
              })
                .then(res => res.json())
                .then(json => this.setState({
                  isLoading: false,
                  options: json
                }, () => console.log(json))
                )
            }
            }
          />
        </div>
        <small id='customerNameHelp' className='form-text text-muted'>
          {(feedbackMessage && feedbackMessage) ? feedbackMessage : ''}
        </small>
      </div>

    )
  }
}

export default Customer
