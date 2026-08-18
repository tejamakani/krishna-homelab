---
title: HomeLab Purpose
sidebar_label: 01 · Purpose
description: Purpose, objectives, scope, and engineering goals of the Makani HomeAuto HomeLab environment.
---

# HomeLab Purpose
The **Makani HomeAuto HomeLab** is the development and validation environment used to design, test, troubleshoot, and verify technologies before they are promoted into the Production platform.

It provides a controlled engineering space for infrastructure, automation, AI surveillance, MQTT messaging, Home Assistant integrations, and future hardware acceleration.

## Current HomeLab Status

The HomeLab has progressed from basic infrastructure validation into an integrated smart-home and AI-surveillance test environment.

### Core Infrastructure

| Component | Status |
|---|---|
| Windows Host | ✅ Operational |
| Ubuntu Server VM | ✅ Implemented |
| Docker Engine | ✅ Implemented |
| Docker Compose | ✅ Implemented |
| Portainer | ✅ Implemented |
| Dozzle | ✅ Implemented |

### Messaging & Integration

| Component | Status |
|---|---|
| Mosquitto MQTT | ✅ Implemented |
| MQTT Authentication | ✅ Verified |
| MQTT Publish / Subscribe | ✅ Verified |
| MQTT Explorer | ✅ Tested |
| Frigate → MQTT | ✅ Verified |
| MQTT → Home Assistant | ✅ Verified |

### Frigate AI & Surveillance

| Component | Status |
|---|---|
| Frigate AI | ✅ Implemented |
| Camera Integration | ✅ Tested |
| go2rtc | ✅ Tested |
| Recording | ✅ Tested |
| Snapshots | ✅ Tested |
| Object Detection | ✅ Tested |
| Person Detection | ✅ Tested |
| License Plate Recognition | ✅ Tested |
| Face Recognition | 🟡 Under Validation |
| Coral TPU Acceleration | ⏳ Planned |
| GPU Acceleration | ⏳ Planned |

### Home Assistant

### Home Assistant

| Component | Status |
|---|---|
| Home Assistant | ✅ Implemented |
| HACS | ✅ Installed |
| HomeLab Security Dashboard | ✅ Created |
| Frigate Integration | ✅ Implemented |
| MQTT Integration | ✅ Implemented |
| Frigate Person Detection Automation | ✅ Verified |
| Home Assistant Notifications | ✅ Verified |
| FlightRadar24 / Aircraft Monitoring | ✅ Implemented |
| Nearby Aircraft Tracking | 🟡 Under Validation |
| Weather Tracking | ✅ Implemented |
| Alexa Integration | ✅ Implemented |
| CAFE | ✅ Installed |
| Advanced Camera Card | ✅ Installed & Configured |

---

## End-to-End Integration Validation

One of the major HomeLab milestones was validating communication across multiple independently deployed components.

The surveillance workflow has been successfully tested through the following path:

```text
Camera
   │
   ▼
Frigate AI
   │
   ├── Video Processing
   ├── Object Detection
   ├── Recording
   └── Snapshot
   │
   ▼
MQTT
   │
   ▼
Home Assistant
   │
   ▼
Automation
   │
   ▼
Notification