const CarController = require("./CarController");
const { Car, User } = require("../models");
const dayjs = require("dayjs");

describe("CarController", () => {

    describe("#handleCreateCar", () => {
        it("should response with 201 as status code and json", async () => {
            const mockCarData = { name: "BMW", price: 11.11, size: "Medium", image: "bmw.svg", isCurrentlyRented: false };
            const mockUserCarData = { userId: 1, carId: 1, rentStartAt: new Date(), rentEndedAt: new Date() };
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() }
            const mockRequest = { body: { mockCarData  } };
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

        it("should have return status 422 and error json", async () => {
            const err = new Error("found an error!");
            const mockCarData = { name: "BMW", price: 11.11, size: "Medium", image: "bmw.svg", isCurrentlyRented: false }; 
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
            const mockModel = {} 
            mockModel.create = jest.fn().mockReturnValue(Promise.reject(err))  
            const mockRequest = { body: { mockCarData } }; 
            const carController = new CarController({ carModel: mockModel }); 
            await carController.handleCreateCar(mockRequest, mockResponse) 
            expect(mockResponse.status).toHaveBeenCalledWith(422); 
            expect(mockResponse.json).toHaveBeenCalledWith({ error: { name: err.name, message: err.message } }); 
        });

    });
    
    describe("#getCarFromRequest", () => {
        it("should response with 200 as status code and json", async () => {
            const name = "Honda";
            const mockRequest = { params: {  id: 1 }  };
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
            const mockCar = new Car({ name });
            const mockCarModel = {};
            mockCarModel.findByPk = jest.fn().mockReturnValue(mockCar)
            const carController = new CarController({carModel: mockCarModel});
            const result = await carController.getCarFromRequest(mockRequest, mockResponse);
            expect(result).toStrictEqual(mockCar);
        })
    });

    describe("#handleDeleteCar", () => {
        it("should response with 204 as status code and json", async () => {
            const name = "Honda";
            const mockRequest = { params: {  id: 1 } }
            const mockResponse = { status: jest.fn().mockReturnThis(), end: jest.fn().mockReturnThis()  };
            const mockCar = new Car({ name })
            const mockCarModel = {}
            mockCarModel.destroy = jest.fn().mockReturnValue(mockCar)
            const carController = new CarController({carModel: mockCarModel});
            await carController.handleDeleteCar(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.end).toHaveBeenCalled()
        })
    });

    describe("#handleGetCar", () => {
        it("should response with 200 as status code and json", async () => {
            const name = "Honda";
            const mockRequest = {  params: {  id: 1 } };
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
            const mockCar = new Car({ name })
            const mockCarModel = {}
            mockCarModel.findByPk = jest.fn().mockReturnValue(mockCar)
            const carController = new CarController({carModel: mockCarModel});
            await carController.handleGetCar(mockRequest, mockResponse);
            const app = await carController.getCarFromRequest(mockRequest);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(app);
        })
    });

})
