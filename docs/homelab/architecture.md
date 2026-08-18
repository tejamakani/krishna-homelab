---
title: HomeLab Architecture
sidebar_label: 02 · Architecture
description: Physical, logical, service, surveillance, messaging, and automation architecture of the Makani HomeAuto HomeLab.
---

# HomeLab Architecture

The **Makani HomeAuto HomeLab** is a modular engineering environment used to develop, integrate, test, and validate the technologies that will eventually form the Production HomeAuto platform.

The current architecture combines:

- Windows 11 host infrastructure
- Ubuntu Server virtual machine
- Docker-based services
- Container management and observability
- Mosquitto MQTT messaging
- Frigate AI surveillance
- Camera streaming through go2rtc
- Object and person detection
- License Plate Recognition
- Home Assistant
- HACS integrations
- Smart-home dashboards
- Weather and aircraft monitoring
- Alexa integration
- Direct Frigate REST API integration for selected AI metadata

---

## Architecture Overview

The current HomeLab follows a layered architecture.

```text
                         MAKANI HOMEAUTO — HOMELAB

                              Windows 11 Host
                                     │
                                     ▼
                              Ubuntu Server VM
                                     │
                                     ▼
                                Docker Engine
                                     │
             ┌───────────────────────┼────────────────────────┐
             │                       │                        │
             ▼                       ▼                        ▼
        MANAGEMENT              SURVEILLANCE              AUTOMATION
             │                       │                        │
       ┌─────┴─────┐             Frigate AI            Home Assistant
       │           │                 │                        │
   Portainer     Dozzle        ┌─────┴─────┐            ┌─────┴─────────┐
                               │           │            │               │
                            Cameras      go2rtc        HACS        Integrations
                               │                        │
                               │                  ┌─────┼──────────────┐
                               │                  │     │              │
                               │               Weather Alexa       Aircraft
                               │
                               ├──── MQTT ─────────────────────► HA
                               │     Standard Events
                               │
                               └──── REST API ─────────────────► HA
                                     Selected AI Metadata
```

---

## Physical Architecture

### Windows 11 Host

The HomeLab starts with a **Windows 11 physical host**.

The host provides the physical compute platform used for:

- Virtualization
- Development and administration
- Browser-based management
- Local testing
- Access to HomeAuto services

Most HomeAuto application services are intentionally kept outside Windows and hosted within the Ubuntu VM.

This creates a clean separation between the physical workstation and the HomeAuto application platform.

```text
Physical Hardware
       │
       ▼
Windows 11
       │
       ▼
Virtualization
       │
       ▼
Ubuntu Server VM
```

---

### Ubuntu Server VM

The Ubuntu Server VM provides the primary Linux application platform for the HomeLab.

Its responsibilities include:

- Docker Engine
- Docker Compose
- Persistent container storage
- Docker networking
- Application configuration
- Service lifecycle management
- Container monitoring

```text
Windows 11 Host
       │
       ▼
Ubuntu Server VM
       │
       ▼
Docker Engine
```

The VM provides a portable environment that can later be translated into the Production virtualization architecture.

---

## Container Architecture

Docker is the primary application runtime used by the HomeLab.

```text
Ubuntu Server
      │
      ▼
Docker Engine
      │
      ├── Portainer
      ├── Dozzle
      ├── Mosquitto MQTT
      ├── Frigate AI
      └── Home Assistant
```

Containerization allows services to be:

- Managed independently
- Restarted independently
- Upgraded independently
- Connected using defined networks
- Provided with persistent storage
- Troubleshot without modifying the underlying operating system

Docker Compose is used to define and reproduce service deployments.

---

### Docker Service Organization

The HomeLab separates infrastructure and smart-home services logically.

```text
Docker
 │
 ├── Infrastructure Services
 │      ├── Portainer
 │      └── Dozzle
 │
 └── Smart-Home Services
        ├── Mosquitto MQTT
        ├── Frigate AI
        └── Home Assistant
```

This separation helps keep platform-management services distinct from smart-home workloads.

---

## Container Management

### Portainer

Portainer provides graphical management and visibility into the Docker environment.

It is used for:

- Container management
- Image visibility
- Network visibility
- Stack inspection
- Service status
- Basic troubleshooting

```text
Administrator
     │
     ▼
 Portainer
     │
     ▼
Docker Engine
```

---

### Dozzle

Dozzle provides lightweight real-time visibility into container logs.

```text
Docker Containers
       │
       ▼
     Dozzle
       │
       ▼
Live Container Logs
```

