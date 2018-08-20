import ApprovalDispatcher from './ApprovalDispatcher'

export function approveRequest (id, newStatus) {
  ApprovalDispatcher.dispatch({
    actionType: 'APPROVE_REQUEST',
    id,
    newStatus
  })
}

export function denyRequest (id, newStatus) {
  ApprovalDispatcher.dispatch({
    actionType: 'DENY_REQUEST',
    id,
    newStatus
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

export function filterRequestsByDate (value) {
  ApprovalDispatcher.dispatch({
    actionType: 'FILTER_BY_DATE',
    value
  })
}
