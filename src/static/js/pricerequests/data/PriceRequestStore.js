import PriceRequestActions from './PriceRequestActions'
import PriceRequestDispatcher from './PriceRequestDispatcher'
import { EventEmitter } from 'events'

class PriceRequestStore extends EventEmitter {
  constructor () {
    super()

    this.priceRequest = null
  }

  updateCustomer (id, label) {
    this.priceRequest.customerId = id
    this.priceRequest.customerName = label
    this.emit('change')
  }

  getCustomer () {
    return {id: this.priceRequest.customerId, label: this.priceRequest.customerName}
  }

  getCurrentPriceRequest () {
    return this.currentPriceRequest
  }

  createPriceRequest (data) {
    fetch('/pricerequests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(json => {
        data.id = json.id
        data.submittedDate = json.submittedDate
      })
    this.currentPriceRequest = data
    this.emit('change')
  }

  getNext () {
    if (this.priceRequests.length === 0) {
      return null
    }

    if (this.currentPriceRequestIndex === null) {
      this.currentPriceRequestIndex = 0
    } else {
      if (this.currentPriceRequestIndex === this.priceRequests.length - 1) {
        this.currentPriceRequestIndex = 0
      } else {
        this.currentPriceRequestIndex = this.currentPriceRequestIndex + 1
      }
    }
    this.currentPriceRequest = this.priceRequests[this.currentPriceRequestIndex]
    this.emit('change')
  }

  getPrevious () {
    if (this.priceRequests.length === 0) {
      return null
    }

    if (this.currentPriceRequestIndex === null) {
      this.currentPriceRequestIndex = this.priceRequests.length - 1
    } else {
      this.currentPriceRequestIndex = this.currentPriceRequestIndex - 1
    }

    this.currentPriceRequest = this.priceRequests[this.currentPriceRequestIndex]
    this.emit('change')
  }

  handleActions (action) {
    console.log('PriceRequestStore received an action', action)
    switch (action.actionType) {
      case 'SUBMIT' : {
        this.createPriceRequest(action.data)
      }
    }
  }
}

const priceRequestStore = new PriceRequestStore()
PriceRequestDispatcher.register(priceRequestStore.handleActions.bind(priceRequestStore))
export default priceRequestStore
