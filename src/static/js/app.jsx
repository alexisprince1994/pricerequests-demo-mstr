
import React from 'react';
import Product from './pricerequests/product'
export default class App extends React.Component {
  render () {
    return <div>
    <p> Hello React!</p>

    <Product 
    id="productDiv"
    className='container'
    labelValue='Product Name'
    formSubmitted={false}

    />
    </div>
  }
}