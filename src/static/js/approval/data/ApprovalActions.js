import ApprovalDispatcher from './ApprovalDispatcher'

export function approveRequest (id) {
  ApprovalDispatcher.dispatch({
    actionType: 'APPROVE_REQUEST',
    id
  })
}

export function denyRequest (id) {
  ApprovalDispatcher.dispatch({
    actionType: 'DENY_REQUEST',
    id
  })
}

export function filterRequests (value) {
  ApprovalDispatcher.dispatch({
    actionType: 'FILTER',
    value
  })
}

export function initialRequestLoad () {
  ApprovalDispatcher.dispatch({
    actionType: 'LOAD'
  })
}
