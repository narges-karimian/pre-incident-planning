import { PIP } from 'src/clients'

export default {
  async getAllInspectionRequests() {
    try {
      const response = await PIP.get(`/management/inspections/`)
      return response
    } catch (error) {
      console.log('Get Inspections action: ', error)
      return Promise.reject(error)
    }
  },

  async createInspectionRequest({ buildingID, head_staff, staffs = [], data = {} }) {
    try {
      const response = await PIP.post(`/management/inspections/`, {
        building: buildingID,
        head_staff: head_staff,
        staff: staffs,
        ...data,
      })
      return response
    } catch (error) {
      console.log('Create Inspection Request action: ', error)
      return Promise.reject(error)
    }
  },

  async modifyInspectionStatus({ inspectionRequestId, status = true }) {
    try {
      const response = await PIP.patch(`/management/review-inspection/${inspectionRequestId}/`, {
        status,
      })
      return response
    } catch (error) {
      console.log('Modify Inspection Request action: ', error)
      return Promise.reject(error)
    }
  },

  //staff inspection modifications

  async getStaffInspectionRequests() {
    try {
      const response = await PIP.get(`/management/staff-inspection/`)
      return response
    } catch (error) {
      console.log('Get Staff Inspection Requests action: ', error)
      return Promise.reject(error)
    }
  },

  async modifyStaffInspection({ inspectionRequestId, type_of_report, value }) {
    try {
      const response = await PIP.patch(`/management/modify-inspection/`, {
        inspection: inspectionRequestId,
        type_of_report,
        value,
      })
      return response
    } catch (error) {
      console.log('Modify Staff Inspection action: ', error)
      return Promise.reject(error)
    }
  },
}
