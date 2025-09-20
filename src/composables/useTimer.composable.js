import { computed, onUnmounted, reactive, toRefs } from 'vue'

// Storage class for managing timer state
class TimerStorage {
  // Storage types
  static TYPES = {
    LOCAL: localStorage,
    SESSION: sessionStorage,
  }

  constructor(key, type = TimerStorage.TYPES.LOCAL) {
    this.key = key
    this.storage = type
  }

  get(storageKey) {
    const value = this.storage.getItem(`${this.key}:${storageKey}`)
    try {
      return value ? JSON.parse(value) : null
    } catch {
      return value
    }
  }

  set(storageKey, value) {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value
    this.storage.setItem(`${this.key}:${storageKey}`, stringValue)
  }

  remove(storageKey) {
    this.storage.removeItem(`${this.key}:${storageKey}`)
  }
}

class TimerMode {
  static MODES = {
    COUNTDOWN: 'countdown',
    COUNTUP: 'countup',
  }

  static get DEFAULT_MODE() {
    return this.MODES.COUNTDOWN
  }

  static getModeStrategy(mode) {
    return this.STRATEGIES[mode] || this.STRATEGIES[this.DEFAULT_MODE]
  }

  static STRATEGIES = {
    countdown: {
      getTimeChange: (rate) => -rate,
      getLimit: (timeRange) => timeRange.min,
      getLimitFn: () => Math.max,
      getInitialTime: (timeRange) => timeRange.max,
      getProgress: (remainingSeconds, timeRange) =>
        (timeRange.max - remainingSeconds) / (timeRange.max - timeRange.min),
      isExpired: (remainingSeconds, timeRange) => remainingSeconds <= timeRange.min,
      getRemainingSeconds: (timeRange, expiryTimestamp) =>
        Math.max(timeRange.min, Math.floor((expiryTimestamp - Date.now()) / 1000)),
    },
    countup: {
      getTimeChange: (rate) => rate,
      getLimit: (timeRange) => timeRange.max,
      getLimitFn: () => Math.min,
      getInitialTime: (timeRange) => timeRange.min,
      getProgress: (remainingSeconds, timeRange) =>
        (remainingSeconds - timeRange.min) / (timeRange.max - timeRange.min),
      isExpired: (remainingSeconds, timeRange) => remainingSeconds >= timeRange.max,
      getRemainingSeconds: (timeRange, expiryTimestamp) =>
        Math.min(timeRange.max, Math.floor((Date.now() - expiryTimestamp) / 1000)),
    },
  }
}

class TimerFormatter {
  static formatTime(remainingSeconds, timeRange, mode) {
    const hours = Math.floor(remainingSeconds / 3600)
    const minutes = Math.floor((remainingSeconds % 3600) / 60)
    const seconds = remainingSeconds % 60
    const strategy = TimerMode.getModeStrategy(mode)

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      totalSeconds: remainingSeconds,
      progress: strategy.getProgress(remainingSeconds, timeRange),
    }
  }
}

class Timer {
  #timerInterval = null
  #expiryTimestamp = null
  #onStateChange = () => {}
  #storageKey = 'timerState'
  #state = null
  #strategy = null

