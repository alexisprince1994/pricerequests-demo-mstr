import React, { Component } from 'react'
import PriceRequestDetail from './pricerequestdetail'
import * as ApprovalActions from './data/ApprovalActions'

class PriceRequestHeader extends Component {
  constructor (props) {
    super(props)

    this.approveRequest = this.approveRequest.bind(this)
    this.denyRequest = this.denyRequest.bind(this)
    this.state = {'expanded': this.props.expanded || false}
  }

  approveRequest (event) {
    ApprovalActions.approveRequest(this.props.id)
  }

  denyRequest (event) {
    ApprovalActions.denyRequest(this.props.id)
  }

  render () {
    const headerId = 'heading' + this.props.id
    const collapseId = 'collapse' + this.props.id
    const target = '#' + collapseId

    const isExpanded = this.state.expanded
    const buttonText = (isExpanded ? 'Hide' : 'Show')
    const expandedButtonLinkClassName = (isExpanded
      ? 'btn btn-outline-info' : 'btn btn-outline-info collapsed')
    const expandedClassName = (isExpanded ? 'collapse show' : 'collapse')

    return (

      <div className='card' >
        <div className='card-header' id={headerId}>
          <div className='row'>
            <div className='col'>
              <h5 className='mb-0 float-left'>
                <button
                  className={expandedButtonLinkClassName}
                  data-toggle='collapse'
                  data-target={target}
                  aria-expanded={this.state.expanded}
                  aria-controls={collapseId}
                >
                  {buttonText}
                </button>
              </h5>
            </div>
            <div className='col'>
              <h5 className='mb-0'>
                {this.props.customer}
              </h5>
            </div>
            <div className='col'>
              <h5 className='mb-0 float-right'>
                Requested on {this.props.requestDate}
              </h5>
            </div>
          </div>
        </div>
        <div
          id={collapseId}
          className={expandedClassName}
          aria-labelledby={headerId}
          data-parent={this.props.parentId}
        >
          <PriceRequestDetail
            requestedUnits={this.props.requestedUnits}
            cost={this.props.cost}
            product={this.props.productName}
            currentPrice={this.props.currentPrice}
            requestedPrice={this.props.requestedPrice}
          />

          <div className='card-body'>
            <div className='row'>
              <div className='col'>
                <div className='btn-toolbar'>
                  <div className='btn-group mr-2'>
                    <button
                      className='btn btn-outline-success'
                      onClick={this.approveRequest}
                    >
              Approve
                    </button>
                  </div>
                  <div className='btn-group mr-2'>
                    <button
                      className='btn btn-outline-danger'
                      onClick={this.denyRequest}
                    >
              Deny
                    </button>
                  </div>
                </div>
              </div>
              <div className='col' />
              <div className='col' />
              <div className='col' />
              <p className='float-right'> Current Status: SUBMITTED </p>

            </div>
          </div>
        </div>
      </div>

    )
  }
}

export default PriceRequestHeader
