import ApprovalActions from './ApprovalActions'
import ApprovalDispatcher from './ApprovalDispatcher'
import { EventEmitter } from 'events'

class ApprovalStore extends EventEmitter {
  constructor () {
    super()
    this.priceRequests = []
    this.filteredRequests = []
  }

  filterRequests (value) {
    // Ensuring we don't keep emitting change events if someone clicks the same
    // filter criteria.
    const newFilteredRequests = this.priceRequests.filter(req => req.status === value)

    if (newFilteredRequests !== this.filteredRequests) {
      this.filterRequests = newFilteredRequests
      this.emit('change')
    }
  }

  approvePriceRequest (id) {
    console.log('approve has been called')
  }

  denyPriceRequest (id) {
    console.log('deny has been called')
  }

  populateRequests (data) {
    const dataOut = []

    data.forEach(d => {
      dataOut.push({
        id: d.id,
        requestReason: d.request_reason,
        status: d.statuscode,
        requestDate: d.request_date,
        customer: d.customer_name,
        product: d.product_name,
        requestedUnits: d.requested_units,
        requestedPrice: d.requested_price,
        cost: d.cost,
        currentPrice: d.current_price
      })
    })
    this.priceRequests = dataOut
    this.filteredRequests = dataOut
    console.log('this.filteredRequests is ', this.filteredRequests)
    this.emit('change')
  }

  loadRequests () {
    console.log('load requests is called')
    const populateRequests = this.populateRequests.bind(this)
    fetch('/pricerequests/get')
      .then(res => res.json())
      .then(data => populateRequests(data))
  }

  getRequests () {
    return {'filteredRequests': this.filteredRequests}
  }

  handleActions (action) {
    switch (action.actionType) {
      case 'LOAD': {
        this.loadRequests()
        break
      }
      case 'APPROVE_REQUEST': {
        this.approvePriceRequest(action.id)
        break
      }
      case 'DENY_REQUEST': {
        this.denyPriceRequest(action.id)
        break
      }
      case 'FILTER': {
        this.filterRequests(action.value)
      }
      default : {
        console.log('Unknown action type fired. Action of type ',
          action.actionType, ' was not handled.')
      }
    }
  }
}

const approvalStore = new ApprovalStore()
ApprovalDispatcher.register(approvalStore.handleActions.bind(approvalStore))
export default approvalStore
