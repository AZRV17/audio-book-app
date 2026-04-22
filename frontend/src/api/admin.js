import client from './client'

export const addBook = (data) => client.post('/admin/books', data)
export const updateBook = (id, data) => client.put(`/admin/books/${id}`, data)
export const deleteBook = (id) => client.delete(`/admin/books/${id}`)
