import React, { Component } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import * as PriceRequestActions from './data/pricerequestactions'
import PriceRequestStore from './data/pricerequeststore'

class Customer extends Component {
  constructor (props) {
    super(props)
    // Props

    this.handleBlur = this.handleBlur.bind(this)
    this.onSelect = this.onSelect.bind(this)
    this.reloadCustomer = this.reloadCustomer.bind(this)
    this.updateCustomer = this.updateCustomer.bind(this)

    // Other Expected Props
    // 1) validate(id, value)
    // 2) onChange(id, value)

    this.state = {
      'touched': false,
      'giveFeedback': this.props.formSubmitted,
      'isLoading': false,
      'feedback': null
    }
  }

  componentWillMount () {
    PriceRequestStore.on('change', this.reloadCustomer)
  }

  componentWillUnmount () {
    PriceRequestStore.removeListener('change', this.reloadCustomer)
  }

  updateCustomer (selected) {
    const selectedObj = selected[0]

    PriceRequestActions.updateCustomer(selectedObj.id, selectedObj.label)
  }

  reloadCustomer () {
    this.setState({
      selected: PriceRequestStore.getCustomer()
    }, () => this.buildFeedback())
  }

  buildFeedback () {
    let feedback

    if (this.state.touched || this.state.giveFeedback) {
      if (this.state.selected) {
        // Does a logic check to see if its null because null and
        // false-y should be handled differently... unfortunately.
        this.setState({
          feedback: !!(this.state.selected && this.state.selected)
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
    this.updateCustomer(selected)
    // this.buildFeedback()
    // this.setState({selected}, () => this.buildFeedback())
  }

  handleBlur (event) {
    // Needing to use buildFeedback as a callback to make sure
    // we wait until the async call of setState is complete.
    this.setState({
      'touched': true,
      'giveFeedback': true
    }, () => this.buildFeedback())
  }

  // isInvalid={(typeof (this.state.feedback) === 'object') ? undefined : true}
  render () {
    const { feedback } = this.state
    const { feedbackClassName } = this.state
    const { touched } = this.state
    const { giveFeedback } = this.state
    return (
      <div className={this.props.className}>
        <label htmlFor='customerName'>
          Customer Name
        </label>
        <div className='form-group row'>
          <AsyncTypeahead
            className='col-9 col-md-offset-4'
            isLoading={this.state.isLoading}
            onBlur={this.handleBlur}
            onChange={this.onSelect}
            isInvalid={(!feedback && (touched || giveFeedback)) ? true : null}
            isValid={this.state.feedback}
            options={this.state.options}
            selected={this.state.selected}
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