It complements Portainer by providing rapid access to runtime logs during troubleshooting and validation.

---

## MQTT Messaging Architecture

Mosquitto provides the MQTT messaging layer.

```text
MQTT Publishers
       │
       ▼
Mosquitto Broker
       │
       ▼
MQTT Subscribers
```

Current MQTT consumers and publishers include:

- Frigate
- Home Assistant
- MQTT Explorer
- Future IoT services

The Lab currently uses:

| Service | Port |
|---|---:|
| MQTT | 1883 |
| MQTT WebSocket | 9001 |

MQTT authentication has been enabled and publish/subscribe communication has been tested.

---

## Surveillance Architecture

Frigate provides the AI-surveillance layer of HomeAuto.

```text
Camera
   │
   ▼
Frigate AI
   │
   ├── Video Processing
   ├── Object Detection
   ├── Person Detection
   ├── Recording
   ├── Snapshots
   ├── License Plate Recognition
   └── Event Metadata
```

Frigate currently performs functional AI testing using CPU-based processing.

Hardware acceleration will be introduced after the current detection features have been fully validated.

---

## Camera Streaming Architecture

Camera streams are consumed directly by Frigate.

```text
Camera
   │
   │ Video Stream
   ▼
Frigate
   │
   ├── Detection
   ├── Recording
   ├── Snapshots
   └── go2rtc
```

go2rtc provides an additional stream-handling layer used for responsive camera viewing.

The Home Assistant viewing path is:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
go2rtc
   │
   ▼
Home Assistant
   │
   ▼
Advanced Camera Card
   │
   ▼
HomeLab Security Dashboard
```

**Advanced Camera Card** was introduced to improve the camera-viewing experience and reduce perceived stream latency.

---

## AI Detection Architecture

Frigate is responsible for AI processing.

Home Assistant is primarily responsible for visualization, automation, notification, and orchestration.

```text
Camera
   │
   ▼
Frigate AI
   │
   ├── Person Detection
   ├── Object Detection
   ├── Face Recognition
   └── License Plate Recognition
```

Current feature status:

| Capability | Status |
|---|---|
| Person Detection | ✅ Tested |
| Object Detection | ✅ Tested |
| License Plate Recognition | ✅ Tested |
| Face Recognition | 🟡 Under Validation |
| Coral TPU | ⏳ Planned |
| GPU Acceleration | ⏳ Planned |

---

## Frigate to Home Assistant Communication

Frigate and Home Assistant use more than one communication mechanism.

The HomeLab distinguishes between:

1. **MQTT event-driven communication**
2. **Direct HTTP REST access for selected AI metadata**

```text
                           Frigate AI
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
                MQTT                    HTTP API
                  │                         │
                  ▼                         ▼
             Mosquitto                REST Bridge
                  │                         │
                  └────────────┬────────────┘
                               ▼
                        Home Assistant
```

This dual-path architecture prevents every Frigate integration from depending on a single communication mechanism.

---

### MQTT Event Path

MQTT remains the event-driven communication path for standard Frigate events.

```text
Camera
   │
   ▼
Frigate
   │
   │ Detection Event
   ▼
Mosquitto
   │
   ▼
Home Assistant
   │
   ▼
Automation
   │
   ▼
Notification
```

This architecture has been successfully used for detection workflows such as person-detection automations.

---

### REST API Path for AI Metadata

During License Plate Recognition testing, the HomeLab encountered an important integration issue.

Frigate successfully recognized and stored the test license plate:

```text
TS07JF8179
```

with recognition confidence approximately:

```text
0.98 – 0.99
```

However, the corresponding MQTT LPR metadata was not consistently available during testing.

The recognition itself remained present inside Frigate and was successfully retrieved through the Frigate HTTP API.

This resulted in an architectural decision to use the **Frigate HTTP API as an alternative source for selected AI metadata**, particularly LPR information.

---

### Verified LPR Data Path

```text
USB Camera
     │
     ▼
Frigate 0.17.2
     │
     ▼
LPR Processing
     │
     ├── Plate
     │     TS07JF8179
     │
     └── Confidence
           ~0.98–0.99
     │
     ▼
Frigate Event Database
     │
     ▼
Frigate HTTP API
     │
     ▼
