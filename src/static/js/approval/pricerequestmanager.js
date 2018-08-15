import React, { Component } from 'react'
import PriceRequestHeader from './pricerequestheader'
import * as ApprovalActions from './data/ApprovalActions'
import ApprovalStore from './data/ApprovalStore'

class PriceRequestManager extends Component {
  constructor (props) {
    super(props)

    this.state = {'filteredRequests': [], filterOptions: []}
    this.initialDataLoad = this.initialDataLoad.bind(this)
    this.reloadRequests = this.reloadRequests.bind(this)
    this.parentId = 'priceRequestAccordion'
  }

  componentWillMount () {
    ApprovalStore.on('change', this.reloadRequests)
  }

  componentWillUnmount () {
    ApprovalStore.removeListener('change', this.reloadRequests)
  }

  reloadRequests () {
    this.setState(ApprovalStore.getRequests())
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

    return (
      <div>
        <div className='container'>
          <div className='row'>
            <div className='col' />
            <div className='col' />
            <div className='col' />
            <div className='col' />
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
              <PriceRequest
                key={obj.id.toString()}
                id={obj.id}
                product={obj.product}
                customer={obj.customer}
                expanded={obj.expanded}
                parentId={this.parentId}
                bodyMessage={obj.bodyMessage}
                handleClick={this.handleClick}
                status={obj.status}
                requestedUnits={obj.requestedUnits}
                cost={obj.cost}
                currentPrice={obj.currentPrice}
                requestedPrice={obj.requestedPrice}
                requestDate={obj.requestDate}
              />
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default PriceRequestManager
