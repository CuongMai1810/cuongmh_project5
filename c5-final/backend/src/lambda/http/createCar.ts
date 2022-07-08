import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateCarRequest } from '../../requests/CreateCarRequest'
import { getUserId } from '../utils';
import { createCar } from '../../businessLogic/cars'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const newCar: CreateCarRequest = JSON.parse(event.body)

    const newItem = await createCar(getUserId(event), newCar);

    return {
      statusCode: 201,
      body: JSON.stringify({item: newItem})
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)