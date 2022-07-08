import { CarsAccess } from '../dataLayer/carsAcess'
import { AttachmentUtils } from '../fileStorage/attachmentUtils';
import { CarItem } from '../models/CarItem'
import { CreateCarRequest } from '../requests/CreateCarRequest'
import { UpdateCarRequest } from '../requests/UpdateCarRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

const logger = createLogger('cars')

const carsAccess = new CarsAccess()
const attachmentUtil = new AttachmentUtils()

export async function getCars(userId: string) {
  logger.info(`Retrieving all cars for user ${userId}`, { userId })
  return await carsAccess.getAllCars(userId)
}

export async function createCar(
  userId: string,
  createCarRequest: CreateCarRequest
): Promise<CarItem> {
  const carId = uuid.v4()

  const newItem: CarItem = {
    userId,
    carId,
    createdAt: new Date().toISOString(),
    attachmentUrl: null,
    ...createCarRequest
  }

  await carsAccess.createCar(newItem)

  return newItem
}

async function checkCar(userId: string, carId: string) {
  const existItem = await carsAccess.getCarItem(userId, carId)
  if (!existItem) {
    throw new createError.NotFound(`Car with id: ${carId} not found`)
  }

  if (existItem.userId !== userId) {
    throw new createError.BadRequest('User not authorized to update item')
  }
}

export async function updateCar(
  userId: string,
  carId: string,
  updateRequest: UpdateCarRequest
) {
  await checkCar(userId, carId)

  carsAccess.updateCarItem(userId, carId, updateRequest)
}

export async function deleteCar(userId: string, carId: string) {
  await checkCar(userId, carId)

  carsAccess.deleteCarItem(userId, carId)
}

export async function updateAttachmentUrl(
  userId: string,
  carId: string,
  attachmentId: string
) {
  await checkCar(userId, carId)

  const url = await attachmentUtil.getAttachmentUrl(attachmentId)

  await carsAccess.updateAttachmentUrl(userId, carId, url)
}

export async function generateAttachmentUrl(id: string): Promise<string> {
  return await attachmentUtil.getUploadUrl(id)
}