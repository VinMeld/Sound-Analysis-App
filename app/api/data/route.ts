// pages/api/deviceData.js
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";
import {
  DynamoDBClient,
  AttributeValue,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { URL } from "url";
type ParamsType = {
  TableName: string;
  Limit: number;
  ExclusiveStartKey?: {
    partition: { S: string };
    timestamp: { N: string };
  };
};
// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function GET(request: Request, response: NextApiResponse) {
  const url = new URL(request.url);

  // Handle Pagination
  const startKeyTimestamp = url.searchParams.get("startKeyTimestamp");
  const startKeyPartition = url.searchParams.get("startKeyPartition");

  let params : ParamsType = {
    TableName: "DeviceData",
    Limit: 50,
  };

  if (startKeyTimestamp && startKeyPartition) {
    params["ExclusiveStartKey"] = {
      partition: { S: startKeyPartition },
      timestamp: { N: startKeyTimestamp },
    };
  }

  try {
    console.log("Fetching data from DynamoDB");
    const data = await client.send(new ScanCommand(params));

    // Check if Items exist in the response
    if (data && data.Items) {
      const allItems = data.Items;

      // Sort by timestamp, ensure timestamp exists on both items
      const sortedItems = allItems.sort((a, b) => {
        const aTimestamp =
          a.timestamp && a.timestamp.N ? parseInt(a.timestamp.N, 10) : 0;
        const bTimestamp =
          b.timestamp && b.timestamp.N ? parseInt(b.timestamp.N, 10) : 0;
        return aTimestamp - bTimestamp;
      });

      // Map to desired format, ensure all properties exist
      const formattedData = sortedItems.map((item) => {
        const partition =
          item.partition && item.partition.S ? item.partition.S : "";
        const timestamp =
          item.timestamp && item.timestamp.N
            ? parseInt(item.timestamp.N, 10)
            : 0;
            let decibel = 0;
            if (
              item.payload &&
              item.payload.M &&
              item.payload.M.decibel &&
              item.payload.M.decibel.N
            ) {
              decibel = parseInt(item.payload.M.decibel.N, 10);
            }

        return { partition, timestamp, decibel };
      });

      console.log(formattedData);
      return new NextResponse(JSON.stringify(formattedData), { status: 200 });
    } else {
      console.warn("No items found in DynamoDB response");
      return new NextResponse("No data available", { status: 204 });
    }
  } catch (error) {
    console.log(error);
    return new NextResponse("Error fetching data from DynamoDB", {
      status: 500,
    });
  }
}
