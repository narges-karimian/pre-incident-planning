import { Client } from 'src/boot/axios'
import { getEnv } from 'src/utils'

const defaultsClientConfig = {
  errorNotification: {
    show: () => true,
  },
}

const HEADER_CONFIG = {
  'User-Agent': 'PreIncidentPlanning/1.0 (nargeskarimian1551@gmail.com)',
  Accept: 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
}

export default new Client({
  baseURL: getEnv('OPEN_STREET_MAP_API'),
  headers: HEADER_CONFIG,
  defaults: defaultsClientConfig,
  clientName: 'openStreetMap',
}).getInstance()
