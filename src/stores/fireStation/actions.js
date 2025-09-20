import { PIP } from 'src/clients'

export default {
  generatePersonalNumber() {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')

    return `${year}${month}${day}${hours}${minutes}${seconds}`
  },

  async createFireStationUser({ firstName, lastName, phoneNumber }) {
    try {
      const personnelCode = this.generatePersonalNumber()
      const response = await PIP.post('/management/create-staff/', {
        firstName,
        lastName,
        personnelCode,
        phoneNumber,
      })
      return response
    } catch (error) {
      console.log('Create Fire Station User action: ', error)
      return Promise.reject(error)
    }
  },

  async addUserToFireStation({ userId }) {
    try {
      const response = await PIP.post(`/management/add-member/`, {
        user_id: userId,
      })
      return response
    } catch (error) {
      console.log('Add User to Fire Station action: ', error)
      return Promise.reject(error)
    }
  },

  async getFireStationData() {
    try {
      const response = await PIP.get(`/management/fire-station-info/`)
      return response
    } catch (error) {
      console.log('Get Fire Station Data action: ', error)
      return Promise.reject(error)
    }
  },

  async getFireStationUsers(fireStationID) {
    try {
      const response = await PIP.get(`/management/staff-info/${fireStationID}/`)
      return response
    } catch (error) {
      console.log('Get Fire Station Users action: ', error)
      return Promise.reject(error)
    }
  },

  async modifyStaffStatus({ staffId, status }) {
    try {
      const response = await PIP.patch(`/management/modify-staff-status/`, {
        staff_id: staffId,
        status,
      })
      return response
    } catch (error) {
      console.log('Modify Staff Status action: ', error)
      return Promise.reject(error)
    }
  },

  async changeFireStationData({ fireStationData }) {
    try {
      const response = await PIP.patch(`/management/modify-fire-station-info/`, fireStationData)
      return response
    } catch (error) {
      console.log('Change Fire Station Data action: ', error)
      return Promise.reject(error)
    }
  },
}
