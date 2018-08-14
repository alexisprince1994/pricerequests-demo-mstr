
import React from 'react'
import Product from './pricerequests/product'
import Customer from './pricerequests/customer'
import RequestReason from './pricerequests/requestreason'
import RequestedUnits from './pricerequests/requestedunits'
import RequestedPrice from './pricerequests/requestedprice'
import NormalPrice from './pricerequests/normalprice'
import IsDraft from './pricerequests/isdraft'
import ClearButton from './pricerequests/clearbutton'
import SubmitButton from './pricerequests/submitbutton'
import PriceRequestStore from './pricerequests/data/PriceRequestStore'
import * as PriceRequestActions from './pricerequests/data/PriceRequestActions'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.onFormValidate = this.onFormValidate.bind(this)
    this.state = PriceRequestStore.getFormStatus()
  }

  handleSubmit (event) {
    event.preventDefault()
    console.log('this.state is ', this.state)
    PriceRequestActions.submitForm()
  }

  componentWillMount () {
    PriceRequestStore.on('change', this.onFormValidate)
  }

  componentWillUnmount () {
    PriceRequestStore.removeListener('change', this.onFormValidate)
  }

  onFormValidate () {
    this.setState(PriceRequestStore.getFormStatus())
  }

  render () {
    let feedback

    if (this.state.submitted) {
      if (this.state.isValid) {
        feedback =
          <div className='alert alert-success' title='Click to dismiss'>
            <strong>Success!</strong> Successfully saved the form.
          </div>
      } else {
        feedback =
          <div className='alert alert-danger' title='Click to dismiss'>
            <strong>Error!</strong> Please fill out all fields correctly and try again
          </div>
      }
    }

    const borderStyle = {
      border: '1px solid #cecece'
    }

    return (<div>
      <div className='container'>
        <br />
        <br />
        <h1> Special Pricing Consideration Form </h1>
        <br />
        <div className='container'>
          {feedback && feedback ? feedback : ''}
        </div>

        <form>
          <div className='container' style={borderStyle}>
            <br />
            <div className='form-group' id='customerDiv'>
              <label htmlFor='customerDiv'>
            Customer Name
              </label>
              <Customer
                className='form-group row'
                formSubmitted={false}
              />
            </div>
            <div className='form-group' id='productDiv'>
              <label htmlFor='productDiv'>
            Product Name
              </label>
              <Product
                id='productDiv'
                className='form-group'
                labelValue='Product Name'
                formSubmitted={false}
              />
            </div>
            <div className='form-group row'>
              <div className='col-3'>
                <label htmlFor='normalPrice'>
            Normal Price
                </label>
                <NormalPrice />
              </div>
              <div className='col-3'>
                <label htmlFor='requestedPrice'>
            Requested Price
                </label>
                <RequestedPrice />
              </div>
              <div className='col-3'>
                <label htmlFor='requestedUnits'>
            Requested Units
                </label>
                <RequestedUnits />
              </div>
            </div>
            <div className='form-group'>
              <label htmlFor='requestReason'> Reason for Request </label>
              <div className='form-group row'>
                <RequestReason />
              </div>
            </div>

            <div className='btn-toolbar'>
              <div className='btn-group mr-2'>
                <SubmitButton
                  handleSubmit={this.handleSubmit}
                />
              </div>
              <div className='btn-group mr-2'>
                <ClearButton />
              </div>
            </div>
            <br />
            <br />
          </div>
        </form>
      </div>
    </div>
    )
  }
}
