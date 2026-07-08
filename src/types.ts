export interface PhotoMetadata {
  id: string
  filename: string
  lat: number
  lon: number
  date: string
  year: number
  month: number
  thumbnail: string
  display: string
}

export interface TimelineDataNode {
  key: string
  count: number
  label: string
  year: number
  month: number
  photos: PhotoMetadata[]
}

export interface TimelinePoint extends TimelineDataNode {
  x: number
  y: number
}

export type CountEntry = [
  string,
  { count: number; label: string; year: number; month: number; photos: PhotoMetadata[] }
]
