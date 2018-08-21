import ApprovalActions from './ApprovalActions'
import ApprovalDispatcher from './ApprovalDispatcher'
import { EventEmitter } from 'events'

class ApprovalStore extends EventEmitter {
  constructor () {
    super()
    this.statusFilterValue = null
    this.dateFilterValue = null
    this.priceRequests = []
    this.filteredRequests = []
    this.filterOptions = []
    this.dateFilterOptions = []
  }

  _filterRequests () {
    // Ensuring we don't keep emitting change events if someone clicks the same
    // filter criteria.

    // If the value is the null/empty string, assume they want all.
    const isStatusFiltered = (!!this.statusFilterValue)
    const isDateFiltered = (!!this.dateFilterValue)
    const statusFilterValue = this.statusFilterValue
    const dateFilterValue = this.dateFilterValue

    if (isStatusFiltered && isDateFiltered) {
      this.filteredRequests = this.priceRequests.filter(pr => (pr.status === statusFilterValue) && (pr.requestDate === dateFilterValue))
      return
    }

    if (!isStatusFiltered && !isDateFiltered) {
      this.filteredRequests = this.priceRequests
      return
    }

    if (isStatusFiltered) {
      this.filteredRequests = this.priceRequests.filter(pr => pr.status === statusFilterValue)
    } else {
      this.filteredRequests = this.priceRequests.filter(pr => pr.requestDate === dateFilterValue)
    }
  }

  filterRequests (value, field) {
    if (field === 'status') {
      this.statusFilterValue = value
    } else {
      this.dateFilterValue = value
    }
    this._filterRequests()
    this.emit('change')
  }

  approvePriceRequest (id, newStatus) {
    const updateRequest = this.updateRequest.bind(this)
    const reqData = {id, 'status': newStatus}

    fetch('/pricerequests/statuschange', {
      'method': 'POST',
      'body': JSON.stringify(reqData),
      'headers': {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => updateRequest(data))
  }

  denyPriceRequest (id, newStatus) {
    const updateRequest = this.updateRequest.bind(this)
    const reqData = {id, 'status': newStatus}
    fetch('/pricerequests/statuschange', {
      'method': 'POST',
      'body': JSON.stringify(reqData),
      'headers': {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => updateRequest(data))
  }

  refreshFilterOptions () {
    const filterOptions = [null]
    this.priceRequests.forEach(pr => {
      filterOptions.push(pr.status)
    })
    this.filterOptions = Array.from(new Set(filterOptions))
  }

  refreshDateFilterOptions () {
    const dateFilterOptions = [null]
    this.priceRequests.forEach(pr => {
      dateFilterOptions.push(pr.requestDate)
    })
    this.dateFilterOptions = Array.from(new Set(dateFilterOptions))
  }

  updateRequest (data) {
    const updatedPriceRequests = this.priceRequests.forEach(pr => {
      if (pr.id === data.id) {
        if (data.error) {
          pr.error = true
          pr.submitted = true
          pr.btnPressMessage = `Error changing from 
          status ${pr.status}. Error message is ${data.error}`
        } else {
          pr.submitted = true
          pr.error = false
          pr.oldStatus = pr.status
          pr.status = data.statuscode
          pr.btnPressMessage = `Successfully changed status from
        ${pr.oldStatus} to ${pr.status}`
        }
      }
    })

    this.refreshFilterOptions()
    this.emit('change')
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
        currentPrice: d.current_price,
        oldStatus: null,
        btnPressMessage: '',
        submitted: false
      })
    })

    this.priceRequests = dataOut
    this.filteredRequests = dataOut
    this.refreshFilterOptions()
    this.refreshDateFilterOptions()

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

  getFilterOptions () {
    return {'filterOptions': this.filterOptions, 'dateFilterOptions': this.dateFilterOptions}
  }

  handleActions (action) {
    switch (action.actionType) {
      case 'LOAD': {
        this.loadRequests()
        break
      }
      case 'APPROVE_REQUEST': {
        this.approvePriceRequest(action.id, action.newStatus)
        break
      }
      case 'DENY_REQUEST': {
        this.denyPriceRequest(action.id, action.newStatus)
        break
      }
      case 'FILTER': {
        this.filterRequests(action.value, action.field)
        break
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
