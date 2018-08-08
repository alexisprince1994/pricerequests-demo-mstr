import PriceRequestDispatcher from './PriceRequestDispatcher'

export function updateCustomer (id, label, fromDropdown) {
  PriceRequestDispatcher.dispatch({
    actionType: 'UPDATE_CUSTOMER',
    id: id,
    label: label,
    fromDropdown: fromDropdown
  })
}

export function customerBlurred () {
  PriceRequestDispatcher.dispatch({
    actionType: 'CUSTOMER_BLURRED',
    giveFeedback: true
  })
}

export function updateProductName (id, label) {
  PriceRequestDispatcher.dispatch({
    actionType: 'UPDATE_PRODUCT',
    'id': id,
    label: label
  })
}

export function updateProductRequestedUnits (units) {
  PriceRequestDispatcher.dispatch({
    actionType: 'UPDATE_REQUESTED_UNITS',
    units: units
  })
}

export function updateRequestReason (text) {
  PriceRequestDispatcher.dispatch({
    actionType: 'UPDATE_REQUEST_REASON',
    text: text
  })
}

export function updateDraft (checked) {
  PriceRequestDispatcher.dispatch({
    actionType: 'UPDATE_DRAFT',
    checked: checked
  })
}
