import axios from 'axios'

import { DEFAULT_PAGE_SIZE } from '~/utils/settings'

export interface ColorPayload {
  rgb: [number, number, number]
}

export interface LED {
  id: number
  rgb: [number, number, number]
}

export interface Box {
  id?: number
  x: number
  y: number
  leds: number[]
}

export interface Grid {
  id?: number
  name: string
  width: number
  height: number
  boxes: Box[][]
}

export interface BoxRef {
  id: number
  x: number
  y: number
}

export interface Topic {
  id: number
  name: string
  path: string
}

export interface ArchiveEntryPreview {
  id: number
  title: string
  page?: string | null
}

export interface ArchivePublicationSummary {
  id: number
  external_id: string
  source_url: string
  title: string
  subtitle?: string | null
  authors: string[]
  imported_at?: string | null
  entry_count: number
  topics_preview: Topic[]
  entries_preview: ArchiveEntryPreview[]
}

export interface Book {
  id: number
  title: string
  author: string
  isbn?: string | null
  user_tags: string[]
  notes?: string | null
  box?: BoxRef | null
  archive_publication?: ArchivePublicationSummary | null
}

export interface MatchReason {
  type:
    | 'title'
    | 'author'
    | 'isbn'
    | 'tag'
    | 'note'
    | 'publication'
    | 'publication_author'
    | 'entry'
    | 'entry_creator'
    | 'topic'
  label: string
  detail?: string | null
}

export interface BookSearchResult extends Book {
  match_reasons: MatchReason[]
}

export interface BookMutationPayload {
  title: string
  author: string
  isbn?: string | null
  user_tags: string[]
  notes?: string | null
  box_id?: number | null
}

export interface BookUpdatePayload {
  title?: string
  author?: string
  isbn?: string | null
  user_tags?: string[]
  notes?: string | null
  box_id?: number | null
}

export interface BookImportResult {
  created: number
  skipped: number
  errors: string[]
}

export interface ArchiveLinkResponse {
  preview: {
    external_id: string
    source_url: string
    title: string
    subtitle?: string | null
    authors: string[]
  }
  book: Book
}

export interface LightingState {
  highlight_box_id?: number | null
  highlight_rgb?: [number, number, number] | null
  active_scene?: string | null
  scene_params: Record<string, unknown>
}

export type SceneName = 'off' | 'solid' | 'checkerboard' | 'rainbow' | 'swipe'

/** One page of results plus the full match count, so callers can render "showing N of M". */
export interface Paged<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface PageParams {
  limit?: number
  offset?: number
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
})

export const createBoxes = (width: number, height: number): Box[][] => {
  const boxes: Box[][] = []
  for (let y = 0; y < height; y += 1) {
    const row: Box[] = []
    for (let x = 0; x < width; x += 1) {
      row.push({ x, y, leds: [] })
    }
    boxes.push(row)
  }
  return boxes
}

export const toggleLedAssignment = (grid: Grid, ledId: number, rowIndex: number, columnIndex: number): Grid => {
  const nextGrid = structuredClone(grid)
  const current = nextGrid.boxes[rowIndex][columnIndex].leds
  nextGrid.boxes[rowIndex][columnIndex].leds = current.includes(ledId)
    ? current.filter(existingId => existingId !== ledId)
    : [...current, ledId]
  return nextGrid
}

export const listBooks = async (query = '', { limit = DEFAULT_PAGE_SIZE, offset = 0 }: PageParams = {}) => {
  const response = await apiClient.get<Paged<Book>>('/books', { params: { query, limit, offset } })
  return response.data
}

export const searchBooks = async (query = '', { limit = DEFAULT_PAGE_SIZE, offset = 0 }: PageParams = {}) => {
  const response = await apiClient.get<Paged<BookSearchResult>>('/books/search', {
    params: { query, limit, offset },
  })
  return response.data
}

export const createBook = async (payload: BookMutationPayload) => {
  const response = await apiClient.post<Book>('/books', payload)
  return response.data
}

export const updateBook = async (bookId: number, payload: BookUpdatePayload) => {
  const response = await apiClient.put<Book>(`/books/${bookId}`, payload)
  return response.data
}

export const deleteBook = async (bookId: number) => {
  const response = await apiClient.delete<Book>(`/books/${bookId}`)
  return response.data
}

export const importBooksCsv = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<BookImportResult>('/books/import', formData)
  return response.data
}

export const exportBooksCsv = async () => {
  const response = await apiClient.get<Blob>('/books/export', { responseType: 'blob' })
  return response.data
}

export const linkBookArchive = async (bookId: number, source: string) => {
  const response = await apiClient.post<ArchiveLinkResponse>(`/books/${bookId}/archive-link`, { source })
  return response.data
}

export const importBookArchive = async (bookId: number) => {
  const response = await apiClient.post<Book>(`/books/${bookId}/archive-import`)
  return response.data
}

export const listTopics = async (query = '') => {
  const response = await apiClient.get<Topic[]>('/topics', { params: { query } })
  return response.data
}

export const getGrid = async () => {
  try {
    const response = await apiClient.get<Grid>('/grid')
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw error
  }
}

export const createGrid = async (payload: { name: string; width: number; height: number }) => {
  const response = await apiClient.post<Grid>('/grid', payload)
  return response.data
}

export const updateGrid = async (payload: { name: string; width: number; height: number }) => {
  const response = await apiClient.put<Grid>('/grid', payload)
  return response.data
}

export const saveGridAssignments = async (assignments: Record<number, number[]>) => {
  const response = await apiClient.put<Grid>('/grid/leds', assignments)
  return response.data
}

export const highlightBookBox = async (boxId: number, rgb: [number, number, number]) => {
  const response = await apiClient.post<LightingState>('/lights/highlight', { box_id: boxId, rgb })
  return response.data
}

export const clearHighlight = async () => {
  const response = await apiClient.post<LightingState>('/lights/clear')
  return response.data
}

export const applyScene = async (name: SceneName, params: Record<string, unknown>) => {
  const response = await apiClient.post<LightingState>('/lights/scene', { name, params })
  return response.data
}

export const getLightingState = async () => {
  const response = await apiClient.get<LightingState>('/lights/state')
  return response.data
}

export const updateLed = async (ledId: number, rgb: [number, number, number]) => {
  const response = await apiClient.put<LED>(`/leds/${ledId}`, { rgb })
  return response.data
}
