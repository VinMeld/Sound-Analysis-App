# Sound Detection and Visualization System with ESP32 and AWS

## Overview
This project uses the ESP32 microcontroller paired with the MAX9814 microphone to detect and monitor sound levels. Detected sound data is sent via MQTT to the AWS IoT broker and stored in DynamoDB. A Next.js frontend application visualizes this data in real-time.

[Check out the live website here!](https://sound.vinaycloud.ca)


## Components

### Hardware:
1. **ESP32 Microcontroller**:
   - Responsible for sensing data from the microphone and communicating with the AWS IoT broker.
2. **MAX9814 Microphone**:
   - A high-quality microphone with auto-gain control, allowing for consistent sound level detection.

### Software:
1. **AWS IoT Broker** ![AWS icon](http://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg):
   - Middleware that receives data from the ESP32 and interfaces with DynamoDB.
2. **DynamoDB** ![DynamoDB icon](http://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg):
   - A NoSQL database provided by AWS to persistently store sound data.
3. **Next.js Application** ![Next.js icon](http://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original-wordmark.svg):
   - A real-time frontend application that fetches and visualizes data from DynamoDB.

## How It Works:
1. The MAX9814 microphone listens for sound.
2. Once sound is detected, the ESP32 reads the decibel level and packages this data.
3. The ESP32 initiates an MQTT publishing request to the AWS IoT broker with the sound data.
4. The AWS IoT broker, upon receiving the data, stores it in a DynamoDB table.
5. The Next.js frontend application periodically dispatches GET requests to fetch the latest sound data entries from DynamoDB.
6. The frontend visualizes this data using the `recharts` library, updating in real-time.

## Setting Up:

### Prerequisites:
- Node.js and npm installed.
- An AWS account with appropriate permissions for DynamoDB and IoT.
- ESP32 with the Arduino IDE set up.

