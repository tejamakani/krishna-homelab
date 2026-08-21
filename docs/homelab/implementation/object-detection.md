---
title: Object Detection
sidebar_label: Object Detection
description: Frigate object detection, tracking, event lifecycle, API and MQTT validation, Home Assistant integration, troubleshooting, and acceleration roadmap for the Makani HomeAuto HomeLab.
---

# Object Detection

Object Detection provides the core AI event-processing capability of the **Makani HomeAuto HomeLab**.

After establishing a stable camera pipeline, Frigate analyzes selected video frames, identifies configured objects, tracks them through the scene, and generates events that can be consumed by other HomeAuto services.

The current validation architecture is:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
Detection Frames
   │
   ▼
Object Detector
   │
   ▼
Object Tracking
   │
   ▼
Event
   │
   ├── Snapshot
   ├── Recording
   ├── MQTT
   └── HTTP API
```

The HomeLab currently prioritizes **functional validation** before introducing dedicated AI acceleration.

---

# 1. Purpose

The Object Detection stage validates:

- Frigate detection processing
- Camera detection roles
- Person detection
- Object tracking
- Event creation
- Detection confidence
- Event snapshots
- Recording association
- Frigate HTTP API
- MQTT event publication
- Home Assistant consumption
- Detection troubleshooting
- Resource utilization
- Readiness for advanced AI services

Object Detection also provides the foundation for:

```text
Person Detection
      │
      ├── Face Recognition
      │
      └── Person Automations

Vehicle Detection
      │
      └── License Plate Recognition
```

---

# 2. Detection Architecture

The detection pipeline is:

```text
Camera
   │
   ▼
Video Stream
   │
   ▼
FFmpeg
   │
   ▼
Detection Frames
   │
   ▼
Frigate Detector
   │
   ▼
Object Tracking
   │
   ▼
Frigate Event
```

Once an event exists:

```text
Frigate Event
      │
      ├── Event Database
      ├── Snapshot
      ├── Recording
      ├── MQTT
      └── HTTP API
```

This separation is important because successful object detection can be validated independently from Home Assistant.

---

# 3. Prerequisites

Before troubleshooting Object Detection, verify the camera layer first.

The required sequence is:

```text
Camera Reachable
      │
      ▼
Frigate Ingestion
      │
      ▼
Live View
      │
      ▼
Stable Stream
      │
      ▼
Object Detection
```

Verify Frigate:

```bash
cd ~/docker
./dockerctl status frigate frigate
```

Check logs:

```bash
docker logs frigate --tail 100
```

The camera should already be visible in the Frigate interface.

---

# 4. Current HomeLab Detection Model

The current phase uses the existing compute resources to establish an AI-functional baseline.

```text
Current HomeLab
      │
      ▼
CPU-Based Functional Validation
      │
      ├── Person Detection
      ├── Object Detection
      ├── LPR
      └── Face Recognition
```

This allows the complete application workflow to be validated before hardware acceleration is introduced.

---

# 5. Why Functional Validation Comes First

Adding hardware acceleration too early introduces additional variables:

```text
Device Passthrough
Driver Support
Detector Configuration
Virtualization
Permissions
Frigate Configuration
```

Instead, HomeAuto follows:

```text
Functional Detection
       │
       ▼
Stable AI Workflow
       │
       ▼
Performance Baseline
       │
       ▼
Hardware Acceleration
```

This makes troubleshooting significantly easier.

---

# 6. Camera Detection Role

A Frigate camera must provide a stream that can be used for detection.

A simplified configuration pattern is:

```yaml
cameras:

  usb_camera:

    ffmpeg:

      inputs:

        - path: <camera-source>

          roles:
            - detect
            - record
```

The active Frigate configuration remains the authoritative source.

---

# 7. Detection Stream Design

For the current Lab camera, a single source may perform multiple roles.

Conceptually:

```text
Camera Stream
      │
      ├── detect
      │
      └── record
