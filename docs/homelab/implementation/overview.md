---
title: HomeLab Implementation Overview
sidebar_label: Overview
description: Implementation roadmap, validation sequence, and current build status of the Makani HomeAuto HomeLab environment.
---

# HomeLab Implementation Overview

The **Makani HomeAuto HomeLab** was built incrementally, with each infrastructure and application component introduced, tested, validated, and integrated before progressing to the next stage.

The HomeLab serves as the primary **development, experimentation, troubleshooting, and validation environment** for technologies that may later be promoted into the Production environment.

Rather than deploying the complete platform at once, the implementation follows a layered engineering approach:

```text
Build
  │
  ▼
Configure
  │
  ▼
Validate
  │
  ▼
Integrate
  │
  ▼
Troubleshoot
  │
  ▼
Document
  │
  ▼
Promote
```

This allows individual services to be tested independently before becoming part of the larger HomeAuto ecosystem.

---

## Implementation Architecture

The current HomeLab implementation is organized around the following service stack:

```text
Windows 11 Host
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
      │
      └── Home Assistant
      │
      ▼
Smart-Home & AI Services
      │
      ├── Camera Integration
      ├── go2rtc Streaming
      ├── Recording
      ├── Snapshots
      ├── Object Detection
      ├── Face Recognition
      ├── License Plate Recognition
      ├── MQTT Messaging
      ├── REST/API Integration
      ├── Home Assistant Dashboard
      ├── Automations
      ├── Notifications
      ├── Weather Tracking
      ├── Aircraft Monitoring
      └── Alexa Integration
```

The architecture intentionally separates the infrastructure, application, messaging, AI, and automation layers.

---

# Implementation Method

Each HomeLab component is documented using a common engineering workflow.

```text
Purpose
   │
   ▼
Implementation
   │
   ▼
Configuration
   │
   ▼
Verification
   │
   ▼
Integration
   │
   ▼
Issues / Troubleshooting
   │
   ▼
Final State
```

Verification is included directly within each implementation topic rather than maintained as a separate documentation section.

This keeps validation procedures close to the technology being implemented.

---

# Stage 1 — Windows Host

The Windows host provides the physical compute platform used for the HomeLab.

The host is responsible for providing the resources required by the Ubuntu virtual machine and associated application services.

## Role

The Windows host provides:

- CPU resources
- Memory
- Storage
- Network connectivity
- Virtualization capability
- Access to locally connected test hardware

The Ubuntu Server VM operates on top of this host and provides the Linux application environment used by the HomeAuto stack.

## Status

**Implemented**

---

# Stage 2 — Ubuntu Server VM

An Ubuntu Server virtual machine was deployed as the primary Linux application platform.

Current operating system:

```text
Ubuntu Server 24.04 LTS
```

The VM provides the runtime environment for Docker and the containerized HomeAuto services.

## Current Lab VM Profile

```text
vCPU      : 4
Memory    : 8 GB
Storage   : 80 GB
```

The VM hosts the container infrastructure used by the HomeLab.

## Primary Responsibilities

The Ubuntu VM provides:

- Docker runtime
- Container networking
- Persistent storage
- Application hosting
- Service communication
- Camera processing
- AI workloads
- Home Assistant services

## Status

**Implemented and operational**

---

# Stage 3 — Docker Platform

Docker provides the application runtime for the HomeLab.

Instead of installing every application directly onto Ubuntu, the primary HomeAuto services are deployed as containers.

This improves:

- Application isolation
- Repeatability
- Portability
- Upgrade management
- Troubleshooting
- Service recovery
- Configuration management

The HomeLab uses:

```text
Docker Engine
+
Docker Compose
```

to manage the application stack.

---

## Docker Stack Organization

The HomeLab evolved from a single Compose configuration toward a more modular stack structure.

The service architecture separates infrastructure and smart-home services into logical Compose layers.

Example:

```text
~/docker/
│
├── stacks/
│   ├── infrastructure.yml
│   └── mqtt.yml
│
├── mosquitto/
│   ├── config/
│   ├── data/
│   └── log/
│
└── dockerctl
```

External Docker networks are used to allow services from different Compose stacks to communicate when required.

Current networks include:

```text
infra_net
smart_home_net
```

## Status

**Implemented and operational**

---

# Stage 4 — Portainer

Portainer was introduced as the graphical container-management interface.

It provides visibility into:

- Containers
- Images
- Networks
- Volumes
- Container state
- Container configuration
- Logs
- Runtime information

Portainer is currently deployed using the LTS container image.

