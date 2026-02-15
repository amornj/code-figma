/**
 * API Client - Communicates with code-figma REST API
 */

import axios, { AxiosInstance } from 'axios'

export class CodeFigmaClient {
  private client: AxiosInstance
  private token: string | null = null

  constructor(private apiUrl: string) {
    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  setToken(token: string) {
    this.token = token
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // Projects
  async listProjects() {
    const { data } = await this.client.get('/api/projects')
    return data.projects
  }

  async getProject(id: string) {
    const { data } = await this.client.get(`/api/projects/${id}`)
    return data.project
  }

  async createProject(name: string, description?: string) {
    const { data } = await this.client.post('/api/projects', { name, description })
    return data.project
  }

  async updateProject(id: string, name?: string, description?: string) {
    const { data } = await this.client.put(`/api/projects/${id}`, { name, description })
    return data.project
  }

  async deleteProject(id: string) {
    const { data } = await this.client.delete(`/api/projects/${id}`)
    return data
  }

  // Designs
  async listDesigns(projectId: string) {
    const { data } = await this.client.get(`/api/projects/${projectId}/designs`)
    return data.designs
  }

  async importFigmaDesign(projectId: string, figmaUrl: string) {
    const { data } = await this.client.post('/api/designs/import', {
      projectId,
      figmaUrl,
    })
    return data.design
  }

  async getDesign(id: string) {
    const { data } = await this.client.get(`/api/designs/${id}`)
    return data.design
  }

  async deleteDesign(id: string) {
    const { data } = await this.client.delete(`/api/designs/${id}`)
    return data
  }

  async generateCode(designId: string) {
    const { data } = await this.client.post(`/api/designs/${designId}/generate`)
    return data.result
  }

  async getDesignComponents(designId: string) {
    const { data } = await this.client.get(`/api/designs/${designId}/components`)
    return data.components
  }

  // Components
  async getComponent(id: string) {
    const { data } = await this.client.get(`/api/components/${id}`)
    return data.component
  }

  async updateComponent(id: string, code?: string, name?: string) {
    const { data } = await this.client.put(`/api/components/${id}`, { code, name })
    return data.component
  }

  async deleteComponent(id: string) {
    const { data } = await this.client.delete(`/api/components/${id}`)
    return data
  }
}
