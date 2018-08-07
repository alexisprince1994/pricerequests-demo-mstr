import React, { Component } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import RequestedPrice from './requestedprice'
import RequestedUnits from './requestedunits'

class Product extends Component {
  constructor (props) {
    super(props)
    // Props

    this.onSelect = this.onSelect.bind(this)
    this.handleRequestedChange = this.handleRequestedChange.bind(this)
    this.handleUnitsChange = this.handleUnitsChange.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.requiredFieldMessage = 'This field is required.'
    // Other Expected Props
    // 1) validate(id, value)
    // 2) onChange(id, value)

    this.state = {
      'touched': false,
      'giveFeedback': this.props.formSubmitted,
      'isLoading': false,
      'normalPrice': this.props.normalPrice,
      'requestedPrice': this.props.requestedPrice,
      'requestedGiveFeedback': !!(this.props.requestedPrice && this.props.requestedPrice),
      'feedback': null
    }
  }

  buildFeedback () {
    let feedback

    if (this.state.touched || this.state.giveFeedback) {
      if (this.state.selected) {
        this.setState({
          feedback: true
        })
      } else {
        this.setState({
          feedback: false
        })
      }
    } else {
      this.setState({
        feedback: null
      })
    }
  }

  handleUnitsChange (event) {
    const newRequestedUnits = event.target.value

    let errorMessage

    if (!newRequestedUnits) {
      errorMessage = 'This field is required.'
    } else if (isNaN(parseInt(newRequestedUnits))) {
      errorMessage = 'Numbers only please!'
    } else if (parseInt(newRequestedUnits) <= 0) {
      errorMessage = 'A positive non-zero quantity is required.'
    } else {
      errorMessage = null
    }

    this.setState({
      requestedUnits: newRequestedUnits,
      unitsGiveFeedBack: true,
      unitsErrorMessage: errorMessage
    })
  }

  handleRequestedChange (event) {
    const newRequestedPrice = event.target.value
    let errorMessage

    if (!newRequestedPrice) {
      errorMessage = 'This field is required.'
    } else if (isNaN(parseFloat(newRequestedPrice))) {
      errorMessage = 'Numbers only please!'
    } else if (parseFloat(newRequestedPrice) >= this.state.normalPrice) {
      errorMessage = "If you'd like to buy the same amount of products for more money, please call customer service and we'd be happy to oblige."
    } else {
      errorMessage = null
    }

    this.setState({
      'requestedPrice': newRequestedPrice,
      'requestedGiveFeedback': true,
      'errorMessage': errorMessage
    })
  }

  handleBlur (event) {
    this.setState({
      'touched': true,
      'giveFeedback': true
    }, () => this.buildFeedback())
  }

  onSelect (selected) {
    // Ensures that if we are deleting a previously selected value
    // that we are able to select a new one. Otherwise it will default
    // back to whatever was first selected.
    this.setState({selected}, () => this.buildFeedback())

    if (selected.length > 0) {
      const selectedId = selected[0].id
      console.log('selectedId is ', selectedId)
      this.setState({selected})
      fetch(`http://127.0.0.1:5000/prices/${selectedId}`)
        .then(res => res.json())
        .then(json => this.setState({
          normalPrice: json.price
        }))
    } else {
      this.setState({
        normalPrice: null
      })
    }
  }

  // isInvalid={(typeof (this.state.feedback) === 'object') ? undefined : true}
  render () {
    const { feedback } = this.state
    const { feedbackClassName } = this.state
    const { touched } = this.state
    const { giveFeedback } = this.state
    return (
      <div className={this.props.className}>
        <label htmlFor={this.props.id}>
          {this.props.labelValue}
        </label>
        <div className='form-group row'>
          <AsyncTypeahead
            className='col-9 col-md-offset-4'
            isLoading={this.state.isLoading}
            onChange={this.onSelect}
            onBlur={this.handleBlur}
            isInvalid={(!feedback && (touched || giveFeedback)) ? true : null}
            isValid={this.state.feedback}
            options={this.state.options}
            selected={this.state.selected}
            onSearch={query => {
              this.setState({isLoading: true})
              fetch(`http://127.0.0.1:5000/products?q=${query}`)
                .then(res => res.json())
                .then(json => this.setState({
                  isLoading: false,
                  options: json
                }, () => console.log(json))
                )
            }
            }
          />
          {feedback && feedback ? feedback : ''}
        </div>

        <div className='form-group row'>

          <div className='col-sm-3'>
            <label htmlFor='normalPrice'>
              Normal Price
            </label>
            <div>
              <input type='text'
                className='form-control'
                id='normalPrice'
                placeholder={this.state.normalPrice}
                disabled
                readOnly
              />
            </div>
          </div>

          <RequestedPrice
            id='requestedPrice'
            normalPrice={this.state.normalPrice}
            handleRequestedChange={this.handleRequestedChange}
            giveFeedback={this.state.requestedGiveFeedback}
            requestedPrice={this.state.requestedPrice}
            errorMessage={this.state.errorMessage}
          />
          <RequestedUnits
            handleUnitsChange={this.handleUnitsChange}
            requestedUnits={this.state.requestedUnits}
            errorMessage={this.state.unitsErrorMessage}
            giveFeedback={this.state.unitsGiveFeedBack}
          />
        </div>
      </div>

    )
  }
}

export default Product
