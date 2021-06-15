export async function handler(event, context) {
  console.log(JSON.parse(event.body))
}
