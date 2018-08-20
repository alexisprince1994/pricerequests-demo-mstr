
import React from 'react'
import Product from './pricerequests/product'
import Customer from './pricerequests/customer'
import RequestReason from './pricerequests/requestreason'
export default class PriceRequest extends React.Component {
  constructor (props) {
    super(props)

    this.onSubmit = this.onSubmit.bind(this)
    this.state = {'customerSubmitUrl': 'http://127.0.0.1:5000/customers',
    'customerId': null}
  }

  onSubmit (event) {
    event.preventDefault()
  }
  render () {
    const borderStyle = {
      border: '1px solid #cecece'
    }

    return <div>
      <div className='container'>
        <br />
        <br />
        <h1> Special Pricing Consideration Form </h1>
        <br />
        <form>
          <div className='container' style={borderStyle}>
            <br />
            <div className='form-group'>
            <label htmlFor='customerName'>
            Customer Name
            </label>
            <div className='form-group row'>
              <Customer
              id='customerDiv'
              className='col-9 col-md-offset-4'
              formSubmitted={false}
              submitUrl={this.state.customerSubmitUrl}
            />
            </div>
            </div>
            
            <Product
              id='productDiv'
              className='form-group'
              labelValue='Product Name'
              formSubmitted={false}
            />
            <RequestReason

            />
            <div className='btn-toolbar'>
              <div className='btn-group mr-2'>
                <button className='btn btn-outline-success btn-lg'> Submit </button>
              </div>
              <div className='btn-group mr-2'>
                <button className='btn btn-outline-info btn-lg'> Clear </button>
              </div>
            </div>
            <br />
            <br />
          </div>
        </form>
      </div>
    </div>
  }
}

export default PriceRequest