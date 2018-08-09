
import React from 'react'
import Product from './pricerequests/product'
import Customer from './pricerequests/customer'
import RequestReason from './pricerequests/requestreason'
import RequestedUnits from './pricerequests/requestedunits'
import RequestedPrice from './pricerequests/requestedprice'
import NormalPrice from './pricerequests/normalprice'
import IsDraft from './pricerequests/isdraft'
import ClearButton from './pricerequests/clearbutton'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit (event) {
    event.preventDefault()
  }
  render () {
    const borderStyle = {
      border: '1px solid #cecece'
    }

    return (<div>
      <div className='container'>
        <br />
        <br />
        <h1> Special Pricing Consideration Form </h1>
        <br />
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
            <div className='col'>
              <IsDraft
                checked
              />
            </div>

            <div className='btn-toolbar'>
              <div className='btn-group mr-2'>
                <button className='btn btn-outline-success btn-lg'> Submit </button>
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
