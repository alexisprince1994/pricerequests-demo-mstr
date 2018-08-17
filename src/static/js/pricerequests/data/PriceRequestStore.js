import PriceRequestActions from './PriceRequestActions'
import PriceRequestDispatcher from './PriceRequestDispatcher'
import { EventEmitter } from 'events'

const REQUEST_URL = 'http:127.0.0.1:5000/'

const CUSTOMER_DEFAULT = {
  'id': null,
  'label': '',
  shouldClear: true,
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
  shouldClear: true,
  feedback: {
    giveFeedback: false,
    feedbackType: null,
    feedbackMessage: null
  }
}

const PRICES_DEFAULT = {
  shouldClear: true,
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
  shouldClear: true,
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
    // Using deep copies since nested objects don't get copied
    // appropriately when using Object.assign({}, oldObject)
    // Parse and stringify ensure the original copy does
    // not get messed with, so we can reset form state
    // whenever needed.
    this.customer = JSON.parse(JSON.stringify(CUSTOMER_DEFAULT))
    this.product = JSON.parse(JSON.stringify(PRODUCT_DEFAULT))
    this.prices = JSON.parse(JSON.stringify(PRICES_DEFAULT))
    this.units = JSON.parse(JSON.stringify(UNITS_DEFAULT))
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
      requestedReason: this.requestReason
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
    this.shouldClear = true
    console.log('from clearForm, prices default is ', PRICES_DEFAULT)
    console.log('from clearForm, this.prices is ', this.prices)
    this.emit('change')
  }

  updateRequestReason (value) {
    this.requestReason = value
    this.emit('change')
  }

  updateProduct (id, label, fromDropdown) {
    this.product.shouldClear = false
    this.product.id = id
    this.product.label = label
    this.product.feedback.giveFeedback = true
    this.product.feedback.feedbackType = (fromDropdown ? 1 : -1)
    this.product.feedback.feedbackMessage = (fromDropdown
      ? '' : 'Please select a product option from the dropdown.')

    if (!fromDropdown) {
      this.prices.normalPrice.value = ''
    }

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
    this.prices.shouldClear = false
    this.emit('change')
  }

  updateProductBlur (giveFeedback) {
    this.product.feedback.giveFeedback = giveFeedback
    this.product.shouldClear = false
    this.emit('change')
  }

  requestedUnitsBlurred (giveFeedback) {
    this.units.feedback.giveFeedback = giveFeedback
    if (!this.units.value) {
      this.units.feedback.feedbackMessage = 'This field is required.'
    }
    this.units.shouldClear = false
    this.emit('change')
  }

  requestedPriceBlurred (giveFeedback) {
    this.prices.requestedPrice.feedback.giveFeedback = giveFeedback
    if (!this.prices.requestedPrice.value) {
      this.prices.requestedPrice.feedback.feedbackMessage = 'This field is required.'
    }
    this.prices.shouldClear = false
    this.emit('change')
  }

  // updateRequestedPrice (value) {
  //   let feedbackMessage
  //   let isValid
  //   this.prices.shouldClear = false
  //   this.formSubmitted = false

  //   isValid = false

  //   this.prices.requestedPrice.value = value
  //   this.prices.requestedPrice.feedback.giveFeedback = true
  //   this.prices.requestedPrice.feedback.feedbackType = (parseFloat(value) > 0 ? 1 : -1)

  //   if (!value) {
  //     feedbackMessage = 'This field is required.'
  //   } else if (isNaN(parseFloat(value))) {
  //     feedbackMessage = 'Numbers only please!'
  //   } else if (parseFloat(value) <= 0) {
  //     feedbackMessage = 'A positive non-zero price is required.'
  //   } else {
  //     feedbackMessage = null
  //     isValid = true
  //   }

  //   this.prices.requestedPrice.feedback.feedbackMessage = feedbackMessage
  //   this.validation.requestedPrice = isValid
  //   this.emit('change')
  // }

  updateRequestedUnits (value) {
    this.units.shouldClear = false
    this.formSubmitted = false
    this.units.value = value
    this.units.feedback.giveFeedback = true

    let feedbackMessage
    console.log('value from updateRequestedUnits is ', value)

    const feedbackType = (parseInt(value) > 0 ? 1 : -1)
    console.log('feedbackType is ', feedbackType)
    this.units.feedback.feedbackType = feedbackType
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

    console.log('feedbackMessage from updateRequestedUnits is ', feedbackMessage)

    this.units.feedback.feedbackMessage = feedbackMessage
    this.emit('change')
  }

  updateRequestedPrice (value) {
    this.prices.shouldClear = false
    this.formSubmitted = false
    this.prices.requestedPrice.value = value
    this.prices.requestedPrice.feedback.giveFeedback = true
    let feedbackType
    let feedbackMessage
    let isValid
    isValid = false
    if (!this.prices.normalPrice.value && value) {
      feedbackType = -1
      feedbackMessage = 'Please select a product.'
    } else if (!value) {
      feedbackType = -1
      feedbackMessage = 'This field is required.'
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
    this.customer.shouldClear = false
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
    this.customer.shouldClear = false
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
      shouldClear: this.product.shouldClear,
      id: this.product.id,
      label: this.product.label,
      giveFeedback: this.product.feedback.giveFeedback,
      feedbackType: this.product.feedback.feedbackType,
      feedbackMessage: this.product.feedback.feedbackMessage
    }
  }

  getRequestedUnits () {
    return {
      shouldClear: this.units.shouldClear,
      value: this.units.value,
      giveFeedback: this.units.feedback.giveFeedback,
      feedbackType: this.units.feedback.feedbackType,
      feedbackMessage: this.units.feedback.feedbackMessage
    }
  }

  getCustomer () {
    return {
      id: this.customer.id,
      shouldClear: this.customer.shouldClear,
      label: this.customer.label,
      giveFeedback: this.customer.feedback.giveFeedback,
      feedbackType: this.customer.feedback.feedbackType,
      feedbackMessage: this.customer.feedback.feedbackMessage
    }
  }

  getRequestedPrice () {
    return {
      shouldClear: this.prices.shouldClear,
      value: this.prices.requestedPrice.value,
      giveFeedback: this.prices.requestedPrice.feedback.giveFeedback,
      feedbackType: this.prices.requestedPrice.feedback.feedbackType,
      feedbackMessage: this.prices.requestedPrice.feedback.feedbackMessage
    }
  }

  getFormStatus () {
    return {
      isValid: this.validatePayload(this.validation),
      submitted: this.formSubmitted,
      customerid: this.customer.id,
      requestedPrice: this.prices.requestedPrice.value,
      requestedUnits: this.units.value,
      productid: this.product.id,
      requestReason: this.requestReason
    }
  }

  getNormalPrice () {
    return {
      shouldClear: this.prices.shouldClear,
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
