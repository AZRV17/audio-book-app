import client from './client'

export const getBooks = (params) => client.get('/books', { params })
export const getBook = (id) => client.get(`/books/${id}`)
export const getBookParts = (id) => client.get(`/books/${id}/parts`)
export const getGenres = () => client.get('/genres')