  constructor({
    timeRange = { min: 0, max: 120 },
    storage,
    onStateChange,
    rate = 1,
    mode = TimerMode.DEFAULT_MODE,
    interval = 1000,
  }) {
    this.timeRange = { ...timeRange }
    this.storage = storage
    this.#onStateChange = onStateChange
    this.#strategy = TimerMode.getModeStrategy(mode)

    this.#state = {
      isRunning: false,
      isPaused: false,
      isExpired: false,
      remainingSeconds: this.#strategy.getInitialTime(timeRange),
      rate,
      mode,
      interval,
    }
  }

  #updateState(updates) {
    Object.assign(this.#state, updates)

    this.storage.set(this.#storageKey, {
      expiryTimestamp: this.#expiryTimestamp,
      rate: this.#state.rate,
      mode: this.#state.mode,
      interval: this.#state.interval,
    })

    this.#onStateChange({
      ...this.#state,
      formattedTime: TimerFormatter.formatTime(
        this.#state.remainingSeconds,
        this.timeRange,
        this.#state.mode,
      ),
    })
  }

  #calculateRemainingSeconds() {
    return this.#strategy.getRemainingSeconds(this.timeRange, this.#expiryTimestamp)
  }

  #checkExpiration(remainingSeconds) {
    return TimerMode.getModeStrategy(this.#state.mode).isExpired(remainingSeconds, this.timeRange)
  }

  #updateTimer() {
    const remainingSeconds = this.#calculateRemainingSeconds()

    this.#updateState({ remainingSeconds })

    if (this.#checkExpiration(remainingSeconds)) this.#handleExpire()
  }

  #handleExpire() {
    this.#updateState({
      isRunning: false,
      isExpired: true,
      isPaused: false,
    })

    clearInterval(this.#timerInterval)
    this.#timerInterval = null
    this.storage.remove(this.#storageKey)
  }

  start() {
    if (this.#state.isRunning) return

    if (
      this.#state.isExpired ||
      this.#strategy.isExpired(this.#state.remainingSeconds, this.timeRange)
    ) {
      this.reset()
    }

    this.#expiryTimestamp = Date.now() + this.#state.remainingSeconds * 1000

    this.#updateState({
      isRunning: true,
      isPaused: false,
      isExpired: false,
    })

    this.#timerInterval = setInterval(() => this.#updateTimer(), this.#state.interval)
  }

  pause() {
    if (!this.#state.isRunning) return

    clearInterval(this.#timerInterval)
    this.#timerInterval = null

    this.#updateState({
      remainingSeconds: this.#calculateRemainingSeconds(),
      isRunning: false,
      isPaused: true,
      isExpired: false,
    })
  }

  stop() {
    clearInterval(this.#timerInterval)
    this.#timerInterval = null
    this.#expiryTimestamp = null

    this.#updateState({
      remainingSeconds: this.#strategy.getInitialTime(this.timeRange),
      isRunning: false,
      isExpired: false,
      isPaused: false,
    })

    this.storage.remove(this.#storageKey)
  }

  resume() {
    if (!this.#state.isPaused) return
    this.#expiryTimestamp = Date.now() + this.#state.remainingSeconds * 1000
    this.start()
  }

  reset() {
    this.#expiryTimestamp = null
    clearInterval(this.#timerInterval)
    this.#timerInterval = null

    this.#updateState({
      remainingSeconds: this.#strategy.getInitialTime(this.timeRange),
      isRunning: false,
      isExpired: false,
      isPaused: false,
    })
  }

  restart() {
    this.reset()
    this.start()
  }

  initialize() {
    const storedState = this.storage.get(this.#storageKey)
    if (storedState?.expiryTimestamp) {
      this.#expiryTimestamp = storedState.expiryTimestamp
      const remainingSeconds = this.#calculateRemainingSeconds()
      const isExpired = this.#checkExpiration(remainingSeconds)
      this.#updateState({
        remainingSeconds,
        isExpired,
        rate: storedState.rate,
        mode: storedState.mode,
        interval: storedState.interval,
      })
      if (!isExpired) this.start()
    }
  }

  getState() {
    return { ...this.#state }
  }

  setRate(rate) {
    const newRate = Math.max(0.1, rate)
    this.#updateState({ rate: newRate })

    if (this.#state.isRunning) {
      this.#expiryTimestamp = Date.now() + this.#state.remainingSeconds * 1000
    }
  }

  setMode(mode) {
    const newMode = Object.values(TimerMode.MODES).includes(mode) ? mode : TimerMode.DEFAULT_MODE

    if (this.#state.isRunning) {
      const currentStrategy = TimerMode.getModeStrategy(this.#state.mode)
      const currentProgress = currentStrategy.getProgress(
        this.#state.remainingSeconds,
        this.timeRange,
      )
      const newRemainingSeconds =
        this.#strategy.getInitialTime(this.timeRange) +
        (this.timeRange.max - this.timeRange.min) * currentProgress

      this.#updateState({
        mode: newMode,
        remainingSeconds: newRemainingSeconds,
      })

      this.#expiryTimestamp = Date.now() + newRemainingSeconds * 1000
    } else {
      this.#updateState({ mode: newMode })
    }
  }

  setInterval(interval) {
    if (interval < 100) return

    this.#updateState({ interval })

    if (this.#state.isRunning) {
      clearInterval(this.#timerInterval)
      this.start()
    }
  }
}

const useTimer = ({
  timeRange = { min: 0, max: 120 },
  storageKey = 'timer-key',
  storageType = TimerStorage.TYPES.LOCAL,
  storage = null,
  rate = 1,
  mode = TimerMode.DEFAULT_MODE,
  interval = 1000,
} = {}) => {
  const storageInstance = storage || new TimerStorage(storageKey, storageType)
  const state = reactive({
    remainingSeconds: timeRange.max,
    isRunning: false,
    isExpired: false,
    isPaused: false,
    timeRange,
    rate,
    mode,
    interval,
  })

  const timer = new Timer({
    timeRange,
    storage: storageInstance,
    onStateChange: (data) => Object.assign(state, data),
    rate,
    mode,
    interval,
  })

  timer.initialize()
  Object.assign(state, timer.getState())

  const formattedTime = computed(() =>
    TimerFormatter.formatTime(state.remainingSeconds, state.timeRange, state.mode),
  )

  onUnmounted(() => state.isRunning && timer.stop())

  return {
    ...toRefs(state),
    formattedTime,
    start: () => timer.start(),
    stop: () => timer.stop(),
    pause: () => timer.pause(),
    resume: () => timer.resume(),
    reset: () => timer.reset(),
    restart: () => timer.restart(),
    setRate: (rate) => timer.setRate(rate),
    setMode: (mode) => timer.setMode(mode),
    setInterval: (interval) => timer.setInterval(interval),
  }
}

export default useTimer
