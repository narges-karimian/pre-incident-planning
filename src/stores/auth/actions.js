import { Notify } from 'quasar'
import { PIP } from 'src/clients'
import { Cookies } from 'quasar'
import useRouter from 'src/router'

export default {
  // Helper function to decode JWT token
  decodeJWT(token) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.log('Error decoding JWT:', error)
      return null
    }
  },

  async sendOtp({ phoneNumber = '' }) {
    try {
      await PIP.post('/accounts/send-otp/', {
        phone_number: phoneNumber,
      })

      this.userInfo.phoneNumber = phoneNumber

      Notify.create({
        message: 'OTP sent successfully',
        color: 'primary',
        position: 'top-right',
      })
    } catch (error) {
      console.log('Send OTP action: ', error)
      return Promise.reject(error)
    }
  },

  async verifyOtp({ phoneNumber = '', otp = '' }) {
    try {
      const { refresh, access } = await PIP.post('/accounts/verify-otp/', {
        phone_number: phoneNumber,
        otp_code: otp,
      })
      Cookies.set('refresh', refresh)
      Cookies.set('access', access)

      // Extract user role from access token payload
      const tokenPayload = this.decodeJWT(access)
      if (tokenPayload && tokenPayload.user_role) {
        this.userInfo.userRole = tokenPayload.user_role
        this.userInfo.name = tokenPayload.name
      }
    } catch (error) {
      console.log('Verify OTP action: ', error)
      return Promise.reject(error)
    }
  },

  async verifyJWT() {
    const jwt = Cookies.get('access')
    try {
      await PIP.post('/auth/jwt/verify/', { token: jwt }, { noNeedAuth: true })
      return true
    } catch (error) {
      console.log('Verify JWT action: ', error)
      return false
    }
  },

  async refreshToken() {
    const refreshToken = Cookies.get('refresh')
    try {
      const { access } = await PIP.post(
        '/auth/jwt/refresh/',
        { refresh: refreshToken },
        { noNeedAuth: true },
      )
      Cookies.set('access', access)
      return access
    } catch (error) {
      console.log('Refresh Token action: ', error)
      this.logout()
      return Promise.reject(error)
    }
  },

  logout() {
    const router = useRouter()
    Cookies.remove('access')
    Cookies.remove('refresh')
    this.$reset()
    router.push('/auth/login')
  },
}
