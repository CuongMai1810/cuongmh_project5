import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createCar, deleteCar, getCars, patchCar } from '../api/cars-api'
import Auth from '../auth/Auth'
import { Car } from '../types/Car'

interface CarsProps {
  auth: Auth
  history: History
}

interface CarsState {
  cars: Car[]
  newCarName: string
  newCarBrand: string
  loadingCars: boolean
}

export class Cars extends React.PureComponent<CarsProps, CarsState> {
  state: CarsState = {
    cars: [],
    newCarName: '',
    newCarBrand:'',
    loadingCars: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newCarName: event.target.value })
  }

  handleBrandChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newCarBrand: event.target.value })
  }

  onEditButtonClick = (carId: string) => {
    this.props.history.push(`/cars/${carId}/edit`)
  }

  onCarCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {

      if (!this.state.newCarName.trim()) {
        alert('Create Car Fail. Please try input name again')
        return
      }

      if (!this.state.newCarBrand.trim()) {
        alert('Create Car Fail. Please try input brand again')
        return
      }
      const newCar = await createCar(this.props.auth.getIdToken(), {
        name: this.state.newCarName,
        brand: this.state.newCarBrand,
      })
      this.setState({
        cars: [...this.state.cars, newCar],
        newCarName: '',
        newCarBrand: ''
      })
    } catch {
      alert('Car creation failed')
    }
  }

  onCarDelete = async (carId: string) => {
    try {
      await deleteCar(this.props.auth.getIdToken(), carId)
      this.setState({
        cars: this.state.cars.filter(car => car.carId !== carId)
      })
    } catch {
      alert('Car deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const cars = await getCars(this.props.auth.getIdToken())
      this.setState({
        cars,
        loadingCars: false
      })
    } catch (e) {
      alert(`Failed to fetch cars:`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">CARs</Header>

        {this.renderCreateCarInput()}

        {this.renderCars()}
      </div>
    )
  }

  renderCreateCarInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onCarCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Input Car Name"
            onChange={this.handleNameChange}
          />
          <Input
            fluid
            actionPosition="left"
            placeholder="Input Car Brand"
            onChange={this.handleBrandChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderCars() {
    if (this.state.loadingCars) {
      return this.renderLoading()
    }

    return this.renderCarsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading CARs
        </Loader>
      </Grid.Row>
    )
  }

  renderCarsList() {
    return (
      <Grid padded>
        {this.state.cars.map((car, pos) => {
          return (
            <Grid.Row key={car.carId}>
              <Grid.Column width={10} verticalAlign="middle">
                {car.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {car.brand}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(car.carId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onCarDelete(car.carId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {car.attachmentUrl && (
                <Image src={car.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
