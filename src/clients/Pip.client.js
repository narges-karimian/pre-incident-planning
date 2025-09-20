import { Client } from 'src/boot/axios'
import { getEnv } from 'src/utils'
import { jwtToken } from './interceptors'

const defaultsClientConfig = {
  errorNotification: {
    show: () => true,
  },
}

const HEADER_CONFIG = {
  Accept: 'application/json',
}

export default new Client({
  baseURL: getEnv('SERVER'),
  interceptors: [jwtToken],
  headers: HEADER_CONFIG,
  defaults: defaultsClientConfig,
  clientName: 'pip',
}).getInstance()
