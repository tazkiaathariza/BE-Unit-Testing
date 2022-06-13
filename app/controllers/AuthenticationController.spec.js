const { RecordNotFoundError } = require("../errors");
const AuthenticationController = require("./AuthenticationController");
const {JWT_SIGNATURE_KEY} = require("../../config/application")
//const userModel = require("../models/user");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { User, Role } = require("../models");
const jwt = require("jsonwebtoken");


describe("#AuthenticationController", () => {

    describe('#authorize', () => {
        it('it should be athorize', async () => {
          const mockRequest = {
            token: {
              header: {
                authorize: () => {
                  return;
                },
              },
            },
            payload: jest.fn().mockReturnThis(),
          };
          const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
          // const user = new User(mockRequest.token, mockRequest.payload);
          // const err = new InsufficientAccessError();
          // const error = { error: { name: err.name, message: err.message, details: err.details || null } };
          const authenticationController = new AuthenticationController('userModel', 'roleModel', 'bcrypt', 'jwt');
          const result = authenticationController.authorize(mockRequest, mockResponse);
        });
      });

    describe("#createTokenFromUser", () => {
        it("it should create new token", async () => {
            const user = { id: 1, name: "taz", email: "taz@gmail.com", image: "image.jpg" }
            const role = { id: 1, name: "ADMIN" }
            const mockUser = user;
            const mockRole = role;
            const token = jsonwebtoken.sign({
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email,
                image: mockUser.image,
                role: {
                    id: mockRole.id,
                    name: mockRole.name
                }
            }, JWT_SIGNATURE_KEY)
            const authenticationController = new AuthenticationController({jwt:jsonwebtoken})
            const result = await authenticationController.createTokenFromUser(mockUser, mockRole);
            const hasil = jest.fn();
            hasil.mockReturnValue(result);
            expect(result).toEqual(token);
        })
    });

    describe("#decodeToken", () => {
        it("should decode token", async () => {
          const user = { id: 1, name: "taz", email: "taz@gmail.com", image: "image.jpg" }
          const role = { id: 1, name: "ADMIN" }
          const mockUser = user;
          const mockRole = role;
          const token = jsonwebtoken.sign({
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email,
                image: mockUser.image,
                role: {
                    id: mockRole.id,
                    name: mockRole.name
                }
            }, JWT_SIGNATURE_KEY)
            const decoded = jsonwebtoken.verify(token, JWT_SIGNATURE_KEY)
            const authenticationController = new AuthenticationController({jwt: jsonwebtoken})
            const result = await authenticationController.decodeToken(token)
            expect(result).toEqual(decoded)
        })
    });

    describe("#encryptPassword", () => {
        it("should encrypt the password", async () => {
            const password = "sicmundus";
            const encrypt = bcrypt.hashSync(password, 10);
            const authenticationController = new AuthenticationController({jwt:jsonwebtoken, bcrypt:bcrypt})
            const result = await authenticationController.encryptPassword(password);
            expect(result.slice(0, -53)).toEqual(encrypt.slice(0, -53));
        });
    });

    describe("#verifyPassword", () => {
        it("should verify password and encrypted one", async () => {
            const password = "sicmundus";
            const encrypt = bcrypt.hashSync(password, 10);
            const verif = bcrypt.compareSync(password, encrypt)
            const authenticationController = new AuthenticationController({jwt:jsonwebtoken, bcrypt:bcrypt})
            const result = await authenticationController.verifyPassword(password, encrypt);
            expect(result).toEqual(verif);
        })
    });
     

})
