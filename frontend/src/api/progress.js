import client from './client'

export const saveProgress = (bookId, position) =>
  client.post('/progress', { book_id: bookId, position })

export const getProgress = (bookId) =>
  client.get(`/progress/${bookId}`)