Home Assistant REST Bridge
```

The REST path provides an alternative source for selected AI metadata when MQTT does not provide the required update reliably.

---

## Frigate API Validation

Two API paths were particularly relevant during LPR testing.

### Recognized License Plates

The recognized-license-plates endpoint was queried using:

```text
/api/recognized_license_plates
```

The Lab successfully observed the recognized test plate:

```text
TS07JF8179
```

---

### Event Metadata

Detailed Frigate event data was inspected using:

```text
/api/events?camera=usb_camera&limit=10
```

The returned event data exposed fields including:

```text
recognized_license_plate
recognized_license_plate_score
```

This demonstrated that the LPR pipeline itself was functioning even when the desired MQTT publication was not observed.

---

## Home Assistant REST Bridge

The architecture therefore introduces a Home Assistant REST bridge for selected Frigate AI metadata.

```text
Frigate HTTP API
       │
       │ HTTP GET
       ▼
Home Assistant
       │
       ▼
REST Sensor
       │
       ├── Plate
       ├── Confidence
       ├── Camera
       └── Event ID
       │
       ▼
Home Assistant Automation
       │
       ├── Dashboard
       ├── Notification
       ├── Snapshot
       └── Alexa Announcement
```

The intended Home Assistant entity model is:

```text
sensor.last_license_plate

State
-----
TS07JF8179

Attributes
----------
confidence
camera
event_id
```

The exact REST sensor configuration, polling logic, templates, and verification procedure will be documented under:

**Implementation → License Plate Recognition**

---

## Why Both MQTT and REST Are Retained

The REST bridge does **not** replace MQTT across HomeAuto.

Instead, each communication method has a specific role.

```text
Frigate
   │
   ├── MQTT
   │     │
   │     └── Event-driven communication
   │
   └── REST API
         │
         └── Direct retrieval of selected AI metadata
```

### MQTT is appropriate for

- Detection events
- State changes
- Automation triggers
- Asynchronous messaging

### REST is useful for

- Querying stored Frigate data
- Retrieving selected AI metadata
- LPR event information
- Polling data that may not have arrived through MQTT

The REST path should therefore be considered a **deliberate Lab workaround and alternative integration path**, rather than a complete replacement for MQTT.

---

## Home Assistant Architecture

Home Assistant provides the primary automation and visualization layer.

```text
Home Assistant
      │
      ├── HACS
      ├── HomeLab Security Dashboard
      ├── Frigate Integration
      ├── MQTT Integration
      ├── Advanced Camera Card
      ├── REST / AI Metadata Integration
      ├── Weather Tracking
      ├── Aircraft Monitoring
      ├── Alexa Integration
      └── CAFE
```

Home Assistant is deliberately separated from Frigate's AI-processing responsibilities.

```text
Frigate
   │
   │ AI Processing
   ▼
Detection / Recognition
   │
   ▼
MQTT / REST
   │
   ▼
Home Assistant
   │
   ├── Visualization
   ├── Automation
   ├── Notification
   └── Voice Integration
```

---

## HomeLab Security Dashboard

A Home Assistant dashboard provides the operational interface for the smart-home environment.

The dashboard brings together:

- Camera streams
- Frigate entities
- Detection information
- Automations
- Notifications
- Weather information
- Aircraft monitoring
- Smart-home integrations

Advanced Camera Card is used for the surveillance portion of the dashboard to provide a more responsive camera-viewing experience.

---

## External Integrations

### Aircraft Monitoring

Aircraft-monitoring functionality has been integrated with Home Assistant.

This provides aviation information within the HomeAuto dashboard and creates opportunities for future location-based automations.

---

### Weather Tracking

Weather information has been integrated into Home Assistant.

This provides environmental context for the dashboard and future automation workflows.

---

### Alexa Integration

Alexa provides voice-assistant connectivity.

The integration creates opportunities for:

- Voice control
- Smart-home interaction
- Spoken notifications
- Future AI-event announcements

One intended use of the Frigate REST/LPR bridge is to allow recognized vehicle events to participate in Home Assistant automations and potentially trigger Alexa announcements.

---

## Logical Architecture

The HomeLab can be represented as six logical layers.

```text
┌────────────────────────────────────────┐
│            USER EXPERIENCE             │
│ Home Assistant Dashboard / Portainer   │
└────────────────────┬───────────────────┘
                     │
┌────────────────────▼───────────────────┐
│        AUTOMATION & INTEGRATION        │
│ Home Assistant / HACS / Alexa          │
└────────────────────┬───────────────────┘
                     │
┌────────────────────▼───────────────────┐
│          COMMUNICATION LAYER           │
│ Mosquitto MQTT / Frigate REST API      │
└────────────────────┬───────────────────┘
                     │
