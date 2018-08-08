import PriceRequestActions from './PriceRequestActions'
import PriceRequestDispatcher from './PriceRequestDispatcher'
import { EventEmitter } from 'events'

class PriceRequestStore extends EventEmitter {
  constructor () {
    super()
    this.customer = {
      'id': null,
      'label': '',
      'feedback': {
        'giveFeedback': false,
        'feedbackType': null,
        feedbackMessage: null
      }
    }

    this.product = {
      id: null,
      label: null,
      feedback: {
        giveFeedback: false,
        feedbackType: null,
        feedbackMessage: null
      }
    }

    this.prices = {
      normalPrice: {
        value: null
      },
      requestedPrice: {
        value: null,
        feedback: {
          giveFeedback: false,
          feedbackType: null,
          feedbackMessage: null
        }
      }
    }
    this.units = {
      value: null,
      feedback: {
        giveFeedback: false,
        feedbackType: null,
        feedbackMessage: null
      }
    }
    this.requestReason = null
    this.isDraft = true
  }

  updateRequestedUnits (value) {
    this.units.value = value
    this.units.feedback.giveFeedback = true

    let feedbackMessage
    let feedbackType

    feedbackType = (parseInt(value) > 0 ? 1 : -1)

    if (!value) {
      feedbackMessage = 'This field is required.'
    } else if (isNaN(parseInt(value))) {
      feedbackMessage = 'Numbers only please!'
    } else if (parseInt(value) <= 0) {
      feedbackMessage = 'A positive non-zero quantity is required.'
    } else {
      feedbackMessage = null
    }

    this.units.feedback.feedbackType = feedbackType
    this.units.feedback.feedbackMessage = feedbackMessage
    this.emit('change')
  }

  updateRequestedPrice (value) {
    this.prices.requestedPrice.value = value
    this.prices.requestedPrice.feedback.giveFeedback = true
    let feedbackType
    let feedbackMessage
    if (!this.prices.normalPrice.value) {
      feedbackType = -1
      feedbackMessage = 'Please select a product.'
    } else {
      feedbackType = (this.prices.requestedPrice.value >= this.prices.normalPrice.value ? -1 : 1)
      feedbackMessage = (this.prices.requestedPrice.value >= this.prices.normalPrice.value ? 'You dont need a special request to pay more or equal than our normal prices.' : '')
    }

    this.prices.requestedPrice.feedback.feedbackType = feedbackType
    this.prices.requestedPrice.feedback.feedbackMessage = feedbackMessage
    this.emit('change')
  }

  updateCustomer (id, label, fromDropdown) {
    console.log('updateCustomer from the store shows id, label, fromDropdown are', id, label, fromDropdown)
    this.customer.id = id
    this.customer.label = label
    this.customer.feedback.giveFeedback = true
    this.customer.feedback.feedbackType = (fromDropdown ? 1 : -1)
    this.customer.feedback.feedbackMessage = (fromDropdown ? '' : 'Please select a customer option from the dropdown.')

    // if (label) {
    //   this.customer.selected = [{id: this.customer.id, 'label': this.customer.label}]
    // } else {
    //   this.customer.selected = [{'id': null, 'label': ''}]

    this.emit('change')
  }

  updateCustomerBlur (giveFeedback) {
    this.customer.feedback.giveFeedback = giveFeedback
    this.emit('change')
  }

  getCustomer () {
    console.log('customerId from store is ', this.customer.id)

    return {
      id: this.customer.id,
      label: this.customer.label,
      giveFeedback: this.customer.feedback.giveFeedback,
      feedbackType: this.customer.feedback.feedbackType,
      feedbackMessage: this.customer.feedback.feedbackMessage
    }
  }

  handleActions (action) {
    switch (action.actionType) {
      case 'SUBMIT' : {
        this.createPriceRequest(action.data)
        break
      }
      case 'UPDATE_CUSTOMER': {
        this.updateCustomer(action.id, action.label, action.fromDropdown)
        break
      }
      case 'CUSTOMER_BLURRED': {
        this.updateCustomerBlur(action.giveFeedback)
        break
      }
      case 'UPDATE_REQUESTED_UNITS': {
        this.updateRequestedUnits(action.units)
        break
      }
      default : {
        console.log('default case called. action was ', action)
      }
    }
  }
}

const priceRequestStore = new PriceRequestStore()
PriceRequestDispatcher.register(priceRequestStore.handleActions.bind(priceRequestStore))
export default priceRequestStore
