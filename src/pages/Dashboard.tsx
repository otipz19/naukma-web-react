import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, logout } from '../auth.ts'
import Loader from '../components/Loader.tsx'
import WeatherCard, { type DayForecast } from '../components/WeatherCard.tsx'

interface Place {
  latitude: number
  longitude: number
  name: string
}

interface OpenMeteoResponse {
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    wind_speed_10m_max: number[]
    precipitation_sum: number[]
  }
}

const KYIV: Place = { latitude: 50.4501, longitude: 30.5234, name: 'Kyiv' }

function getLocation(): Promise<Place> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(KYIV)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude, name: 'your location' }),
      () => resolve(KYIV),
      { timeout: 8000 },
    )
  })
}

async function fetchForecast({ latitude, longitude }: Place): Promise<DayForecast[]> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_sum',
    timezone: 'auto',
    forecast_days: '5',
  })
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
  const { daily }: OpenMeteoResponse = await res.json()
  return daily.time.map((date, i) => ({
    date,
    code: daily.weather_code[i],
    tempMax: daily.temperature_2m_max[i],
    tempMin: daily.temperature_2m_min[i],
    wind: daily.wind_speed_10m_max[i],
    precipitation: daily.precipitation_sum[i],
  }))
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [days, setDays] = useState<DayForecast[]>([])
  const [place, setPlace] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getLocation()
      .then((loc) => {
        if (!cancelled) setPlace(loc.name)
        return fetchForecast(loc)
      })
      .then((data) => {
        if (!cancelled) setDays(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <header>
        <h1>5-day forecast{place && ` for ${place}`}</h1>
        <div>
          <span className="user">Hi, {getUser()}</span>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </header>
      {loading && <Loader />}
      {error && <div className="form-error">Failed to load weather: {error}</div>}
      <div className="cards">
        {days.map((d) => (
          <WeatherCard key={d.date} {...d} />
        ))}
      </div>
    </div>
  )
}
