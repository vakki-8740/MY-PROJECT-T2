export const $ = (s) => document.querySelector(s)
export const appEl = $('#app')

export let currentUser = null
export let currentPage = ''
export let menuOpen = false
export let unsubTickets = null
export let unsubChat = null

export function setCurrentUser(user) { currentUser = user }
export function setCurrentPage(page) { currentPage = page }
export function setMenuOpen(open) { menuOpen = open }
export function setUnsubTickets(fn) { unsubTickets = fn }
export function setUnsubChat(fn) { unsubChat = fn }
export function getUnsubTickets() { return unsubTickets }
export function getUnsubChat() { return unsubChat }
