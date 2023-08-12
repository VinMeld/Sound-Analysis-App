#include "secrets.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>
#define SAMPLE_INTERVAL 100 // milliseconds

extern "C" {
  #include "esp_wifi.h"
}

#define AWS_IOT_PUBLISH_TOPIC   "esp32/pub"
#define AWS_IOT_SUBSCRIBE_TOPIC "esp32/sub"
#define MICROPHONE_PIN 33
int aggregatedValue = 0;
int sampleCount = 0;
WiFiClientSecure net = WiFiClientSecure();
PubSubClient client(net);

void configureTime() {
    configTime(0, 0, "pool.ntp.org"); // Configure NTP. Arguments are timezone offsets and NTP server.
    time_t now = time(nullptr);
    while (now < 8 * 3600 * 2) {  // Wait for valid NTP time (8 hours * 3600 seconds/hour * 2 is just a random large number)
        delay(100);
        now = time(nullptr);
    }
    struct tm timeinfo;
    gmtime_r(&now, &timeinfo);
    Serial.print("Current time: ");
    Serial.println(asctime(&timeinfo));
}


void messageHandler(char* topic, byte* payload, unsigned int length)
{
  Serial.print("incoming: ");
  Serial.println(topic);
 
  StaticJsonDocument<200> doc;
  deserializeJson(doc, payload);
  const char* message = doc["message"];
  Serial.println(message);
}


void connectAWS()
{
  Serial.println("WIFI_SSD AND WIFI_PASSWORD");
  Serial.println(WIFI_SSID);
  Serial.println(WIFI_PASSWORD);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  Serial.println("Connecting to Wi-Fi");
 
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
 
  // Configure WiFiClientSecure to use the AWS IoT device credentials
  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE);
 
  // Connect to the MQTT broker on the AWS endpoint we defined earlier
  client.setServer(AWS_IOT_ENDPOINT, 8883);
 
  // Create a message handler
  client.setCallback(messageHandler);
 
  Serial.println("Connecting to AWS IOT");
 
  while (!client.connect(THINGNAME))
  {
    Serial.print(".");
    delay(100);
  }
 
  if (!client.connected())
  {
    Serial.println("AWS IoT Timeout!");
    return;
  }
 
  // Subscribe to a topic
  client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);

}

void publishMessage(int decibel) {
    time_t now;
    time(&now); // get the current time

    DynamicJsonDocument doc(256);
    doc["decibel"] = decibel;
    doc["timestamp"] = now;
    doc["partition"] = "ESP32";

    String payload;
    serializeJson(doc, payload);

    Serial.println("publishing");
    bool result = client.publish(AWS_IOT_PUBLISH_TOPIC, payload.c_str());
    if (!result) {
        Serial.println("Failed to publish message");
    } else {
        Serial.println("Published: " + payload);
    }
}
int readIntensity() {
    return analogRead(MICROPHONE_PIN);
}

void setup() {
    pinMode(MICROPHONE_PIN, INPUT);  // Setup the microphone pin
    Serial.begin(9600);
    Serial.println("I'm awake!");
    randomSeed(analogRead(0));
    connectAWS();
    configureTime();
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(100);
    }
    Serial.println("\nConnected to WiFi");
    delay(1000);
}

void loop() {
    if (!client.connected()) {
        connectAWS();
    }

    // Read decibel value from the microphone
    int decibelValue = readIntensity();

    aggregatedValue += decibelValue;
    sampleCount++;

    // Check if we've hit our aggregation period
    if (sampleCount * SAMPLE_INTERVAL >= 1000) {
        // Calculate the average decibel value over the aggregation period
        int averageDecibel = aggregatedValue / sampleCount;

        // Send the average decibel value to the broker
        publishMessage(averageDecibel);

        // Reset aggregation values
        aggregatedValue = 0;
        sampleCount = 0;
    }

    client.loop();

    delay(SAMPLE_INTERVAL);
}
