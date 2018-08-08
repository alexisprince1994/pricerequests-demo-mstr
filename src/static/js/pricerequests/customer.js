import React, { Component } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import * as PriceRequestActions from './data/PriceRequestActions'
import PriceRequestStore from './data/PriceRequestStore'

class Customer extends Component {
  constructor (props) {
    super(props)
    // Props

    this.handleBlur = this.handleBlur.bind(this)
    this.onSelect = this.onSelect.bind(this)

    this.reloadCustomer = this.reloadCustomer.bind(this)
    this.onInputChange = this.onInputChange.bind(this)

    // Other Expected Props
    // 1) validate(id, value)
    // 2) onChange(id, value)

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
    // console.log('PriceRequestStore.getCustomer() is ', PriceRequestStore.getCustomer())
    this.setState(PriceRequestStore.getCustomer(),
      () => this.buildFeedback())
  }

  buildFeedback () {
    let feedback

    if (this.state.giveFeedback) {
      if (this.state.selected) {
        this.setState({
          feedback: true
        })
      } else {
        this.setState({
          feedback: false
        })
      }
    } else {
      this.setState({
        feedback: null
      })
    }
  }

  onSelect (selected) {
    // Needing to use buildFeedback as a callback to make sure
    // we wait until the async call of setState is complete.
    console.log('onSelect from customer shows selected is ', selected)
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

  // isInvalid={(typeof (this.state.feedback) === 'object') ? undefined : true}
  render () {
    const { giveFeedback, feedbackType, feedbackMessage } = this.state
    const goodFeedback = (feedbackType === 1)
    const badFeedback = (feedbackType === -1 ? true : null)

    return (
      <div className={this.props.className}>
        <label htmlFor='customerName'>
          Customer Name
        </label>
        <div className='form-group row'>
          <AsyncTypeahead
            className='col-9 col-md-offset-4'
            onInputChange={this.onInputChange}
            isLoading={this.state.isLoading}
            onBlur={this.handleBlur}
            onChange={this.onSelect}
            isValid={goodFeedback}
            isInvalid={badFeedback}
            options={this.state.options}

            onSearch={query => {
              this.setState({isLoading: true})
              fetch(`http://127.0.0.1:5000/customers?q=${query}`)
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
      </div>

    )
  }
}

export default Customer
