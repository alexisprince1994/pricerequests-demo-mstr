import React, { Component } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'

class Product extends Component {
  constructor (props) {
    super(props)
    // Props
    
    
    this.onSelect = this.onSelect.bind(this)
    // Other Expected Props
    // 1) validate(id, value)
    // 2) onChange(id, value)

    this.state = {'touched': false, 'giveFeedback': this.props.formSubmitted, 
    'isLoading': false, 'normalPrice': null}

    // Event Binding
    //this.handleBlur = this.handleBlur.bind(this)
  }

  // handleBlur (event) {
  //   this.setState({'touched': true, 'giveFeedback': true})
  // }

  //

  onSelect (selected) {
    console.log(JSON.stringify(selected))
    const selectedId = selected[0].id
    console.log('selectedId is ', selectedId)
    this.setState({selected})
    fetch(`http://127.0.0.1:5000/prices/${selectedId}`)
      .then(res => res.json())
      .then(json => this.setState({
        normalPrice: json.price
      }))
  }

  render () {
    return (

      <div className={this.props.className}>
        <label htmlFor={this.props.id}>
          {this.props.labelValue}
        </label>

       

        <AsyncTypeahead
          isLoading={this.state.isLoading}
          onChange={this.onSelect}
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

         <label htmlFor="normalPrice">
        Normal Price
        </label>
        <input type="text"
          id="normalPrice"
          name="normalPrice"
          disabled
          readOnly
        >{this.state.normalPrice}
        </input>

      </div>

    )
  }


}

export default Product
