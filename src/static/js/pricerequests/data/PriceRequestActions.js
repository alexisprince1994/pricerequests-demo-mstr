import PriceRequestDispatcher from './PriceRequestDispatcher'

export function updateCustomer (id, label, fromDropdown) {
  PriceRequestDispatcher.dispatch({
    actionType: 'UPDATE_CUSTOMER',
    id,
    label,
    fromDropdown
  })
}

export function customerBlurred () {
  PriceRequestDispatcher.dispatch({
    actionType: 'CUSTOMER_BLURRED',
    giveFeedback: true
  })
}

export function productBlurred () {
  PriceRequestDispatcher.dispatch({
    actionType: 'PRODUCT_BLURRED',
    giveFeedback: true
  })
}

export function updateProduct (id, label, fromDropdown) {
  PriceRequestDispatcher.dispatch({
    actionType: 'UPDATE_PRODUCT',
    id,
    label,
    fromDropdown
  })
}

export function updateRequestedUnits (units) {
  PriceRequestDispatcher.dispatch({
    actionType: 'UPDATE_REQUESTED_UNITS',
    units: units
  })
}

export function requestedUnitsBlurred () {
  PriceRequestDispatcher.dispatch({
    actionType: 'REQUESTED_UNITS_BLURRED',
    giveFeedback: true
  })
}

export function updateRequestReason (value) {
  PriceRequestDispatcher.dispatch({
    actionType: 'UPDATE_REQUEST_REASON',
    value
  })
}

export function updateDraft (checked) {
  PriceRequestDispatcher.dispatch({
    actionType: 'UPDATE_DRAFT',
    checked: checked
  })
}

export function receiveProductPrice (response) {
  PriceRequestDispatcher.dispatch({
    actionType: 'RECEIVE_PRODUCT_PRICE',
    response
  })
}

export function getProductPrice (id) {
  PriceRequestDispatcher.dispatch({
    actionType: 'GET_PRODUCT_PRICE',
    id
  })

  console.log('getProductPrice is called with id ', id)

  fetch(`http://127.0.0.1:5000/prices/${id}`)
    .then(res => res.json())
    .then(json => receiveProductPrice(json))
}

export function requestedPriceBlurred () {
  PriceRequestDispatcher.dispatch({
    actionType: 'REQUESTED_PRICE_BLURRED',
    giveFeedback: true
  })
}

export function updateRequestedPrice (value) {
  PriceRequestDispatcher.dispatch({
    actionType: 'UPDATE_REQUESTED_PRICE',
    value
  })
}
