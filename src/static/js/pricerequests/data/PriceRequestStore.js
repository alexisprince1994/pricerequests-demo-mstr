import PriceRequestActions from './PriceRequestActions'
import PriceRequestDispatcher from './PriceRequestDispatcher'
import { EventEmitter } from 'events'

const REQUEST_URL = 'http:127.0.0.1:5000/'

const CUSTOMER_DEFAULT = {
  'id': null,
  'label': '',
  valid: false,
  'feedback': {
    'giveFeedback': false,
    'feedbackType': null,
    feedbackMessage: null
  }
}

const PRODUCT_DEFAULT = {
  id: null,
  label: null,
  valid: false,
  feedback: {
    giveFeedback: false,
    feedbackType: null,
    feedbackMessage: null
  }
}

const PRICES_DEFAULT = {
  normalPrice: {
    value: ''
  },
  requestedPrice: {
    value: '',
    valid: false,
    feedback: {
      giveFeedback: false,
      feedbackType: null,
      feedbackMessage: null
    }
  }
}

const UNITS_DEFAULT = {
  value: '',
  valid: false,
  feedback: {
    giveFeedback: false,
    feedbackType: null,
    feedbackMessage: null
  }
}

const REQUESTED_REASON_DEFAULT = ''
const IS_DRAFT_DEFAULT = true
const VALIDATION_DEFAULT = {
  customer: false,
  product: false,
  requestedPrice: false,
  requestedUnits: false
}

class PriceRequestStore extends EventEmitter {
  constructor () {
    super()
    this.customer = Object.assign({}, CUSTOMER_DEFAULT)
    this.product = Object.assign({}, PRODUCT_DEFAULT)
    this.prices = Object.assign({}, PRICES_DEFAULT)
    this.units = Object.assign({}, UNITS_DEFAULT)
    this.requestReason = REQUESTED_REASON_DEFAULT
    this.isDraft = IS_DRAFT_DEFAULT
    this.validation = VALIDATION_DEFAULT
    this.formSubmitted = false
    this.isValid = false
  }

  validatePayload (data) {
    const invalidated = Object.values(data).filter(val => val !== true)
    return (!(invalidated.length > 0))
  }

  createPriceRequest () {
    const payload = {
      customerid: this.customer.id,
      productid: this.product.id,
      requestedPrice: parseFloat(this.prices.requestedPrice.value),
      units: parseInt(this.units.value),
      requestedReason: this.requestReason,
      isDraft: this.isDraft
    }

    const isPayloadValidated = this.validatePayload(this.validation)

    if (isPayloadValidated) {
      this.clearForm()
      this.isValid = true
      fetch('/pricerequests', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } else {
      this.isValid = false
    }
    this.formSubmitted = true
    this.emit('change')
  }

  clearForm () {
    // Returns the form to its default state
    this.customer = Object.assign({}, CUSTOMER_DEFAULT)
    this.product = Object.assign({}, PRODUCT_DEFAULT)
    this.prices = Object.assign({}, PRICES_DEFAULT)
    this.units = Object.assign({}, UNITS_DEFAULT)
    this.requestReason = REQUESTED_REASON_DEFAULT
    this.isDraft = IS_DRAFT_DEFAULT
    this.validation = VALIDATION_DEFAULT
    this.formSubmitted = false
    this.isValid = false
    this.emit('change')
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

    this.validation.product = (!!fromDropdown)
    this.emit('change')
  }

  fetchProductPrice (id) {
    // Fetch's the requested product's price from the server
    // and passes the return value off to the appropriate handler.
    const handlePrices = this.receiveProductPrice.bind(this)

    const priceUrl = 'prices/' + id

    fetch(priceUrl)
      .then(res => res.json())
      .then(data => handlePrices(data))
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
    let isValid

    this.formSubmitted = false

    isValid = false

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
      isValid = true
    }

    this.price.requestedPrice.feedback.feedbackMessage = feedbackMessage
    this.validation.requestedPrice = isValid
    this.emit('change')
  }

  updateRequestedUnits (value) {
    this.formSubmitted = false
    this.units.value = value
    this.units.feedback.giveFeedback = true

    let feedbackMessage

    const feedbackType = (parseInt(value) > 0 ? 1 : -1)
    this.units.valid = (parseInt(value) > 0)
    this.validation.requestedUnits = (parseInt(value) > 0)

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
    this.formSubmitted = false
    this.prices.requestedPrice.value = value
    this.prices.requestedPrice.feedback.giveFeedback = true
    let feedbackType
    let feedbackMessage
    let isValid
    isValid = false
    if (!this.prices.normalPrice.value) {
      feedbackType = -1
      feedbackMessage = 'Please select a product.'
    } else {
      feedbackType = (this.prices.requestedPrice.value >= this.prices.normalPrice.value
        ? -1 : 1)
      isValid = (!(this.prices.requestedPrice.value >= this.prices.normalPrice.value))
      feedbackMessage = (this.prices.requestedPrice.value >= this.prices.normalPrice.value
        ? 'You dont need a special request to pay more or equal than our normal prices.' : '')
    }

    this.prices.requestedPrice.feedback.feedbackType = feedbackType
    this.prices.requestedPrice.feedback.feedbackMessage = feedbackMessage
    this.prices.requestedPrice.valid = isValid
    this.validation.requestedPrice = isValid
    this.emit('change')
  }

  updateCustomer (id, label, fromDropdown) {
    this.formSubmitted = false
    this.customer.id = id
    this.customer.label = label
    this.customer.feedback.giveFeedback = true
    this.customer.feedback.feedbackType = (fromDropdown ? 1 : -1)
    this.customer.valid = (!!fromDropdown)
    this.validation.customer = (!!fromDropdown)
    this.customer.feedback.feedbackMessage = (fromDropdown
      ? '' : 'Please select a customer option from the dropdown.')

    this.emit('change')
  }

  updateCustomerBlur (giveFeedback) {
    this.customer.feedback.giveFeedback = giveFeedback
    this.emit('change')
  }

  updateDraft (value) {
    this.isDraft = value
    this.emit('change')
  }

  getIsDraft () {
    return {
      value: this.isDraft
    }
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

  getFormStatus () {
    return {
      isValid: this.validatePayload(this.validation),
      submitted: this.formSubmitted
    }
  }

  getNormalPrice () {
    return {
      value: this.prices.normalPrice.value
    }
  }

  handleActions (action) {
    switch (action.actionType) {
      case 'SUBMIT_FORM' : {
        this.createPriceRequest()
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
      case 'UPDATE_DRAFT': {
        this.updateDraft(action.checked)
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
      case 'FETCH_PRODUCT_PRICE' : {
        this.fetchProductPrice(action.id)
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
      case 'CLEAR_FORM': {
        this.clearForm()
        break
      }
      default : {
        console.log('default case called. Write a handler. action was ', action)
      }
    }
  }
}

const priceRequestStore = new PriceRequestStore()
PriceRequestDispatcher.register(priceRequestStore.handleActions.bind(priceRequestStore))
export default priceRequestStore
