import client from './client'

export const saveProgress = (bookId, position, partIndex = 0) =>
  client.post('/progress', { book_id: bookId, position, part_index: partIndex })

export const getProgress = (bookId) =>
  client.get(`/progress/${bookId}`)