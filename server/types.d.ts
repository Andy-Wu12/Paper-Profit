import { Context } from 'koa'

export interface CustomContext extends Context {
  body: {
    message: any,
    status: number
  }
}