```

For Production IP cameras, separate streams are preferred where supported:

```text
IP Camera
   │
   ├── Main Stream
   │      └── Recording
   │
   └── Sub Stream
          └── Detection
```

This can substantially reduce video-processing overhead.

---

# 8. Detection Configuration

Frigate detection behavior is controlled through the camera and detector configuration.

Typical configuration areas include:

```text
detect
objects
filters
zones
motion
detectors
```

The exact configuration should always be taken from the active Frigate configuration rather than duplicated blindly.

---

# 9. Tracked Objects

Frigate can be configured to track selected object classes.

A typical pattern is:

```yaml
objects:

  track:
    - person
    - car
```

Only objects relevant to the HomeAuto use case should be enabled.

Tracking unnecessary object classes increases processing and event noise.

---

# 10. Person Detection

Person detection was one of the first AI capabilities validated in the HomeLab.

The flow is:

```text
Camera
   │
   ▼
Person Enters Frame
   │
   ▼
Detection Frame
   │
   ▼
person
   │
   ▼
Tracked Object
   │
   ▼
Frigate Event
```

Person detection subsequently provides the starting point for face-recognition workflows.

---

# 11. Vehicle Detection

Vehicle detection provides the corresponding foundation for LPR.

```text
Camera
   │
   ▼
Vehicle
   │
   ▼
Frigate Detection
   │
   ▼
Tracked Vehicle
   │
   ▼
License Plate Processing
```

Therefore, LPR should not be treated as an independent camera function.

It operates on top of a working Frigate detection pipeline.

---

# 12. Detection Confidence

Object detections include confidence information used by Frigate to determine whether a candidate object should be tracked.

Conceptually:

```text
Video Frame
     │
     ▼
Candidate Object
     │
     ▼
Confidence Score
     │
     ▼
Filter / Threshold
     │
     ▼
Tracked Object
```

Thresholds should be tuned carefully.

Very low thresholds can produce false positives, while excessively high thresholds may cause valid objects to be missed.

---

# 13. Motion and Object Detection

Motion detection and object detection are related but different.

```text
Motion
   │
   ▼
Interesting Region
   │
   ▼
Object Detection
   │
   ▼
person / car / etc.
```

Motion helps Frigate identify where detector processing should occur.

Motion alone does not mean an object has been recognized.

---

# 14. Object Tracking

Once an object is detected, Frigate tracks it as it moves through the scene.

```text
Detection
   │
   ▼
Tracked Object
   │
   ├── Position
   ├── Confidence
   ├── Camera
   ├── Label
   └── Event Metadata
```

Tracking prevents every frame from becoming an independent event.

---

# 15. Frigate Event Lifecycle

A useful conceptual event lifecycle is:

```text
Object Appears
      │
      ▼
Object Detected
      │
      ▼
Tracking Begins
      │
      ▼
Metadata Updated
      │
      ▼
Object Leaves / Event Ends
      │
      ▼
Final Event Stored
```

Understanding this lifecycle becomes important when troubleshooting MQTT metadata updates.

---

# 16. Event Database

Frigate stores detection events internally.

This database provides an independent source of truth for AI validation.

The troubleshooting principle is:

> Validate the Frigate event before troubleshooting an integration consuming that event.

The path is:

```text
Camera
   │
   ▼
Detection
   │
   ▼
Frigate Event Database
```

---

# 17. Verify Events Through the API

Retrieve recent events:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?limit=10" \
  | jq
```

For the HomeLab test camera:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" \
  | jq
```

This should return recent event data where events are available.

---

# 18. Inspect Basic Event Information

For a more compact view:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" |
jq '.[] | {
  id,
  camera,
  label,
  sub_label,
  start_time,
  end_time
}'
```

This helps verify:

```text
Event ID
Camera
Object Label
Sub Label
Start Time
End Time
```

---

# 19. Inspect the Latest Event

Run:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=1" \
  | jq '.[0]'
