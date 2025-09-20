import { PIP } from 'src/clients'

export default {
  async getFormTemplate(templateId = 1) {
    try {
      const response = await PIP.get(`/form/api/templates/${templateId}`)
      this.formTemplate = response
      return response
    } catch (error) {
      console.log('Get Form Template action: ', error)
      return Promise.reject(error)
    }
  },

  async createForm(formData) {
    try {
      const response = await PIP.post(`/form/api/responses/`, {
        template: this.formTemplate.id,
        ...formData,
      })
      return response
    } catch (error) {
      console.log('Create Form action: ', error)
      return Promise.reject(error)
    }
  },

  async updateFormAnswers({ formId, formData }) {
    try {
      const response = await PIP.post(`/form/api/responses/${formId}/update_answers/`, formData)
      return response
    } catch (error) {
      console.log('Update Form action: ', error)
      return Promise.reject(error)
    }
  },

  async updateFormMetadata({ formId, formData }) {
    try {
      const response = await PIP.post(`/form/api/responses/${formId}/update_metadata`, formData)
      return response
    } catch (error) {
      console.log('Update Form Metadata action: ', error)
      return Promise.reject(error)
    }
  },

  async getForm(formId) {
    try {
      const response = await PIP.get(`/form/api/responses/${formId}/`)
      return response
    } catch (error) {
      console.log('Get Form action: ', error)
      return Promise.reject(error)
    }
  },
}
