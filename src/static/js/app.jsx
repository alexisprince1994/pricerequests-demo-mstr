
import React from 'react'
import Product from './pricerequests/product'
import Customer from './pricerequests/customer'
import RequestReason from './pricerequests/requestreason'
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

    return <div>
      <div className='container'>
        <br />
        <br />
        <h1> Special Pricing Consideration Form </h1>
        <br />
        <form>
          <div className='container' style={borderStyle}>
            <br />
            <Customer
              id='customerDiv'
              className='form-group'
              formSubmitted={false}
            />
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
