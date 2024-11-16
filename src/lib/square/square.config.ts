import { Client, Environment, ApiError } from "square";

const client = new Client({
  bearerAuthCredentials: {
    accessToken: process.env.SQUARE_ACCESS_TOKEN ?? "",
  },
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? Environment.Sandbox
      : Environment.Production,
});

const { locationsApi, inventoryApi, catalogApi } = client;

async function getLocations() {
  try {
    let listLocationsResponse = await locationsApi.listLocations();

    let locations = listLocationsResponse.result.locations;

    if (locations) {
      locations.forEach(function (location) {
        console.log(
          location.id +
            ": " +
            location.name +
            (location?.address
              ? ", " +
                location?.address?.addressLine1 +
                ", " +
                location?.address?.locality
              : "")
        );
      });
    }
  } catch (error) {
    if (error instanceof ApiError) {
      error.result.errors.forEach(function (e: any) {
        console.log(e.category);
        console.log(e.code);
        console.log(e.detail);
      });
    } else {
      console.log("Unexpected error occurred: ", error);
    }
  }
}

getLocations();
