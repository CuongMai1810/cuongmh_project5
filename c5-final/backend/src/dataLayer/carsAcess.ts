import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { CarItem } from '../models/CarItem'
import { CarUpdate } from '../models/CarUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('CarsAccess')

export class CarsAccess {
    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly carsTable = process.env.CARS_TABLE
    ) {}
  
    async getCarItem(userId: string, carId: string): Promise<CarItem> {
      return (
        await this.docClient
          .get({
            TableName: this.carsTable,
            Key: {
              userId,
              carId
            }
          })
          .promise()
      ).Item as CarItem
    }
  
    async getAllCars(userId: string): Promise<CarItem[]> {
      logger.info('Getting all cars')
      const result = await this.docClient
        .query({
          TableName: this.carsTable,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        })
        .promise()
  
      return result.Items as CarItem[]
    }
  
    async createCar(carItem: CarItem): Promise<CarItem> {
      logger.info('Create a new car')
      await this.docClient
        .put({
          TableName: this.carsTable,
          Item: carItem
        })
        .promise()
      return carItem
    }
  
    async updateCarItem(userId: string, carId: string, carUpdate: CarUpdate) {
      logger.info(`Updating car ${carId} with ${JSON.stringify(carUpdate)}`)
      await this.docClient
        .update({
          TableName: this.carsTable,
          Key: {
            userId,
            carId
          },
          UpdateExpression: 'set #name = :name, brand = :brand',
          ExpressionAttributeNames: {
            '#name': 'name'
          },
          ExpressionAttributeValues: {
            ':name': carUpdate.name,
            ':brand': carUpdate.brand
          }
        })
        .promise()
    }
  
    async deleteCarItem(userId: string, carId: string) {
      logger.info(`deleting car ${carId}`)
      await this.docClient
        .delete({
          TableName: this.carsTable,
          Key: {
            userId,
            carId
          }
        })
        .promise()
    }
  
    async updateAttachmentUrl(userId: string, carId: string, newUrl: string) {
      logger.info(
        `Updating ${newUrl} attachment URL for car ${carId} in table ${this.carsTable}`
      )
  
      await this.docClient
        .update({
          TableName: this.carsTable,
          Key: {
            userId,
            carId
          },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': newUrl
          }
        })
        .promise()
    }
  }
  
  function createDynamoDBClient(): DocumentClient {
    if (process.env.IS_OFFLINE) {
      logger.info('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }