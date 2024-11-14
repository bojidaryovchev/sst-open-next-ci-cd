export function extractSender() {
  if (!process.env.SST_RESOURCE_OpenNextEmail) {
    throw new Error("Parameter `SST_RESOURCE_OpenNextEmail` not found in `process.env`.");
  }

  const { sender } = JSON.parse(process.env.SST_RESOURCE_OpenNextEmail);

  return sender;
}