┌────────────────────▼───────────────────┐
│          AI SURVEILLANCE LAYER         │
│ Frigate / go2rtc / Cameras             │
└────────────────────┬───────────────────┘
                     │
┌────────────────────▼───────────────────┐
│          CONTAINER PLATFORM            │
│ Docker / Portainer / Dozzle            │
└────────────────────┬───────────────────┘
                     │
┌────────────────────▼───────────────────┐
│          COMPUTE / OS LAYER            │
│ Windows 11 / Ubuntu Server VM          │
└────────────────────────────────────────┘
```

---

## Service Communication

The HomeLab uses different communication mechanisms according to the requirements of each service.

| Source | Destination | Method | Purpose |
|---|---|---|---|
| Camera | Frigate | Video Stream | Camera ingestion |
| Frigate | Mosquitto | MQTT | Standard detection events |
| Mosquitto | Home Assistant | MQTT | Event-driven automations |
| Frigate API | Home Assistant | HTTP REST | Selected AI/LPR metadata |
| Frigate / go2rtc | Home Assistant | Streaming | Responsive camera viewing |
| Home Assistant | Alexa | Integration | Voice interaction and announcements |
| Aircraft Service | Home Assistant | Integration | Aircraft monitoring |
| Weather Service | Home Assistant | Integration | Weather tracking |
| Docker | Portainer | Docker API | Container management |
| Docker | Dozzle | Docker Socket | Container log monitoring |

---

## Architectural Principles

### Modular

Major services remain independently deployable and manageable.

### Observable

Container state, logs, application status, and events should be visible without complex troubleshooting.

### Reproducible

Docker Compose and documented configuration are preferred over undocumented manual deployment.

### Testable

Every major implementation should include verification before being considered complete.

### Loosely Coupled

Home Assistant should consume services through defined interfaces such as MQTT, HTTP APIs, and integrations rather than becoming responsible for the underlying AI processing.

### Resilient Integration

Where one integration path proves unreliable for a particular use case, another supported interface can be evaluated without redesigning the entire platform.

---

## Current Architecture State

```text
Windows 11
    │
    ▼
Ubuntu Server VM
    │
    ▼
Docker Engine
    │
    ├── Portainer
    │
    ├── Dozzle
    │
    ├── Mosquitto MQTT
    │
    ├── Frigate AI
    │      │
    │      ├── Camera
    │      ├── go2rtc
    │      ├── Object Detection
    │      ├── Person Detection
    │      ├── LPR
    │      └── REST API
    │
    └── Home Assistant
           │
           ├── HACS
           ├── Frigate Integration
           ├── MQTT Integration
           ├── Advanced Camera Card
           ├── Security Dashboard
           ├── REST AI Metadata
           ├── Weather
           ├── Aircraft Monitoring
           ├── Alexa
           └── CAFE
```

---

## Current vs Future Architecture

### Implemented / Tested

- Ubuntu Server VM
- Docker Engine
- Docker Compose
- Portainer
- Dozzle
- Mosquitto MQTT
- MQTT authentication
- MQTT publish/subscribe
- Frigate AI
- Camera integration
- go2rtc
- Object detection
- Person detection
- Recording and snapshots
- License Plate Recognition
- Frigate HTTP API validation
- Home Assistant
- HACS
- Frigate integration
- MQTT integration
- Advanced Camera Card
- HomeLab Security Dashboard
- Weather tracking
- Aircraft monitoring
- Alexa integration
- CAFE

### Under Validation

- Face recognition
- REST-based LPR sensor and downstream automation
- Aircraft-monitoring refinements
- Additional AI automation workflows

### Planned

- Coral TPU acceleration
- GPU acceleration
- Expanded monitoring and observability
- Additional cameras
- Additional IoT integrations
- Zigbee2MQTT
- Matter
- Production migration

---

## Architecture Evolution

The HomeLab intentionally validates functionality before performance optimization.

```text
Functional Validation
        │
        ├── Cameras
        ├── MQTT
        ├── Frigate
        ├── Object Detection
        ├── LPR
        ├── Home Assistant
        └── Integrations
        │
        ▼
Integration Validation
        │
        ├── MQTT Events
        ├── REST APIs
        ├── Automations
        └── Dashboards
        │
        ▼
Performance Optimization
        │
        ├── Coral TPU
        ├── GPU Acceleration
        └── Stream Optimization
        │
        ▼
Production Architecture
```

This approach allows the Production design to be based on technologies and integration patterns that have already been validated within the HomeLab.