```

This is useful when testing an object directly in front of the Lab camera.

---

# 20. Event Validation Boundary

If the event appears in:

```bash
/api/events
```

then the following layers have already succeeded:

```text
Camera
   ✅
   │
   ▼
Video Processing
   ✅
   │
   ▼
Detection
   ✅
   │
   ▼
Tracking
   ✅
   │
   ▼
Event Database
   ✅
```

Any missing Home Assistant automation should then be investigated downstream.

---

# 21. Snapshots

Frigate can associate snapshots with detected objects.

The flow is:

```text
Tracked Object
      │
      ▼
Frigate Event
      │
      ▼
Snapshot
```

Snapshots are useful for:

- Event review
- Home Assistant notifications
- LPR verification
- Face-recognition validation
- Dashboard presentation

---

# 22. Recording Association

Object events can also be associated with recorded video.

```text
Camera
   │
   ├── Detection
   │      │
   │      ▼
   │    Event
   │
   └── Recording
          │
          ▼
      Event Playback
```

This allows the user to review what happened before, during, and after a detection.

---

# 23. MQTT Event Path

The standard event-driven HomeAuto path is:

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

MQTT remains appropriate for normal detection and automation events.

---

# 24. Verify MQTT Broker

Check:

```bash
./dockerctl status mqtt mqtt
```

Logs:

```bash
docker logs mqtt --tail 50
```

The MQTT broker should remain independent from Frigate.

Restarting Frigate should not require restarting Mosquitto.

---

# 25. Monitor Frigate MQTT Events

Where authenticated MQTT access is configured, subscribe to Frigate topics using the appropriate credentials.

Example:

```bash
mosquitto_sub \
  -h <MQTT_BROKER> \
  -p 1883 \
  -u <MQTT_USER> \
  -P '<MQTT_PASSWORD>' \
  -t 'frigate/#' \
  -v
```

Do not store real MQTT passwords in public documentation.

---

# 26. Important MQTT Topics

During AI testing, relevant Frigate topics may include:

```text
frigate/events
frigate/tracked_object_update
```

These topics represent different parts of the Frigate event/update lifecycle.

Their exact payload behavior should be validated against the running Frigate version.

---

# 27. MQTT vs API

The two interfaces serve different purposes.

| Interface | Primary Use |
|---|---|
| MQTT | Event-driven communication |
| HTTP API | Direct event/database queries |
| Frigate UI | Visual validation |
| Logs | Runtime troubleshooting |

The HomeLab deliberately uses more than one validation path.

---

# 28. Multi-Layer Event Verification

When testing a detection:

```text
STEP 1
Frigate UI
   │
   ▼
Was object detected?

STEP 2
Frigate API
   │
   ▼
Was event stored?

STEP 3
MQTT
   │
   ▼
Was event published?

STEP 4
Home Assistant
   │
   ▼
Was event consumed?

STEP 5
Automation
   │
   ▼
Did expected action occur?
```

This is significantly more effective than troubleshooting all components simultaneously.

---

# 29. Home Assistant Integration

Home Assistant consumes Frigate-generated information rather than performing the AI detection itself.

```text
Camera
   │
   ▼
Frigate
   │
   ▼
Object Detection
   │
   ▼
Event
   │
   ├── MQTT
   └── API
          │
          ▼
     Home Assistant
```

This maintains clear separation between AI processing and automation.

---

# 30. Home Assistant MQTT Sensors

The HomeLab has used Frigate MQTT event information to create Home Assistant sensors.

The general model is:

```text
frigate/events
      │
      ▼
Home Assistant MQTT Sensor
      │
      ▼
Entity State
      │
      ▼
Automation / Dashboard
```

This allows selected detection metadata to become standard Home Assistant entities.

---

# 31. Example Person Metadata Flow

Conceptually:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
person
   │
   ▼
frigate/events
   │
   ▼
Home Assistant
   │
   ▼
Sensor / Automation
```

Sub-label metadata can later be used when a detected person is associated with face recognition.

---

# 32. Advanced AI Services

