// IndexedDB utility for storing building images
class ImageDB {
  constructor() {
    this.dbName = 'BuildingImagesDB'
    this.version = 1
    this.storeName = 'images'
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })

          // Create indexes for efficient querying
          store.createIndex('buildingId', 'buildingId', { unique: false })
          store.createIndex('floorId', 'floorId', { unique: false })
          store.createIndex('buildingFloor', ['buildingId', 'floorId'], { unique: false })
        }
      }
    })
  }

  async ensureConnection() {
    if (!this.db) {
      await this.init()
    }
  }

  // Generate unique key for image
  generateImageKey(buildingId, floorId = null, timestamp = Date.now()) {
    const floorPart = floorId ? `_floor_${floorId}` : '_building'
    return `img_${buildingId}${floorPart}_${timestamp}`
  }

  // Convert File to base64 for storage
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Store image in IndexedDB
  async storeImage(file, buildingId, floorId = null, description = '') {
    await this.ensureConnection()

    try {
      const base64Data = await this.fileToBase64(file)
      const imageId = this.generateImageKey(buildingId, floorId)

      const imageData = {
        id: imageId,
        buildingId: buildingId,
        floorId: floorId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        description: description || file.name,
        base64Data: base64Data,
        createdAt: new Date().toISOString(),
        image: base64Data, // For compatibility with existing display logic
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.add(imageData)

        request.onsuccess = () => resolve(imageData)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to store image: ${error.message}`)
    }
  }

  // Get all images for a building
  async getBuildingImages(buildingId) {
    await this.ensureConnection()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('buildingId')
      const request = index.getAll(buildingId)

      request.onsuccess = () => {
        const allImages = request.result
        // Filter to get only building-level images (no floorId)
        const buildingImages = allImages.filter((img) => img.floorId === null)
        resolve(buildingImages)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Get all images for a specific floor
  async getFloorImages(buildingId, floorId) {
    await this.ensureConnection()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('buildingFloor')
      const request = index.getAll([buildingId, floorId])

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Get all images for a building (including all floors)
  async getAllBuildingImages(buildingId) {
    await this.ensureConnection()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('buildingId')
      const request = index.getAll(buildingId)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Delete an image
  async deleteImage(imageId) {
    await this.ensureConnection()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(imageId)

      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  }

  // Delete all images for a building
  async deleteBuildingImages(buildingId) {
    await this.ensureConnection()

    const images = await this.getAllBuildingImages(buildingId)
    const deletePromises = images.map((img) => this.deleteImage(img.id))

    return Promise.all(deletePromises)
  }

  // Delete all images for a specific floor
  async deleteFloorImages(buildingId, floorId) {
    await this.ensureConnection()

    const images = await this.getFloorImages(buildingId, floorId)
    const deletePromises = images.map((img) => this.deleteImage(img.id))

    return Promise.all(deletePromises)
  }
}

// Create singleton instance
export const imageDB = new ImageDB()
export default ImageDB
