const CarController = require("./CarController");
const { Car, User, UserCar } = require("../models");
const dayjs = require("dayjs");
const { CarAlreadyRentedError } = require("../../app/errors");
const { Op } = require("sequelize");

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

    describe("#handleRentCar", () => {
        test("it should respond with 201 and return some userCar", async () => {
          const mockCar = new Car({
            id: 1,
            name: "Bugatti",
            price: 44.4,
            size: "Large",
            image: "bugatti.jpg",
            isCurrentlyRented: false,
          });
          const mockUserCar = new UserCar({
            userId: 1,
            carId: 1,
            rentStartedAt: new Date(),
            rentEndedAt: new Date(),
          });
    
          const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
          };
          const mockReq = {
            body: {
              rentStartedAt: new Date(),
              rentEndedAt: new Date(),
            },
            params: {
              id: 1,
            },
            user: {
              id: 1,
            },
          };
    
          const mockCarModel = { findByPk: jest.fn().mockReturnValue(mockCar) };
          const mockUserCarModel = {
            findOne: jest.fn().mockReturnValue(null),
            create: jest.fn().mockReturnValue({
              userId: mockUserCar.userId,
              carId: mockUserCar.carId,
              rentStartedAt: mockUserCar.rentStartedAt,
              rentEndedAt: mockUserCar.rentEndedAt,
            }),
          };
    
          const mockNext = jest.fn();
    
          const carController = new CarController({
            carModel: mockCarModel,
            userCarModel: mockUserCarModel,
            dayjs,
          });
          await carController.handleRentCar(mockReq, mockRes, mockNext);
    
          expect(mockCarModel.findByPk).toHaveBeenCalledWith(1);
          expect(mockUserCarModel.findOne).toHaveBeenCalledWith({
            where: {
              carId: mockCar.id,
              rentStartedAt: {
                [Op.gte]: mockReq.body.rentStartedAt,
              },
              rentEndedAt: {
                [Op.lte]: mockReq.body.rentEndedAt,
              },
            },
          });
          expect(mockUserCarModel.create).toHaveBeenCalledWith({
            userId: mockReq.user.id,
            carId: mockCar.id,
            rentStartedAt: mockReq.body.rentStartedAt,
            rentEndedAt: mockReq.body.rentEndedAt,
          });
    
          expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    
        test("it shuld return the next function if there is an error", async () => {
          const mockCar = new Car({
            id: 1,
            name: "Bugatti",
            price: 44.4,
            size: "Large",
            image: "bugatti.jpg",
            isCurrentlyRented: false,
          });
    
          const mockCarModel = { findByPk: jest.fn().mockReturnValue(mockCar) };
          const mockUserCarModel = { findOne: jest.fn(() => Promise.reject(err)) };
    
          const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
          };
          const mockReq = {
            body: {
              rentStartedAt: new Date(),
              rentEndedAt: new Date(),
            },
            params: {
              id: 1,
            },
          };
          const mockNext = jest.fn();
    
          const carController = new CarController({
            carModel: mockCarModel,
            userCarModel: mockUserCarModel,
            dayjs,
          });
    
          await carController.handleRentCar(mockReq, mockRes, mockNext);
    
          expect(mockCarModel.findByPk).toHaveBeenCalledWith(1);
          expect(mockUserCarModel.findOne).toHaveBeenCalledWith({
            where: {
              carId: mockCar.id,
              rentStartedAt: {
                [Op.gte]: mockReq.body.rentStartedAt,
              },
              rentEndedAt: {
                [Op.lte]: mockReq.body.rentEndedAt,
              },
            },
          });
          expect(mockNext).toHaveBeenCalled();
        });
    
        test("it should respond with 422 as a status if car has already rented", async () => {
          const mockCar = new Car({
            id: 1,
            name: "Avanza",
            price: "10000",
            size: "small",
            image: "test.jpg",
            isCurrentlyRented: true,
          });
          const mockCarModel = {
            findByPk: jest.fn().mockReturnValue(mockCar),
          };
    
          const mockUserCar = new UserCar({
            userId: 1,
            carId: 1,
            rentStartedAt: new Date(),
            rentEndedAt: new Date(),
          });
          const mockUserCarModel = {
            findOne: jest.fn().mockReturnValue(mockUserCar),
          };
    
          const carController = new CarController({
            carModel: mockCarModel,
            userCarModel: mockUserCarModel,
            dayjs,
          });
    
          const req = {
            body: {
              rentStartedAt: new Date(),
              rentEndedAt: new Date(),
            },
            params: {
              id: 1,
            },
          };
          const res = {
            status: jest.fn(422).mockReturnThis(),
            json: jest.fn().mockReturnThis(),
          };
          const next = jest.fn()
    
          res.json = new CarAlreadyRentedError(mockCar);
    
          await carController.handleRentCar(req, res, next);
    
          expect(mockCarModel.findByPk).toHaveBeenCalledWith(req.params.id);
          expect(mockUserCarModel.findOne).toHaveBeenCalledWith({
            where: {
              carId: mockCar.id,
              rentStartedAt: {
                [Op.gte]: req.body.rentStartedAt,
              },
              rentEndedAt: {
                [Op.lte]: req.body.rentEndedAt,
              },
            },
          });
          expect(res.status);
          expect.anything(res.json, res.json);
    
        });
      });
    

})
