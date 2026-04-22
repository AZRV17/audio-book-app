import client from './client'

export const addBook = (data) => client.post('/admin/books', data)
export const updateBook = (id, data) => client.put(`/admin/books/${id}`, data)
export const uploadAudio = (id, file) => {
  const form = new FormData()
  form.append('audio', file)
  return client.post(`/admin/books/${id}/upload-audio`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export const deleteBook = (id) => client.delete(`/admin/books/${id}`)
