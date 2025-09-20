import { PIP } from 'src/clients'
import OpenAI from 'openai'
import { getEnv } from 'src/utils'

const openai = new OpenAI({
  baseURL: getEnv('AI_BASE_URL'),
  apiKey: getEnv('AI_API_KEY'),
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    'x-stainless-arch': null,
    'x-stainless-lang': null,
    'x-stainless-os': null,
    'x-stainless-package-version': null,
    'x-stainless-retry-count': null,
    'x-stainless-runtime': null,
    'x-stainless-runtime-version': null,
    'x-stainless-timeout': null,
  },
})

const DEFAULT_PROMPT =
  'من اطلاعات مرتبط با یک ساختمان را برایت میفرستم با توجه به این اطلاعات بهم بگو در هنگام حادثه چه مواردی باید انجام شود تا سریعتر بتوان جان کاربران را نجات داد.'

export default {
  async createBuilding(buildingData) {
    try {
      const response = await PIP.post('/building/create-building/', buildingData)
      return response
    } catch (error) {
      console.log('Create Building action: ', error)
      return Promise.reject(error)
    }
  },

  async updateBuilding({ buildingId, buildingData }) {
    try {
      const response = await PIP.patch(`/building/update-building/${buildingId}`, buildingData)
      this.buildingFormData = response
      return response
    } catch (error) {
      console.log('Update Building action: ', error)
      return Promise.reject(error)
    }
  },

  async getConstants(type) {
    try {
      const response = await PIP.get(`/building/get-constants/`, {
        params: { type_of_constant: type },
      })
      return response
    } catch (error) {
      console.log('Get Constants action: ', error)
      return Promise.reject(error)
    }
  },

  async uploadImage({ image, description }) {
    try {
      let payload = null
      if (image instanceof FormData) {
        payload = image
        if (description != null && !payload.has('description'))
          payload.append('description', description)
      } else if (image instanceof File || (image && image.name && image.size)) {
        const formData = new FormData()
        formData.append('image', image)
        formData.append('description', description ?? '')
        payload = formData
      } else {
        payload = { image, description }
      }

      const response = await PIP.post(`/building/upload-image/`, payload)
      return response
    } catch (error) {
      console.log('Upload Image action: ', error)
      return Promise.reject(error)
    }
  },

  async generatePIP({ message = DEFAULT_PROMPT, model = 'gemini-1.5-flash', buildingData = {} }) {
    if (this.buildingData.pip) return this.buildingData.pip
    if (!Object.keys(buildingData).length) return ''

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: `لطفا پاسخ سوال زیر را به صورت موردی بده. پاسخ شامل موارد قبل از حادثه و هنگام حادثه باشد.`,
        },
        { role: 'user', content: `${message}  \n ${JSON.stringify(buildingData)}` },
      ],
    })

    this.buildingData.pip = completion.choices[0].message.content
    return completion.choices[0].message.content
  },
}
