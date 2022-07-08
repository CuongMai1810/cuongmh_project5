import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getCars } from '../../businessLogic/cars'
import { getUserId } from '../utils';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const cars = await getCars(getUserId(event))

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: cars
      })
    }
  })
handler.use(
  cors({
    credentials: true
  })
)
