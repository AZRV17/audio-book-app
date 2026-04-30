import client from './client'

export const getFavorites = () => client.get('/favorites')
export const checkFavorite = (bookId) => client.get(`/favorites/${bookId}`)
export const addFavorite = (bookId) => client.post(`/favorites/${bookId}`)
export const removeFavorite = (bookId) => client.delete(`/favorites/${bookId}`)
