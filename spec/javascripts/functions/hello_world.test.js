const LambdaTester = require("lambda-tester")
const myHandler = require("hello_world").handler

jest.spyOn(global.Math, "random").mockReturnValue(0.5);

describe("handler", function() {
	it("returns hello world followed by a random number", async function() {
		await LambdaTester(myHandler)
			.event()
      .expectResolve((result) => {
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify({
          message: "Hello world 5",
        }))
      })
  })
})
