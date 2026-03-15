/*
  Smart LPG Gas Leakage Detection System
  Arduino / ESP8266 (NodeMCU) Code
  
  Hardware Required:
  - NodeMCU ESP8266 or ESP32
  - MQ-2 Gas Sensor
  - LED (Red for danger, Green for safe)
  - Buzzer (optional)
  
  Connections:
  - MQ-2 AO pin -> A0 (NodeMCU analog pin)
  - MQ-2 DO pin -> D5 (digital threshold, optional)
  - MQ-2 VCC -> 3.3V or 5V
  - MQ-2 GND -> GND
  - Red LED -> D2 (through 220Ω resistor)
  - Green LED -> D3 (through 220Ω resistor)
  - Buzzer -> D4
*/

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

// ============= CONFIGURE THESE =============
const char* WIFI_SSID = "Your_WiFi_Name";
const char* WIFI_PASSWORD = "Your_WiFi_Password";
const char* SERVER_URL = "http://YOUR_SERVER_IP:5000/api/iot/reading";
const char* SENSOR_ID = "SENSOR-001";
const char* SENSOR_LOCATION = "Kitchen";
// ============================================

// Pin Definitions
#define GAS_SENSOR_PIN A0
#define RED_LED_PIN D2
#define GREEN_LED_PIN D3
#define BUZZER_PIN D4

// Thresholds (same as backend)
#define WARNING_THRESHOLD 300
#define DANGER_THRESHOLD 600

// Timing
#define SEND_INTERVAL 2000  // Send data every 2 seconds

unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  
  // Pin Modes
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Initial state
  digitalWrite(GREEN_LED_PIN, HIGH);
  digitalWrite(RED_LED_PIN, LOW);
  
  Serial.println("\n==== Smart LPG Gas Detection System ====");
  Serial.println("Connecting to WiFi...");
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
    // Blink green LED while connecting
    digitalWrite(GREEN_LED_PIN, !digitalRead(GREEN_LED_PIN));
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    digitalWrite(GREEN_LED_PIN, HIGH);
  } else {
    Serial.println("\n❌ WiFi connection failed! Running in offline mode.");
  }
}

void sendDataToServer(int gasLevel, String status) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected. Skipping send.");
    return;
  }
  
  WiFiClient client;
  HTTPClient http;
  
  http.begin(client, SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  
  // Build JSON payload
  StaticJsonDocument<256> doc;
  doc["sensorId"] = SENSOR_ID;
  doc["gasLevel"] = gasLevel;
  doc["location"] = SENSOR_LOCATION;
  doc["temperature"] = 25.0 + random(-20, 20) / 10.0;  // Simulated
  doc["humidity"] = 50.0 + random(-100, 100) / 10.0;   // Simulated
  
  String payload;
  serializeJson(doc, payload);
  
  int httpCode = http.POST(payload);
  
  if (httpCode > 0) {
    if (httpCode == HTTP_CODE_OK || httpCode == 201) {
      String response = http.getString();
      Serial.print("✅ Server response: ");
      Serial.println(response);
    } else {
      Serial.print("⚠️ HTTP Error: ");
      Serial.println(httpCode);
    }
  } else {
    Serial.print("❌ Connection error: ");
    Serial.println(http.errorToString(httpCode));
  }
  
  http.end();
}

void handleAlerts(int gasLevel, String status) {
  if (status == "danger") {
    // DANGER: Red LED on, buzzer beeping
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(GREEN_LED_PIN, LOW);
    
    // Rapid beep pattern
    for (int i = 0; i < 3; i++) {
      tone(BUZZER_PIN, 1000);
      delay(100);
      noTone(BUZZER_PIN);
      delay(100);
    }
    
  } else if (status == "warning") {
    // WARNING: Both LEDs alternate
    digitalWrite(RED_LED_PIN, HIGH);
    delay(200);
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(GREEN_LED_PIN, LOW);
    delay(200);
    digitalWrite(GREEN_LED_PIN, HIGH);
    
    // Single beep
    tone(BUZZER_PIN, 500);
    delay(300);
    noTone(BUZZER_PIN);
    
  } else {
    // SAFE: Green LED on
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(GREEN_LED_PIN, HIGH);
    noTone(BUZZER_PIN);
  }
}

void loop() {
  unsigned long currentTime = millis();
  
  // Read gas sensor
  int rawValue = analogRead(GAS_SENSOR_PIN);
  
  // Map to 0-1000 PPM scale (adjust based on calibration)
  int gasLevel = map(rawValue, 0, 1023, 0, 1000);
  
  // Determine status
  String status;
  if (gasLevel >= DANGER_THRESHOLD) {
    status = "danger";
  } else if (gasLevel >= WARNING_THRESHOLD) {
    status = "warning";
  } else {
    status = "safe";
  }
  
  // Print to serial monitor
  Serial.print("Raw: ");
  Serial.print(rawValue);
  Serial.print(" | PPM: ");
  Serial.print(gasLevel);
  Serial.print(" | Status: ");
  Serial.println(status);
  
  // Handle visual/audio alerts
  handleAlerts(gasLevel, status);
  
  // Send to server at regular intervals
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    sendDataToServer(gasLevel, status);
    lastSendTime = currentTime;
  }
  
  delay(100);
}
