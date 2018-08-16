import React, { Component } from 'react'
import * as PriceRequestActions from './data/PriceRequestActions'
import PriceRequestStore from './data/PriceRequestStore'

class CurrentPrice extends Component {
  constructor (props) {
    super(props)

    // Event Binding
    this.reloadNormalPrice = this.reloadNormalPrice.bind(this)

    this.state = PriceRequestStore.getNormalPrice()
  }
  componentDidMount () {
    PriceRequestStore.on('change', this.reloadNormalPrice)
  }

  componentWillUnmount () {
    PriceRequestStore.removeListener('change', this.reloadNormalPrice)
  }

  reloadNormalPrice () {
    this.setState(PriceRequestStore.getNormalPrice(),
      () => {
        if (this.state.shouldClear) {
          this.setState({
            value: ''
          })
        }
      })
  }
  render () {
    return (
      <div>
        <input
          className='form-control'
          type='text'
          value={this.state.value}
          id='normalPrice'
          disabled
          readOnly
        />
      </div>
    )
  }
}

export default CurrentPrice
