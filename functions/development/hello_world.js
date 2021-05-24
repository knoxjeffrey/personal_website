import { randomNumberGenerator } from "/utils/random_number_generator"

export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Hello world ${randomNumberGenerator()}` })
  };
}