```text
portainer/portainer-ce:lts
```

The management interface is exposed using:

```text
HTTPS : 9443
```

Portainer simplifies day-to-day container administration while command-line Docker tools remain available for detailed troubleshooting.

## Status

**Implemented and operational**

---

# Stage 5 — Dozzle

Dozzle was introduced to provide lightweight real-time Docker log visibility.

The service allows container logs to be inspected from a browser without repeatedly running:

```bash
docker logs
```

Dozzle is particularly useful during:

- Frigate troubleshooting
- MQTT troubleshooting
- Container startup failures
- Configuration validation
- Integration testing

The current service uses:

```text
amir20/dozzle
```

and is exposed through:

```text
TCP 8080
```

## Status

**Implemented and operational**

---

# Stage 6 — Mosquitto MQTT

Mosquitto provides the MQTT messaging layer used by the HomeLab.

MQTT allows services to exchange lightweight event-driven messages.

The broker currently uses:

```text
eclipse-mosquitto:2
```

and operates on the external Docker network:

```text
smart_home_net
```

---

## MQTT Interfaces

The broker exposes:

```text
MQTT TCP
Port 1883
```

and:

```text
MQTT WebSocket
Port 9001
```

Authentication is enabled using a Mosquitto password file.

Persistent directories are maintained for:

```text
/mosquitto/config
/mosquitto/data
/mosquitto/log
```

---

## MQTT Integration Role

MQTT provides standard event-driven communication between components such as:

```text
Frigate
   │
   ▼
Mosquitto
   │
   ▼
Home Assistant
```

MQTT remains an important communication mechanism within the HomeAuto architecture.

## Status

**Implemented and operational**

---

# Stage 7 — Frigate AI

Frigate provides the AI-assisted video surveillance layer.

The HomeLab uses Frigate to validate surveillance capabilities before production deployment.

Current Frigate version used during the documented testing:

```text
Frigate 0.17.2
```

Frigate provides:

- Camera ingestion
- go2rtc streaming
- Recording
- Snapshots
- Object tracking
- Person detection
- AI metadata
- Face recognition
- License Plate Recognition
- MQTT integration
- HTTP API access

---

## Frigate Data Flow

The basic surveillance pipeline is:

```text
Camera
   │
   ▼
Video Stream
   │
   ▼
Frigate
   │
   ├── Recording
   ├── Snapshot
   ├── Detection
   ├── Tracking
   ├── Face Recognition
   └── License Plate Recognition
```

Frigate then exposes detection information through several integration mechanisms.

```text
Frigate
   │
   ├── MQTT
   │
   ├── HTTP API
   │
   └── Home Assistant Integration
```

## Status

**Implemented and under continued AI validation**

---

# Stage 8 — Camera Integration

Camera integration was performed before enabling the complete AI-processing workflow.

The purpose of this stage was to validate the video pipeline independently from AI detection.

Validation included:

- Camera connectivity
- Video stream availability
- Frigate ingestion
- go2rtc streaming
- Live view
- Recording
- Snapshot generation
- Stream stability

This approach makes it easier to distinguish camera or streaming problems from AI-processing problems.

## Status

**Tested**

---

# Stage 9 — Object Detection

After the camera pipeline was validated, Frigate object detection was enabled.

The HomeLab is being used to test AI-assisted surveillance capabilities including:

- Person detection
- General object detection
- Event tracking
- Detection metadata
- Recording association
- Snapshot association

The goal is to validate the complete detection pipeline before introducing hardware acceleration.

---

## Current AI Validation Status

| Capability | Status |
|---|---|
| Camera Streaming | ✅ Tested |
| Recording | ✅ Tested |
| Snapshots | ✅ Tested |
| Person Detection | ✅ Tested |
| Object Detection | ✅ Tested |
| License Plate Recognition | ✅ Tested |
| Face Recognition | 🟡 Under Validation |
| Coral TPU | ⏳ Planned |
| GPU Acceleration | ⏳ Planned |

The current HomeLab testing therefore focuses primarily on functionality and integration rather than maximum AI-processing performance.

---

# Stage 10 — License Plate Recognition

License Plate Recognition was tested using Frigate's AI capabilities.

During testing, Frigate successfully recognized the plate:

```text
TS07JF8179
```

with recognition confidence approximately:

```text
0.98 – 0.99
```

The recognition result was confirmed inside Frigate's internal event information and API.

---

## LPR Integration Finding

During testing with Frigate 0.17.2, an important integration behavior was identified.

The LPR result was reliably available from:

```text
Frigate Event Database
        │
        ▼
Frigate HTTP API
```

