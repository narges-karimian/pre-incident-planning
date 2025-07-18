const getEnv = (key) => JSON.parse(JSON.stringify(import.meta.env[`VITE_${key}`]))
export default getEnv
