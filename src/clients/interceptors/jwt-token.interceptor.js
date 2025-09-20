import { Cookies } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const jwtToken = {
  async onRequest(request) {
    const token = Cookies.get('access')
    if (!token || request.noNeedAuth) return request

    const authStore = useAuthStore()

    if (await authStore.verifyJWT()) {
      request.headers = {
        ...request.headers,
        Authorization: `Bearer ${token}`,
      }
    } else {
      try {
        const newToken = await authStore.refreshToken()
        request.headers = {
          ...request.headers,
          Authorization: `Bearer ${newToken}`,
        }
      } catch (error) {
        console.log('JWT interceptor ', error)

        const abortError = new Error('Authentication failed - refresh token error')
        abortError.name = 'AbortError'
        abortError.code = 'AUTH_FAILED'
        throw abortError
      }
    }

    return request
  },
}

export default jwtToken