However, the expected LPR metadata was not consistently observed through the MQTT event publication path during the Lab test.

Instead of blocking Home Assistant integration on MQTT, the architecture was adapted.

---

## Dual Integration Architecture

The HomeLab now supports two Frigate-to-Home-Assistant communication paths.

### Standard Event Path

```text
Frigate
   │
   ▼
MQTT
   │
   ▼
Mosquitto
   │
   ▼
Home Assistant
```

This remains the preferred path for standard event-driven communication.

### AI Metadata / LPR Path

For selected AI metadata such as LPR, the Frigate API can provide the source data directly.

```text
Camera
   │
   ▼
Frigate
   │
   ▼
LPR Engine
   │
   ▼
Frigate Event Database
   │
   ▼
Frigate HTTP API
   │
   ▼
Home Assistant REST Bridge
   │
   ▼
Automation / Dashboard / Alexa
```

This design avoids making Home Assistant dependent on an inconsistent MQTT publication path for the affected LPR metadata.

---

# Stage 11 — Face Recognition

Face-recognition testing has also been introduced into the HomeLab.

Frigate's face-processing directory and API behavior are being validated as part of the AI-surveillance implementation.

Current state:

```text
Face Recognition
      │
      ▼
Under Validation
```

This feature remains part of the Lab validation process before being considered production-ready.

## Status

**Under validation**

---

# Stage 12 — Home Assistant

Home Assistant provides the smart-home automation and visualization layer of the HomeAuto platform.

It acts as the primary user-facing integration point for:

- Smart-home devices
- AI surveillance
- MQTT events
- Dashboards
- Notifications
- Automations
- External services

Home Assistant has been successfully installed and integrated into the HomeLab.

---

## Home Assistant Components Implemented

The current Home Assistant environment includes:

- Home Assistant
- HACS
- HomeAuto dashboards
- Frigate integration
- MQTT integration
- Advanced Camera Card
- Weather tracking
- Aircraft monitoring
- Alexa integration
- CAFE
- Automation framework
- Notification framework

---

# HACS

The **Home Assistant Community Store (HACS)** has been installed.

HACS provides access to community-developed:

- Integrations
- Dashboard cards
- Frontend components
- Themes
- Home Assistant extensions

This allows the HomeLab dashboard and integration environment to be extended beyond the standard Home Assistant installation.

## Status

**Implemented**

---

# Advanced Camera Card

The **Advanced Camera Card** has been installed within Home Assistant.

The card is used to provide improved camera visualization and a better low-latency viewing experience within the Home Assistant dashboard.

This replaced the earlier experimental camera-card approach.

The objective is to reduce perceived stream latency and provide a more practical surveillance interface directly inside Home Assistant.

The resulting user workflow becomes:

```text
Camera
   │
   ▼
Frigate / go2rtc
   │
   ▼
Home Assistant
   │
   ▼
Advanced Camera Card
   │
   ▼
Low-Latency Camera View
```

## Status

**Implemented**

---

# Home Assistant Dashboard

A dedicated dashboard has been created to expose HomeAuto services through a centralized interface.

The dashboard provides visibility into areas such as:

- Camera feeds
- Frigate events
- Detection information
- Smart-home services
- Environmental information
- External integrations

The dashboard will continue to evolve as additional services are integrated.

## Status

**Implemented and evolving**

---

# Weather Tracking

Weather information has been integrated into Home Assistant.

This allows environmental information to become part of the HomeAuto dashboard and future automation workflows.

Potential automation use cases include:

```text
Weather Condition
       │
       ▼
Home Assistant
       │
       ├── Dashboard
       ├── Notifications
       └── Automations
```

## Status

**Implemented**

---

# Aircraft Monitoring

Aircraft monitoring has been integrated into the Home Assistant environment.

This extends the HomeLab beyond traditional smart-home services and demonstrates the ability to integrate external real-time information into the HomeAuto dashboard.

The capability is currently considered part of the experimental HomeLab integration layer.

## Status

**Implemented**

---

# Alexa Integration

Alexa integration has been completed within Home Assistant.

Alexa can provide an additional interaction and notification channel for HomeAuto services.

The integration creates the potential for workflows such as:

```text
Frigate Detection
       │
       ▼
Home Assistant
       │
       ▼
Automation
       │
       ▼
Alexa Announcement
```

This becomes particularly useful for future surveillance events such as:

- Person detected
- Known vehicle detected
- License plate recognized
- Security event generated

## Status

**Implemented**

---

# End-to-End Integration