Object detection acts as the first AI stage.

```text
Object Detection
      │
      ├── person
      │      │
      │      ▼
      │ Face Recognition
      │
      └── vehicle
             │
             ▼
             LPR
```

Therefore, problems with the base detection pipeline can affect advanced AI services.

---

# 33. LPR Integration Observation

During LPR testing, Frigate successfully recognized and stored:

```text
TS07JF8179
```

with confidence approximately:

```text
0.98 – 0.99
```

The Frigate API confirmed that the event database contained the recognition metadata.

This proved that:

```text
Detection
   │
   ▼
Tracking
   │
   ▼
Advanced AI
   │
   ▼
Event Database
```

was functioning even when the expected MQTT LPR update was not consistently observed.

---

# 34. API Fallback for Selected AI Metadata

For selected AI metadata such as the tested LPR workflow, the architecture supports:

```text
Frigate Event Database
        │
        ▼
Frigate HTTP API
        │
        ▼
Home Assistant REST Bridge
```

This does **not** replace MQTT globally.

Instead:

```text
Standard Events
     │
     └── MQTT

Selected AI Metadata
     │
     └── HTTP API where required
```

---

# 35. Detection Logs

Inspect recent Frigate logs:

```bash
docker logs frigate --tail 100
```

Search relevant messages:

```bash
docker logs frigate --tail 300 |
grep -Ei "detect|object|camera|ffmpeg|error|warning"
```

For live troubleshooting:

```bash
./dockerctl logs frigate frigate
```

Exit using:

```text
Ctrl+C
```

---

# 36. Dozzle Detection Troubleshooting

Dozzle can be used to monitor Frigate during live tests.

Open:

```text
http://<UBUNTU_VM_IP>:8080
```

Select:

```text
frigate
```

Then perform a detection test in front of the camera.

This provides immediate visibility into runtime warnings and errors.

---

# 37. Restart After Detection Configuration Changes

If only Frigate configuration changed:

```bash
cd ~/docker
./dockerctl restart frigate frigate
```

Verify:

```bash
./dockerctl status frigate frigate
```

Then:

```bash
./dockerctl logs frigate frigate
```

Do not restart MQTT or Home Assistant unless their configuration also changed.

---

# 38. Verify Frigate Resource Usage

Run:

```bash
docker stats frigate
```

Monitor:

```text
CPU %
Memory
Network I/O
Block I/O
```

Object detection is one of the primary compute workloads in the HomeLab.

---

# 39. Host CPU Monitoring

Run:

```bash
top
```

or:

```bash
ps aux --sort=-%cpu | head -15
```

This provides a useful baseline before introducing hardware acceleration.

---

# 40. Memory Monitoring

Run:

```bash
free -h
```

Container memory:

```bash
docker stats frigate
```

The Ubuntu VM currently provides the shared resource pool for Frigate and the other HomeAuto containers.

---

# 41. Detection Performance Factors

Detection performance depends on multiple variables:

```text
Camera Resolution
Frame Rate
Detect FPS
Number of Cameras
Number of Tracked Objects
CPU Performance
Video Decode Method
Detector Type
```

Higher camera resolution does not automatically produce a better overall system if it overwhelms available compute resources.

---

# 42. Detect Stream Optimization

For Production IP cameras:

```text
High Resolution Main Stream
           │
           └── Recording

Lower Resolution Sub Stream
           │
           └── Detection
```

This provides a better balance between recording quality and detection efficiency.

---

# 43. Troubleshooting — No Object Detected

Start with the camera.

Verify:

```text
Camera visible?
      │
      ▼
Stream stable?
      │
      ▼
Detect role enabled?
      │
      ▼
Object tracked?
```

Check logs:

```bash
docker logs frigate --tail 200
```

Then check events:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" \
  | jq
```

---

# 44. Troubleshooting — Camera Works but No Events

If:

```text
Live Camera
    ✅
```

but:

```text
Events
    ❌
