import { DefaultContext } from 'koa'

export interface CustomContext extends DefaultContext {
  body: {
    message: any,
    status: number
  }
}