One of the most important HomeLab milestones is validating communication across the complete platform.

The standard event-driven path is:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
MQTT
   │
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
Notification / Dashboard / Alexa
```

For selected AI metadata where MQTT does not provide the required information reliably, the alternative path is:

```text
Camera
   │
   ▼
Frigate AI
   │
   ▼
Event Database
   │
   ▼
Frigate HTTP API
   │
   ▼
Home Assistant REST Integration
   │
   ▼
Automation
   │
   ├── Dashboard
   ├── Notification
   └── Alexa
```

This provides the HomeLab with both an event-driven integration model and an API-driven integration model.

---

# Current Implementation Status

| Component | Status |
|---|---|
| Windows Host | ✅ Complete |
| Ubuntu Server VM | ✅ Complete |
| Docker Engine | ✅ Complete |
| Docker Compose | ✅ Complete |
| Docker Networks | ✅ Complete |
| Portainer | ✅ Complete |
| Dozzle | ✅ Complete |
| Mosquitto MQTT | ✅ Complete |
| Frigate AI | ✅ Implemented |
| Camera Integration | ✅ Tested |
| go2rtc Streaming | ✅ Tested |
| Recording | ✅ Tested |
| Snapshots | ✅ Tested |
| Person Detection | ✅ Tested |
| Object Detection | ✅ Tested |
| License Plate Recognition | ✅ Tested |
| Face Recognition | 🟡 Under Validation |
| Home Assistant | ✅ Complete |
| HACS | ✅ Complete |
| HomeAuto Dashboard | ✅ Complete |
| Advanced Camera Card | ✅ Complete |
| MQTT Integration | ✅ Complete |
| Frigate → HA MQTT Communication | ✅ Verified |
| Frigate HTTP API | ✅ Verified |
| REST-based LPR Integration | 🟡 Under Validation |
| Weather Tracking | ✅ Complete |
| Aircraft Monitoring | ✅ Implemented |
| Alexa Integration | ✅ Complete |
| CAFE | ✅ Installed |
| Coral TPU | ⏳ Planned |
| GPU Acceleration | ⏳ Planned |

---

# Hardware Acceleration Roadmap

The current Lab phase prioritizes functionality and integration.

Hardware acceleration will be introduced after the AI services have been validated using the existing environment.

Planned acceleration testing includes:

```text
Current
   │
   ▼
CPU-Based Functional Validation
   │
   ├── Object Detection
   ├── Face Recognition
   └── LPR
   │
   ▼
Hardware Acceleration
   │
   ├── Coral TPU
   ├── GPU Acceleration
   └── Intel Quick Sync Evaluation
   │
   ▼
Performance Validation
```

This prevents hardware-acceleration complexity from masking application or integration problems during initial testing.

---

# Implementation Documentation

The detailed implementation is divided into individual engineering topics.

```text
HomeLab
│
├── 01 · Purpose
├── 02 · Architecture
│
├── 03 · Implementation
│   │
│   ├── Overview
│   ├── Windows Host
│   ├── Ubuntu VM
│   ├── Docker
│   ├── Portainer
│   ├── Dozzle
│   ├── Mosquitto MQTT
│   ├── Frigate AI
│   ├── Camera Integration
│   ├── Object Detection
│   ├── Face Recognition
│   ├── License Plate Recognition
│   └── Home Assistant
│
└── 04 · Challenges Faced
```

Each implementation topic should document:

1. Purpose
2. Architecture / role
3. Prerequisites
4. Installation
5. Configuration
6. Integration
7. Verification
8. Issues encountered
9. Final state

This makes the HomeAuto documentation useful not only as a record of the project but also as a reproducible engineering implementation guide.

---

# Next Phase

The HomeLab will continue to prioritize **functional validation before performance optimization**.

The next major activities are:

- Complete face-recognition validation
- Complete Home Assistant REST-based LPR integration
- Build LPR-triggered Home Assistant automations
- Integrate LPR information into the dashboard
- Evaluate Alexa announcements for AI events
- Refine aircraft monitoring
- Expand Home Assistant automations
- Introduce Coral TPU acceleration
- Evaluate GPU acceleration
- Evaluate Intel Quick Sync where applicable
- Improve infrastructure monitoring
- Improve service observability
- Prepare validated configurations for Production

---

# HomeLab Engineering Principle

The HomeLab follows a simple engineering rule:

> **Build it. Validate it. Break it. Fix it. Document it. Then promote it.**

The HomeLab is therefore not simply a collection of applications.

It is the **engineering validation environment for the Makani HomeAuto Production platform**.