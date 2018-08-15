import React, { Component } from 'react'

class PriceRequestDetail extends Component {
  formatFloat (x, precision) {
    const requiredPrecision = x.toFixed(precision)

    return parseFloat(requiredPrecision).toLocaleString('en')
  }

  render () {
    const titleText = this.props.requestedUnits + ' of ' + this.props.product + ' at $' + this.props.requestedPrice
    const reasonText = this.props.requestReason || 'No request reason provided.'

    const currentRevenue = this.props.requestedUnits * this.props.currentPrice
    const currentRevenueFormatted = this.formatFloat(currentRevenue, 0)

    const currentGrossProfit = currentRevenue - (this.props.requestedUnits * this.props.cost)
    const currentGrossProfitFormatted = this.formatFloat(currentGrossProfit, 0)
    const currentGPM = this.formatFloat((currentGrossProfit / currentRevenue * 100), 2)

    const requestedRevenue = this.props.requestedUnits * this.props.requestedPrice
    const requestedRevenueFormatted = this.formatFloat(requestedRevenue, 0)

    const requestedGrossProfit = requestedRevenue - (this.props.requestedUnits * this.props.cost)
    const requestedGrossProfitFormatted = this.formatFloat(requestedGrossProfit, 0)
    const requestedGPM = this.formatFloat((requestedGrossProfit / requestedRevenue * 100), 2)
    return (
      <div>
        <div className='card-body'>
          <h5 className='card-title'>
            {titleText}
          </h5>
          <p>
            {reasonText}
          </p>
        </div>
        <div className='container'>
          <div className='row'>
            <div className='col'>
              <div className='card-header'>
                <strong>Regular</strong>
              </div>
              <ul className='list-group'>
                <li className='list-group-item'>
        Price: ${this.props.currentPrice}
                </li>
                <li className='list-group-item'>
        Margin: {currentGPM}%
                </li>
                <li className='list-group-item'>
                Revenue: ${currentRevenueFormatted}
                </li>
                <li className='list-group-item'>
                Gross Profit: ${currentGrossProfitFormatted}
                </li>
              </ul>
            </div>
            <div className='col'>
              <div className='card-header'>
                <strong>Requested</strong>
              </div>
              <ul className='list-group'>
                <li className='list-group-item'>
        Price: ${this.props.requestedPrice}
                </li>
                <li className='list-group-item'>
        Margin: {requestedGPM}%
                </li>
                <li className='list-group-item'>
                Revenue: ${requestedRevenueFormatted}
                </li>
                <li className='list-group-item'>
                Gross Profit: ${requestedGrossProfitFormatted}
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    )
  }
}

export default PriceRequestDetail
