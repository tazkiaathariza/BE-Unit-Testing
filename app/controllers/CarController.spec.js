const CarController = require("../../app/controllers/CarController");
const { Car, User} = require("../../app/models");
const dayjs = require("dayjs");

describe(CarController, () => {

    describe("#handleCreateCar", () => {
        it("should response with 201 as status code and json", async () => {
            const mockCarData = { name: "BMW", price: 11.11, size: "Medium", image: "bmw.svg", isCurrentlyRented: false };
            const mockUserCarData = { userId: 1, carId: 1, rentStartAt: new Date(), rentEndedAt: new Date() };
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() }
            const mockRequest = { body: { name: "BMW", price: 11.11, size: "Medium", image: "svg.jpg" } };
            const mockCar = new Car(mockCarData);
            const mockUserCar = new User(mockUserCarData);
            const mockCarModel = { create: jest.fn().mockReturnValue(mockCar)};
            const mockUserCarModel = { mockUserCar };
            const carController = new CarController({ carModel: mockCarModel, userCarModel: mockUserCarModel, dayjs });
            await carController.handleCreateCar(mockRequest, mockResponse);
            expect(mockCarModel.create).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockCar);
        });
    });
    
    describe("#handleUpdateCar", () => {
         it("should response with 200 as status code and json", async () => {
             const mockCarData = { name: "Toyota", price: 12.12, size: "Large", image: "toyota.svg", isCurrentlyRented: false };
             const mockUserCarData = { userId: 1, carId: 1, rentStartAt: new Date(), rentEndedAt: new Date() };
             const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() }
             const mockRequest = { body: { name: "Toyota", price: 12.12, size: "Large", image: "toyota.svg" } };
             const mockCar = new Car(mockCarData);
             const mockUserCar = new User(mockUserCarData);
             const mockCarModel = { update: jest.fn().mockReturnValue(mockCar)};
             const mockUserCarModel = { mockUserCar };
             const carController = new CarController({ carModel: mockCarModel, userCarModel: mockUserCarModel, dayjs });
             await carController.handleCreateCar(mockRequest, mockResponse);
             expect(mockCarModel.update).toHaveBeenCalled();
             expect(mockResponse.status).toHaveBeenCalledWith(200);
             expect(mockResponse.json).toHaveBeenCalledWith(mockCar);
         });
     });
     
});
