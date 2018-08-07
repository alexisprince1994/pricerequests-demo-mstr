import React, { Component } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'

class Customer extends Component {
  constructor (props) {
    super(props)
    // Props

    this.handleBlur = this.handleBlur.bind(this)
    this.onSelect = this.onSelect.bind(this)

    // Other Expected Props
    // 1) validate(id, value)
    // 2) onChange(id, value)

    this.state = {
      'touched': false,
      'giveFeedback': this.props.formSubmitted,
      'isLoading': false,
      'feedback': null
    }
  }

  buildFeedback () {
    let feedback

    if (this.state.touched || this.state.giveFeedback) {
      if (this.state.selected) {
        // Does a logic check to see if its null because null and
        // false-y should be handled differently... unfortunately.
        this.setState({
          feedback: !!(this.state.selected && this.state.selected)
        })
      }
    } else {
      this.setState({
        feedback: null
      })
    }
  }

  onSelect (selected) {
    // Needing to use buildFeedback as a callback to make sure
    // we wait until the async call of setState is complete.

    this.setState({selected}, () => this.buildFeedback())
  }

  handleBlur (event) {
    // Needing to use buildFeedback as a callback to make sure
    // we wait until the async call of setState is complete.
    this.setState({
      'touched': true,
      'giveFeedback': true
    }, () => this.buildFeedback())
  }

  // isInvalid={(typeof (this.state.feedback) === 'object') ? undefined : true}
  render () {
    const { feedback } = this.state
    const { feedbackClassName } = this.state
    const { touched } = this.state
    const { giveFeedback } = this.state
    return (
      <div className={this.props.className}>
        <label htmlFor='customerName'>
          Customer Name
        </label>
        <div className='form-group row'>
          <AsyncTypeahead
            className='col-9 col-md-offset-4'
            isLoading={this.state.isLoading}
            onBlur={this.handleBlur}
            onChange={this.onSelect}
            isInvalid={(!feedback && (touched || giveFeedback)) ? true : null}
            isValid={this.state.feedback}
            options={this.state.options}
            selected={this.state.selected}
            onSearch={query => {
              this.setState({isLoading: true})
              fetch(`http://127.0.0.1:5000/customers?q=${query}`)
                .then(res => res.json())
                .then(json => this.setState({
                  isLoading: false,
                  options: json
                }, () => console.log(json))
                )
            }
            }
          />

        </div>
      </div>

    )
  }
}

export default Customer
