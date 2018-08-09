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
      value: '',
      feedback: {
        giveFeedback: false,
        feedbackType: null,
        feedbackMessage: null
      }
    }
    this.requestReason = ''
    this.isDraft = true
  }

  updateRequestReason (value) {
    this.requestReason = value
    this.emit('change')
  }

  updateProduct (id, label, fromDropdown) {
    this.product.id = id
    this.product.label = label
    this.product.feedback.giveFeedback = true
    this.product.feedback.feedbackType = (fromDropdown ? 1 : -1)
    this.product.feedback.feedbackMessage = (fromDropdown
      ? '' : 'Please select a product option from the dropdown.')

    this.emit('change')
  }

  receiveProductPrice (response) {
    this.prices.normalPrice.value = response.price
    this.emit('change')
  }

  updateProductBlur (giveFeedback) {
    this.product.feedback.giveFeedback = giveFeedback
    this.emit('change')
  }

  requestedUnitsBlurred (giveFeedback) {
    this.units.feedback.giveFeedback = giveFeedback
    this.emit('change')
  }

  requestedPriceBlurred (giveFeedback) {
    this.prices.requestedPrice.feedback.giveFeedback = giveFeedback
    this.emit('change')
  }

  updateRequestedPrice (value) {
    let feedbackMessage

    this.price.requestedPrice.value = value
    this.price.requestedPrice.feedback.giveFeedback = true
    this.price.requestedPrice.feedback.feedbackType = (parseFloat(value) > 0 ? 1 : -1)

    if (!value) {
      feedbackMessage = 'This field is required.'
    } else if (isNaN(parseFloat(value))) {
      feedbackMessage = 'Numbers only please!'
    } else if (parseFloat(value) <= 0) {
      feedbackMessage = 'A positive non-zero price is required.'
    } else {
      feedbackMessage = null
    }

    this.price.requestedPrice.feedback.feedbackMessage = feedbackMessage
    this.emit('change')
  }

  updateRequestedUnits (value) {
    this.units.value = value
    this.units.feedback.giveFeedback = true

    let feedbackMessage

    const feedbackType = (parseInt(value) > 0 ? 1 : -1)

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
      feedbackType = (this.prices.requestedPrice.value >= this.prices.normalPrice.value
        ? -1 : 1)
      feedbackMessage = (this.prices.requestedPrice.value >= this.prices.normalPrice.value
        ? 'You dont need a special request to pay more or equal than our normal prices.' : '')
    }

    this.prices.requestedPrice.feedback.feedbackType = feedbackType
    this.prices.requestedPrice.feedback.feedbackMessage = feedbackMessage
    this.emit('change')
  }

  updateCustomer (id, label, fromDropdown) {
    this.customer.id = id
    this.customer.label = label
    this.customer.feedback.giveFeedback = true
    this.customer.feedback.feedbackType = (fromDropdown ? 1 : -1)
    this.customer.feedback.feedbackMessage = (fromDropdown
      ? '' : 'Please select a customer option from the dropdown.')

    this.emit('change')
  }

  updateCustomerBlur (giveFeedback) {
    this.customer.feedback.giveFeedback = giveFeedback
    this.emit('change')
  }

  getRequestReason () {
    return {
      'value': this.requestReason
    }
  }

  getProduct () {
    return {
      id: this.product.id,
      label: this.product.label,
      giveFeedback: this.product.feedback.giveFeedback,
      feedbackType: this.product.feedback.feedbackType,
      feedbackMessage: this.product.feedback.feedbackMessage
    }
  }

  getRequestedUnits () {
    return {
      value: this.units.value,
      giveFeedback: this.units.giveFeedback,
      feedbackType: this.units.feedbackType,
      feedbackMessage: this.units.feedbackMessage
    }
  }

  getCustomer () {
    return {
      id: this.customer.id,
      label: this.customer.label,
      giveFeedback: this.customer.feedback.giveFeedback,
      feedbackType: this.customer.feedback.feedbackType,
      feedbackMessage: this.customer.feedback.feedbackMessage
    }
  }

  getRequestedPrice () {
    return {
      value: this.prices.requestedPrice.value,
      giveFeedback: this.prices.requestedPrice.feedback.giveFeedback,
      feedbackType: this.prices.requestedPrice.feedback.feedbackType,
      feedbackMessage: this.prices.requestedPrice.feedback.feedbackMessage
    }
  }

  getNormalPrice () {
    return {
      value: this.prices.normalPrice.value
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
      case 'REQUESTED_UNITS_BLURRED': {
        this.requestedUnitsBlurred(action.giveFeedback)
        break
      }
      case 'REQUESTED_PRICE_BLURRED': {
        this.requestedPriceBlurred(action.giveFeedback)
        break
      }
      case 'UPDATE_REQUESTED_PRICE' : {
        this.updateRequestedPrice(action.value)
        break
      }
      case 'UPDATE_PRODUCT': {
        this.updateProduct(action.id, action.label, action.fromDropdown)
        break
      }
      case 'PRODUCT_BLURRED': {
        this.updateProductBlur(action.giveFeedback)
        break
      }
      case 'GET_PRODUCT_PRICE' : {
        this.receiveProductPrice(action.id)
        break
      }
      case 'RECEIVE_PRODUCT_PRICE': {
        this.receiveProductPrice(action.response)
        break
      }
      case 'UPDATE_REQUESTED_UNITS': {
        this.updateRequestedUnits(action.units)
        break
      }
      case 'UPDATE_REQUEST_REASON': {
        this.updateRequestReason(action.value)
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
