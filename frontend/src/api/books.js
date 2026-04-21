import client from './client'

export const getBooks = (params) => client.get('/books', { params })
export const getBook = (id) => client.get(`/books/${id}`)
export const getGenres = () => client.get('/genres')