```

investigate:

- Detect role
- Detection enabled
- Tracked objects
- Thresholds
- Filters
- Motion
- Camera position
- Subject size
- Frigate logs

Do not troubleshoot MQTT yet because no event exists to publish.

---

# 45. Troubleshooting — Event Exists but MQTT Does Not

If:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?limit=10" \
  | jq
```

shows the expected event:

```text
Frigate Detection
       ✅

Event Database
       ✅
```

then investigate:

```text
Frigate MQTT configuration
Network connectivity
Mosquitto
Topic subscription
Authentication
Payload behavior
```

---

# 46. Troubleshooting — MQTT Works but HA Does Not

If the expected MQTT message is visible:

```text
Frigate
   ✅
   │
   ▼
Mosquitto
   ✅
   │
   ▼
Home Assistant
   ❌
```

investigate Home Assistant:

```bash
docker logs homeassistant --tail 100
```

Possible areas include:

- MQTT integration
- Sensor configuration
- Topic
- Template
- Entity state
- Automation trigger

---

# 47. Troubleshooting — False Positives

If incorrect objects are detected frequently, investigate:

```text
Detection Threshold
Object Filters
Minimum Size
Maximum Size
Camera Angle
Lighting
Motion
Zones
```

Changes should be made incrementally.

After each change:

```bash
./dockerctl restart frigate frigate
```

Then repeat the same controlled test.

---

# 48. Troubleshooting — Missed Objects

If real objects are being missed, investigate:

- Object size in frame
- Lighting
- Motion blur
- Detection resolution
- Threshold
- Camera angle
- Occlusion
- Frame rate

The goal is not simply to lower thresholds until every possible candidate is accepted.

---

# 49. Troubleshooting — High CPU

Check:

```bash
docker stats frigate
```

and:

```bash
top
```

Potential contributors include:

```text
High-resolution detection stream
High detect FPS
Multiple cameras
CPU video decoding
Multiple tracked classes
Advanced AI workloads
```

This should be documented before hardware acceleration so that later improvements can be measured.

---

# 50. Detection Baseline

Before adding Coral or GPU acceleration, record a functional baseline.

Recommended metrics include:

| Metric | Baseline |
|---|---|
| Number of Cameras | Lab dependent |
| Detect Resolution | Current configuration |
| Detect FPS | Current configuration |
| Frigate CPU | Record during test |
| Frigate Memory | Record during test |
| Detection Reliability | Validate |
| Person Detection | Validate |
| LPR | Validate |
| Face Recognition | Validate |

This creates an engineering comparison point.

---

# 51. Coral TPU Roadmap

Once functional AI validation is complete, Coral TPU should be evaluated for object-detection inference.

The future path is:

```text
Camera
   │
   ▼
Video Decode
   │
   ▼
Detection Frames
   │
   ▼
Coral TPU
   │
   ▼
Object Detection
```

This should reduce CPU load associated with detector inference.

---

# 52. GPU Acceleration Roadmap

GPU acceleration should also be revisited after the current CPU-based tests are complete.

The HomeLab hardware evaluation includes the possibility of using the available **GT 1030**, subject to Frigate support and the final deployment architecture.

Potential use cases include:

```text
Video Decode
Stream Processing
Supported AI workloads
```

GPU acceleration should be measured against the CPU baseline rather than enabled without comparison.

---

# 53. Intel Quick Sync Roadmap

Intel Quick Sync should also be evaluated if the final host CPU and virtualization architecture expose a supported Intel iGPU.

Its likely role is:

```text
Camera Stream
      │
      ▼
Hardware Video Decode
      │
      ▼
Frigate Frames
```

This is distinct from Coral TPU inference acceleration.

A possible optimized architecture is therefore:

```text
IP Camera
   │
   ▼
Intel Quick Sync / GPU
   │
   ▼
Decoded Frames
   │
   ▼
Coral TPU
   │
   ▼
Object Detection
```

---

# 54. Production Detection Architecture

