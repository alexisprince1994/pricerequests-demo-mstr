import React, { Component } from 'react'

import Customer from './customer'
import CurrentPrice from './currentprice'
import Product from './product'

class PriceRequest extends Component {
  constructor (props) {
    super(props)
    this.productMinLength = 3
    this.customerMinLength = 3
    
    
    this.state = {'productName': null, 'requestedPrice': null, 'customerName': null}
  }



  render () {
    return (
      <div className='container'>
        <Product
          labelValue='Product Name'
          value=''
          id='productDiv'
        />
        
      </div>
    )
  }
}

export default PriceRequest
