import ApprovalActions from './ApprovalActions'
import ApprovalDispatcher from './ApprovalDispatcher'
import { EventEmitter } from 'events'

const FILTERS_DEFAULT = {
  'status': null,
  'customer': null,
  'product': null
}

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

    if (newFilteredRequests !== this.filteredRequests) { this.filterRequests = newFilteredRequests }
    this.emit('change')
  }

  populateRequests (data) {
    this.priceRequests = data
    this.emit('change')
  }

  loadRequests () {
    const populateRequests = this.populateRequests.bind(this)
    fetch('/pricerequests')
      .then(res => res.json())
      .then(data => populateRequests(data))
  }

  getRequests () {
    return this.filteredRequests
  }

  handleActions (action) {
    switch (aciton.actionType) {
      case 'LOAD': {
        this.loadRequests()
      }
      case 'APPROVE': {
        this.approvePriceRequest(action.id)
        break
      }
      case 'DENY': {
        this.denyPriceRequest(action.id)
        break
      }
      case 'FILTER': {
        this.filterRequests(action.field, action.value)
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
