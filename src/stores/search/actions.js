import { OpenStreetMapClient, PIP } from 'src/clients'

export default {
  async search({ query, limit = 10 }) {
    try {
      const config = {
        params: {
          q: query,
          format: 'jsonv2',
          limit: limit,
          addressdetails: 1,
          countrycodes: 'ir',
        },
      }
      const response = await OpenStreetMapClient.get('/search', config)
      return response
    } catch (error) {
      console.log('Search action: ', error)
      return Promise.reject(error)
    }
  },

  async searchBuildingInfo({ lat, lng }) {
    try {
      const response = await PIP.get('/building/building-search', {
        params: { lat, lng },
      })
      return response[0]
    } catch (error) {
      console.log('Search Building action: ', error)
      return Promise.reject(error)
    }
  },
}
