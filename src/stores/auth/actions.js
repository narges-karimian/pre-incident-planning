export default {
  async sendOtp({ phoneNumber = '' }) {
    try {
      console.log(phoneNumber)

      //
    } catch (error) {
      console.log('Send OTP action: ', error)
      return Promise.reject(error)
    }
  },
}
