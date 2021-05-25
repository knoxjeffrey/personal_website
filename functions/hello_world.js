import { randomNumberGenerator } from "./utils/random_number_generator"
const { HELLO_WORLD } = process.env

export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: `${HELLO_WORLD} ${randomNumberGenerator()}` })
  };
}
