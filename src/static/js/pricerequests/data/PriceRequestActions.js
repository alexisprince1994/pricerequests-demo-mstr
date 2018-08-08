import dispatcher from './pricerequestdispatcher'

export function updateCustomer (id, label) {
  dispatcher.dispatch({
    actionType: 'UPDATE_CUSTOMER',
    id: id,
    label: label
  })
}

export function updateProductName (id, label) {
  dispatcher.dispatch({
    actionType: 'UPDATE_PRODUCT',
    'id': id,
    label: 'label'
  })
}

export function updateProductRequestedUnits (units) {
  dispatcher.dispatch({
    actionType: 'UPDATE_PRODUCT_REQUESTED_UNITS',
    units: units
  })
}

export function updateRequestReason (text) {
  dispatcher.dispatch({
    actionType: 'UPDATE_REQUEST_REASON',
    text: text
  })
}

export function updateDraft (checked) {
  dispatcher.dispatch({
    actionType: 'UPDATE_DRAFT',
    checked: checked
  })
}