The eventual Production design can evolve toward:

```text
PoE IP Cameras
       │
       ▼
Camera VLAN
       │
       ▼
Frigate
       │
       ├── Hardware Video Decode
       │
       ├── Coral TPU Detection
       │
       ├── Recording
       │
       ├── Face Recognition
       │
       └── LPR
       │
       ▼
Event Layer
       │
       ├── MQTT
       └── HTTP API
              │
              ▼
        Home Assistant
```

---

# 55. Detection Verification Workflow

Use this sequence for every major detection change:

```text
01
Verify Camera

02
Verify Frigate

03
Perform Controlled Detection

04
Check Frigate UI

05
Check Event API

06
Check Snapshot / Recording

07
Check MQTT

08
Check Home Assistant

09
Check Automation

10
Check CPU / Memory
```

This sequence isolates failures quickly.

---

# 56. Verification Commands

## Frigate state

```bash
./dockerctl status frigate frigate
```

## Logs

```bash
docker logs frigate --tail 100
```

## Events

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" \
  | jq
```

## Latest event

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=1" \
  | jq '.[0]'
```

## Resource usage

```bash
docker stats frigate
```

## MQTT

```bash
mosquitto_sub \
  -h <MQTT_BROKER> \
  -p 1883 \
  -u <MQTT_USER> \
  -P '<MQTT_PASSWORD>' \
  -t 'frigate/#' \
  -v
```

---

# 57. Object Detection Verification Checklist

| Verification | Method | Expected Result |
|---|---|---|
| Camera | Frigate UI | Stream visible |
| Frigate | `./dockerctl status frigate frigate` | Running |
| Detection | Controlled test | Object identified |
| Person detection | Frigate | Person tracked |
| Event database | `/api/events` | Event returned |
| Camera field | API | `usb_camera` |
| Object label | API | Correct label |
| Snapshot | Frigate | Available |
| Recording | Frigate | Associated video |
| MQTT broker | dockerctl | Running |
| MQTT events | Subscription | Detection messages |
| Home Assistant | HA | Event/entity visible |
| Resource usage | `docker stats frigate` | Monitored |
| Isolated restart | dockerctl | Frigate only restarted |

---

# 58. Current Validated State

The HomeLab detection architecture is:

```text
Camera
   │
   ▼
Frigate 0.17.2
   │
   ▼
Object Detection
   │
   ├── Person Detection
   ├── Object Tracking
   ├── Event Database
   ├── Snapshot
   ├── Recording
   │
   ├── MQTT
   │      │
   │      ▼
   │   Mosquitto
   │      │
   │      ▼
   │ Home Assistant
   │
   └── HTTP API
          │
          ▼
      AI Metadata
```

This forms the foundation for the more specialized AI services.

---

# 59. Engineering Outcome

Object Detection establishes the primary AI troubleshooting hierarchy for HomeAuto:

```text
Camera
   │
   ▼
Detection
   │
   ▼
Event Database
   │
   ▼
Integration
   │
   ▼
Automation
```

The key operational principle is:

> **Do not troubleshoot an integration until the source event has been validated.**

If the Frigate API contains the correct event, detection succeeded.

The troubleshooting boundary then moves downstream to MQTT, the API bridge, Home Assistant, or the automation itself.

---

# 60. Next Implementation Stage

The next runbook is:

```text
Camera
   │
   ▼
Person Detection
   │
   ▼
Face Recognition
```

The **Face Recognition** page will document:

- Frigate face-recognition architecture
- Person detection dependency
- Face library
- Training/enrollment workflow
- `/api/faces`
- `/media/frigate/clips/faces`
- `sub_label`
- MQTT → Home Assistant face sensor
- Home Assistant dashboard/automation use
- Current validation status
- Troubleshooting empty face results
- Verification procedure

After Face Recognition, we'll document the already proven **LPR workflow**, including the `TS07JF8179` test, the Frigate 0.17.2 MQTT issue, and the Home Assistant REST/API bridge.