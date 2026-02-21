jest.mock("../src/lib/redis", () => ({
      redis: {
            get: jest.fn(),
            set: jest.fn(),
            incr: jest.fn(),
            decr: jest.fn(),
            del: jest.fn(),
            ping: jest.fn(),
            on: jest.fn()
      }
}));
