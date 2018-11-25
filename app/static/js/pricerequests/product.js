import React, { Component } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import RequestedPrice from './requestedprice'
import RequestedUnits from './requestedunits'

import * as PriceRequestActions from './data/PriceRequestActions'
import PriceRequestStore from './data/PriceRequestStore'

class Product extends Component {
  constructor (props) {
    super(props)
    // Props

    this.onSelect = this.onSelect.bind(this)
    this.handleBlur = this.handleBlur.bind(this)

    // Other Expected Props
    // 1) validate(id, value)
    // 2) onChange(id, value)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.reloadProduct = this.reloadProduct.bind(this)
    const defaultLoading = {isLoading: false}
    this.state = Object.assign({}, PriceRequestStore.getProduct(), defaultLoading)
  }

  componentDidMount () {
    PriceRequestStore.on('change', this.reloadProduct)
  }

  componentWillUnmount () {
    PriceRequestStore.removeListener('change', this.reloadProduct)
  }

  onInputChange (label) {
    PriceRequestActions.updateProduct(null, label, false)
  }

  reloadProduct () {
    this.setState(PriceRequestStore.getProduct(),
      () => {
        if (this.state.shouldClear) {
          this.typeahead.getInstance().clear()
        }
      })
  }

  handleInputChange (label) {
    PriceRequestActions.updateProduct(null, label, false)
  }

  handleBlur (event) {
    PriceRequestActions.productBlurred()
  }

  onSelect (selected) {
    // Ensures that if we are deleting a previously selected value
    // that we are able to select a new one. Otherwise it will default
    // back to whatever was first selected.

    if (selected.length !== 0) {
      const selectedObj = selected[0]
      PriceRequestActions.updateProduct(selectedObj.id, selectedObj.label, true)
      PriceRequestActions.getProductPrice(selectedObj.id)
    }
  }

  render () {
    let { feedbackMessage } = this.state
    const { giveFeedback, feedbackType, shouldClear } = this.state
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
            onChange={this.onSelect}
            onBlur={this.handleBlur}
            isInvalid={badFeedback}
            ref={(typeahead) => this.typeahead = typeahead}
            isValid={goodFeedback}
            options={this.state.options}
            onSearch={query => {
              this.setState({isLoading: true})
              fetch(`products?q=${query}`, {
                credentials: 'include'
              })
                .then(res => res.json())
                .catch(err => console.log('There was an error fetching products. ', err))
                .then(json => this.setState({
                  isLoading: false,
                  options: json
                })
                )
            }
            }
          />

        </div>
        <small id='productNameHelp' className='form-text text-muted'>
          {(feedbackMessage && feedbackMessage) ? feedbackMessage : ''}
        </small>
      </div>

    )
  }
}

export default Product
