import React, { Component } from 'react'
import PriceRequestHeader from './pricerequestheader'
import * as ApprovalActions from './data/ApprovalActions'
import ApprovalStore from './data/ApprovalStore'

class PriceRequestManager extends Component {
  constructor (props) {
    super(props)

    this.state = {
      'filteredRequests': [],
      filterOptions: [],
      dateFilterOptions: [],
      displayAlerts: false,
      alertMessage: ''
    }

    this.initialDataLoad = this.initialDataLoad.bind(this)
    this.stopAlertDisplay = this.stopAlertDisplay.bind(this)
    this.reloadRequests = this.reloadRequests.bind(this)
    this.reloadFilterOptions = this.reloadFilterOptions.bind(this)
    this.filterRequestsByDate = this.filterRequestsByDate.bind(this)
    this.reloadAlertInfo = this.reloadAlertInfo.bind(this)
    this.parentId = 'priceRequestAccordion'
  }

  componentWillMount () {
    ApprovalStore.on('change', this.reloadRequests)
    ApprovalStore.on('change', this.reloadFilterOptions)
    ApprovalStore.on('change', this.reloadAlertInfo)
    this.initialDataLoad()
  }

  componentWillUnmount () {
    ApprovalStore.removeListener('change', this.reloadRequests)
    ApprovalStore.removeListener('change', this.reloadFilterOptions)
    ApprovalStore.removeListener('change', this.reloadAlertInfo)
  }

  reloadAlertInfo () {
    this.setState(ApprovalStore.getAlertInfo())
  }

  stopAlertDisplay () {
    this.setState({
      displayAlerts: false
    })
  }

  reloadRequests () {
    this.setState(ApprovalStore.getRequests())
  }

  reloadFilterOptions () {
    this.setState(ApprovalStore.getFilterOptions())
  }

  filterRequestsByDate (event) {
    ApprovalActions.filterRequestsByDate(event.target.value)
  }

  filterRequests (event) {
    ApprovalActions.filterRequests(event.target.value)
  }

  initialDataLoad () {
    ApprovalActions.initialRequestLoad()
  }

  render () {
    const selectOptions = []
    this.state.filterOptions.map((opt, indx) =>
      selectOptions.push(<option key={indx}>{opt}</option>))

    const dateFilterOptions = []
    this.state.dateFilterOptions.map((opt, indx) =>
      dateFilterOptions.push(<option key={indx}>{opt}</option>))

    const { displayAlerts, alertMessage, isPositive } = this.state

    let alert
    let alertClass
    if (displayAlerts) {
      alertClass = (isPositive ? 'alert alert-success' : 'alert alert-danger')
      alert = <div className='row'>
        <div
          className={alertClass}
          onClick={this.stopAlertDisplay}
        >
          {alertMessage}
        </div>
      </div>
    }

    return (
      <div>
        <div className='container'>
          <div className='row'>
            {alert || ''}
          </div>
          <div className='row'>
            <div className='col' />
            <div className='col' />
            <div className='col' />
            <div className='col'>
              <div className='form-group'>
                <label htmlFor='requestFilterByDate'>Filter by Request Date </label>
                <select
                  className='form-control'
                  id='requestFilterByDate'
                  onChange={this.filterRequestsByDate}
                >
                  {dateFilterOptions}
                </select>
              </div>
            </div>
            <div className='col'>
              <div className='form-group'>
                <label htmlFor='requestFilter'>Filter Status</label>
                <select
                  className='form-control'
                  id='requestFilter'
                  onChange={this.filterRequests}
                >
                  {selectOptions}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className='container'>
          <div id={this.parentId}>
            {this.state.filteredRequests.map(obj =>
              <PriceRequestHeader
                key={obj.id.toString()}
                id={obj.id}
                productName={obj.product}
                customer={obj.customer}
                expanded={obj.expanded}
                parentId={this.parentId}
                requestReason={obj.requestReason}
                status={obj.status}
                requestedUnits={obj.requestedUnits}
                cost={obj.cost}
                currentPrice={obj.currentPrice}
                requestedPrice={obj.requestedPrice}
                requestDate={obj.requestDate}
                error={obj.error}
                btnPressMessage={obj.btnPressMessage}
                submitted={obj.submitted}
              />
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default PriceRequestManager
