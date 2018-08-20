import React, { Component } from 'react'
import PriceRequestDetail from './pricerequestdetail'
import * as ApprovalActions from './data/ApprovalActions'

class PriceRequestHeader extends Component {
  constructor (props) {
    super(props)

    this.approveRequest = this.approveRequest.bind(this)
    this.denyRequest = this.denyRequest.bind(this)
    this.toggleDisplayAlert = this.toggleDisplayAlert.bind(this)
    this.state = {'displayAlert': true}
  }

  approveRequest (event) {
    this.setState({
      'displayAlert': true
    })
    ApprovalActions.approveRequest(this.props.id, 'APPROVED')
  }

  denyRequest (event) {
    this.setState({
      'displayAlert': true
    })
    ApprovalActions.denyRequest(this.props.id, 'DENIED')
  }

  toggleDisplayAlert () {
    this.setState({
      'displayAlert': false
    })
  }

  render () {
    const headerId = 'heading' + this.props.id
    const collapseId = 'collapse' + this.props.id
    const target = '#' + collapseId
    const alertId = 'alert' + this.props.id

    const isExpanded = false
    const buttonText = (isExpanded ? 'Hide' : 'Show')
    const expandedButtonLinkClassName = (isExpanded
      ? 'btn btn-outline-info' : 'btn btn-outline-info collapsed')
    const expandedClassName = (isExpanded ? 'collapse show' : 'collapse')

    const denyButton = <div className='btn-group mr-2'>
      <button
        className='btn btn-outline-danger'
        onClick={this.denyRequest}
      >
              Deny
      </button>
    </div>

    const approveButton = <div className='btn-group mr-2'>
      <button
        className='btn btn-outline-success'
        onClick={this.approveRequest}
      >
        Approve
      </button>
    </div>

    let button1
    let button2

    if (this.props.status === 'SUBMITTED') {
      button1 = approveButton
      button2 = denyButton
    } else if (this.props.status === 'APPROVED') {
      button1 = denyButton
      button2 = ''
    } else {
      button1 = approveButton
      button2 = ''
    }

    let btnPressAlert
    if (this.props.submitted && this.state.displayAlert) {
      if (!this.props.error) {
        btnPressAlert = <div
          className='alert alert-success'
        >
          {this.props.btnPressMessage}
          <button type='button' className='close' aria-label='Close'
            onClick={this.toggleDisplayAlert}>
            <span aria-hidden='true'>&times;</span>
          </button>

        </div>
      } else {
        btnPressAlert = <div
          className='alert alert-danger'
          onClick={this.toggleDisplayAlert}
        >
          {this.props.btnPressMessage}
          <button type='button' className='close' aria-label='Close'
            onClick={this.toggleDisplayAlert}>
            <span aria-hidden='true'>&times;</span>
          </button>
        </div>
      }
    }

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
                  aria-expanded={false}
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
          <div className='card-body'>
            {this.state.displayAlert ? btnPressAlert : ''}
          </div>

          <PriceRequestDetail
            requestedUnits={this.props.requestedUnits}
            cost={this.props.cost}
            product={this.props.productName}
            currentPrice={this.props.currentPrice}
            requestedPrice={this.props.requestedPrice}
            requestReason={this.props.requestReason}
          />

          <div className='card-body'>
            <div className='row'>
              <div className='col'>
                <div className='btn-toolbar'>
                  {button1}
                  {button2}
                </div>
              </div>
              <div className='col' />
              <div className='col' />
              <div className='col' />
              <p className='float-right'> Current Status: {this.props.status} </p>
            </div>
          </div>
        </div>
      </div>

    )
  }
}

export default PriceRequestHeader
