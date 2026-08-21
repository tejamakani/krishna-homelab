---
title: Frigate AI Implementation
sidebar_label: Frigate AI
description: Frigate AI deployment, camera ingestion, go2rtc, recordings, snapshots, detection, MQTT, HTTP API, LPR, face recognition, troubleshooting, and validation for the Makani HomeAuto HomeLab.
---

# Frigate AI Implementation

**Frigate** provides the AI-assisted video-surveillance layer for the Makani HomeAuto HomeLab.

It is used to ingest camera feeds, process video events, perform object detection, store recordings and snapshots, publish event information, and expose AI metadata to Home Assistant.

The current HomeLab implementation uses:

```text
Frigate 0.17.2
```

during the documented AI-validation phase.

The overall architecture is:

```text
Camera
   │
   ▼
Frigate
   │
   ├── go2rtc
   ├── Live View
   ├── Recording
   ├── Snapshots
   ├── Object Detection
   ├── Face Recognition
   ├── License Plate Recognition
   │
   ├── MQTT
   └── HTTP API
```

Frigate is currently being used primarily for **functional AI validation** before introducing dedicated detection acceleration.

---

# 1. Purpose

Frigate was introduced to provide:

- Camera ingestion
- Live video viewing
- go2rtc stream handling
- Recording
- Snapshot generation
- Object tracking
- Person detection
- AI metadata generation
- Face recognition testing
- License Plate Recognition
- MQTT integration
- HTTP API access
- Home Assistant integration

The HomeLab uses Frigate to validate surveillance workflows before they are promoted into the Production platform.

---

# 2. Current Deployment Model

Frigate is deployed through:

```text
/home/teju/docker/stacks/frigate.yml
```

The current service and container are named:

```text
frigate
```

The application runs on the Ubuntu HomeLab VM inside Docker.

The main communication model is:

```text
Camera
   │
   ▼
Frigate Container
   │
   ├── Web UI
   ├── go2rtc
   ├── Recording
   ├── Detection
   ├── MQTT
   └── API
```

---

# 3. Verify Frigate Stack

Enter the HomeAuto Docker project:

```bash
cd ~/docker
```

List stacks:

```bash
./dockerctl stacks
```

Expected:

```text
frigate
```

Verify the Compose service:

```bash
./dockerctl services frigate
```

Expected:

```text
frigate
```

---

# 4. Inspect Frigate Compose File

Display the active definition:

```bash
cat ~/docker/stacks/frigate.yml
```

Before starting Frigate, validate the Compose configuration:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/frigate.yml \
  config
```

A successful command prints the normalized Compose configuration.

This should always be performed after significant changes to the stack definition.

---

# 5. Frigate Container Architecture

The application stack can be viewed as:

```text
Ubuntu Server
      │
      ▼
Docker Engine
      │
      ▼
Frigate Container
      │
      ├── Frigate Core
      ├── FFmpeg
      ├── go2rtc
      ├── Detection Pipeline
      ├── Event Database
      ├── Recording Storage
      └── API
```

Frigate therefore combines several surveillance functions into a single coordinated platform.

---

# 6. Start Frigate

Preferred method:

```bash
cd ~/docker
./dockerctl up frigate frigate
```

To start the complete Frigate stack:

```bash
./dockerctl up frigate
```

Direct Docker Compose equivalent:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/frigate.yml \
  up -d
```

---

# 7. Verify Frigate Container

Run:

```bash
docker ps --filter "name=frigate"
```

Readable output:

```bash
docker ps \
  --filter "name=frigate" \
  --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

Frigate should show:

```text
Running
```

---

# 8. Verify Through dockerctl

Run:

```bash
./dockerctl status frigate frigate
```

For the whole stack:

```bash
./dockerctl status frigate
```

---

# 9. Verify Frigate Logs

Run:

```bash
docker logs frigate --tail 50
```

or:

```bash
./dockerctl logs frigate frigate
```

Follow live logs:

```bash
docker logs -f frigate
```

Exit using:

```text
Ctrl+C
```

Frigate logs are one of the primary troubleshooting tools during camera and AI testing.

---

# 10. Frigate Web Interface

The HomeLab exposes the Frigate interface through the Ubuntu VM.

Typical access pattern:

```text
http://<UBUNTU_VM_IP>:5000
```

The exact published port should always be confirmed from:

```bash
docker ps --filter "name=frigate" \
  --format "table {{.Names}}\t{{.Ports}}"
```

---

# 11. Verify Port 5000

On Ubuntu:

```bash
sudo ss -lnt | grep 5000
```

From Windows:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 5000
```

Expected:

```text
TcpTestSucceeded : True
```

This validates:

```text
Windows
   │
   ▼
Ubuntu VM
   │
   ▼
Docker Port Mapping
   │
   ▼
Frigate
```

---

# 12. Frigate Configuration File

Frigate application behavior is controlled through its configuration file.

The exact path should be verified from the active Compose file and bind mount.

The configuration typically includes sections for:

```text
mqtt
go2rtc
cameras
detectors
record
snapshots
objects
face recognition
LPR
```

Before changing configuration, create a backup.

Example:

```bash
cp <frigate-config-file> \
   <frigate-config-file>.backup-$(date +%Y%m%d-%H%M%S)
```

---

# 13. Validate Configuration Before Restart

After editing Frigate configuration, avoid restarting the entire HomeLab.

First validate the YAML formatting wherever practical.

Then restart only Frigate:

```bash
./dockerctl restart frigate frigate
```

Immediately inspect:

```bash
./dockerctl logs frigate frigate
```

The operational rule is:

> Restart only Frigate when only Frigate changed.

---

# 14. Camera Ingestion Architecture

Frigate receives a camera/video stream and uses it for different workloads.

```text
Camera
   │
   ▼
Video Stream
   │
   ▼
Frigate
   │
   ├── Live View
   ├── Detect Stream
   ├── Recording
   └── Snapshot
```

The exact stream roles depend on the camera and Frigate configuration.

---

# 15. go2rtc

Frigate uses **go2rtc** to improve video restreaming and camera delivery.

The logical architecture is:

```text
Camera
   │
   ▼
go2rtc
   │
   ├── Frigate Processing
   └── Live View
```

This helps avoid unnecessary duplicate connections to the physical camera.

It also provides the foundation for lower-latency camera viewing in Home Assistant.

---

# 16. Camera Test Strategy

The HomeLab intentionally validates camera functionality before advanced AI features.

The sequence is:

```text
Camera Connectivity
       │
       ▼
Video Ingestion
       │
       ▼
Live View
       │
       ▼
go2rtc
       │
       ▼
Recording
       │
       ▼
Snapshots
       │
       ▼
Object Detection
       │
       ▼
Advanced AI
```

This avoids incorrectly diagnosing a camera or stream issue as an AI issue.

---

# 17. Verify Camera State

The most useful checks are:

```bash
docker logs frigate --tail 100
```

and the Frigate UI.

Check for:

- Camera connection
- FFmpeg startup
- Stream errors
- Decode failures
- Reconnection loops

If a camera is unavailable, resolve the video path before troubleshooting AI detection.

---

# 18. Recording

Frigate recording was enabled as part of the surveillance validation.

The storage path is mounted outside the disposable container filesystem.

The logical flow is:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
Recording
   │
   ▼
Persistent Media Storage
```

Storage capacity should be monitored because recordings can grow significantly faster than normal HomeLab data.

---

# 19. Snapshot Generation

Snapshots provide static images associated with events and detections.

The flow is:

```text
Detection
   │
   ▼
Frigate Event
   │
   ▼
Snapshot
```

Snapshots are useful for:

- Home Assistant notifications
- Dashboard display
- Event review
- Face-recognition validation
- LPR validation

---

# 20. Object Detection

Frigate object detection was introduced after the camera stream itself was stable.

The current HomeLab has tested:

```text
Person Detection
Object Detection
```

The high-level processing path is:

```text
Camera
   │
   ▼
Decode
   │
   ▼
Detection Frame
   │
   ▼
Object Detector
   │
   ▼
Tracking
   │
   ▼
Event
```

---

# 21. Current Detection Model

The current phase focuses on functionality rather than maximum throughput.

```text
Current Phase
     │
     ▼
CPU-Based Functional Validation
     │
     ├── Object Detection
     ├── LPR
     └── Face Recognition
```

Dedicated acceleration is planned later.

---

# 22. Current AI Validation Status

| Capability | Status |
|---|---|
| Camera Streaming | ✅ Tested |
| go2rtc | ✅ Tested |
| Recording | ✅ Tested |
| Snapshots | ✅ Tested |
| Person Detection | ✅ Tested |
| Object Detection | ✅ Tested |
| License Plate Recognition | ✅ Tested |
| Face Recognition | 🟡 Under Validation |
| Coral TPU | ⏳ Planned |
| GPU Acceleration | ⏳ Planned |

---

# 23. MQTT Integration

Frigate publishes standard events through the Mosquitto MQTT broker.

The architecture is:

```text
Frigate
   │
   ▼
smart_home_net
   │
   ▼
Mosquitto
   │
   ▼
Home Assistant
```

MQTT remains the normal event-driven communication path.

---

# 24. Verify MQTT Network

Check:

```bash
docker network inspect smart_home_net
```

Frigate and MQTT should be attached to the shared network where defined by the active stack configuration.

---

# 25. Standard MQTT Event Flow

The normal integration flow is:

```text
Camera
   │
   ▼
Frigate Detection
   │
   ▼
MQTT Event
   │
   ▼
Mosquitto
   │
   ▼
Home Assistant
   │
   ▼
Automation
```

This is appropriate for ordinary event-driven communication.

---

# 26. Frigate HTTP API

Frigate also exposes an HTTP API.

The API became particularly important during advanced AI testing.

Test basic API availability:

```bash
curl -s http://127.0.0.1:5000/api/events | jq
```

If the service is reachable and events exist, JSON should be returned.

---

# 27. Inspect Recent Events

Run:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?limit=10" \
  | jq
```

For a specific camera:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" \
  | jq
```

This provides direct access to the Frigate event database.

---

# 28. API as an Independent Validation Tool

The Frigate API is useful because it allows the internal event state to be checked independently from:

```text
MQTT
Home Assistant
Dashboard
Automations
```

The troubleshooting model becomes:

```text
Did Frigate create the event?
        │
        ▼
Check API
        │
        ├── Yes
        │      ↓
        │   Integration issue
        │
        └── No
               ↓
           Frigate issue
```

This separation proved important during LPR testing.

---

# 29. License Plate Recognition

Frigate LPR was tested successfully in the HomeLab.

A plate was recognized as:

```text
TS07JF8179
```

The recognized plate was stored inside Frigate event metadata.

Recognition confidence was approximately:

```text
0.98 – 0.99
```

---

# 30. Verify LPR Through the API

Retrieve recent events:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" \
  | jq
```

Relevant metadata included:

```text
recognized_license_plate
recognized_license_plate_score
```

The event data confirmed successful recognition even when the expected MQTT update was not observed.

---

# 31. LPR Validation Result

The successful internal state was effectively:

```text
recognized_license_plate = TS07JF8179
```

with:

```text
recognized_license_plate_score ≈ 0.98 – 0.99
```

This proved that:

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
Event Database
```

was functioning correctly.

---

# 32. LPR MQTT Observation

During the Frigate 0.17.2 validation, the MQTT publication path for LPR metadata was inconsistent.

The expected LPR metadata was not consistently observed in the MQTT event path even though the internal Frigate event database contained the correct recognized plate.

This distinction is important:

```text
LPR Recognition
       ✅

Frigate Event Database
       ✅

Frigate HTTP API
       ✅

Expected MQTT LPR Update
       ⚠ Inconsistent during Lab testing
```

The broker itself remained operational.

---

# 33. Dual Integration Architecture

Rather than blocking Home Assistant integration on the LPR MQTT behavior, the HomeLab adopted two integration paths.

## Standard Event Path

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

## Selected AI Metadata Path

```text
Frigate
   │
   ▼
Event Database
   │
   ▼
HTTP API
   │
   ▼
Home Assistant REST Bridge
```

This allows the platform to use the most reliable source for each type of event.

---

# 34. Why the API Path Is Important

The API path provides:

- Direct access to event metadata
- Independent verification
- Reliable access to LPR data observed in the Lab
- A path to Home Assistant REST sensors
- A fallback when MQTT payload behavior differs from expectations

The HomeLab therefore avoids forcing all AI metadata through a single integration mechanism.

---

# 35. Home Assistant REST Bridge

The planned/under-validation flow is:

```text
Frigate
   │
   ▼
Latest Event
   │
   ▼
HTTP API
   │
   ▼
Home Assistant REST Sensor
   │
   ▼
sensor.last_license_plate
   │
   ▼
Automation
   │
   ├── Dashboard
   ├── Notification
   └── Alexa
```

The detailed Home Assistant implementation is documented separately.

---

# 36. Face Recognition

Face-recognition testing has also been introduced.

The API was checked using:

```bash
curl -s http://127.0.0.1:5000/api/faces | jq
```

At one validation point, the result was:

```json
{}
```

This indicated that no face entries were currently exposed by the API at that stage.

---

# 37. Inspect Face Storage

The Frigate container was checked for stored face files.

Run:

```bash
docker exec frigate find /media/frigate/clips/faces \
  -maxdepth 3 \
  -type f \
  -printf '%p\n' | head -50
```

At the tested stage, no face files were returned.

The directory itself was verified using:

```bash
docker exec frigate find /media/frigate/clips/faces \
  -maxdepth 2 \
  -type d \
  -printf '%p\n'
```

Observed directory:

```text
/media/frigate/clips/faces
```

This demonstrated that the directory existed even though no recognized face files had yet been stored.

---

# 38. Face Recognition Status

The current status is therefore:

```text
Face Recognition
      │
      ▼
Infrastructure Present
      │
      ▼
API Checked
      │
      ▼
No Stored Faces Observed
      │
      ▼
Further Validation Required
```

This feature should remain marked:

```text
Under Validation
```

until recognition events and stored face data are confirmed end-to-end.

---

# 39. Restart Frigate Only

After changing Frigate configuration:

```bash
cd ~/docker
./dockerctl restart frigate frigate
```

Verify:

```bash
./dockerctl status frigate frigate
```

Then inspect:

```bash
./dockerctl logs frigate frigate
```

Other services remain intentionally untouched.

---

# 40. Why Isolated Restart Matters

Frigate configuration changes are frequent during Lab testing.

Examples include:

- Camera configuration
- Detect roles
- Recording settings
- Object filters
- LPR configuration
- Face-recognition settings
- MQTT settings
- go2rtc settings

A full HomeLab restart would unnecessarily disrupt:

```text
MQTT
Home Assistant
Portainer
Dozzle
WebSSH
```

Therefore:

```bash
./dockerctl restart frigate frigate
```

is the preferred operation.

---

# 41. Stop Frigate Only

Run:

```bash
./dockerctl stop frigate frigate
```

Verify:

```bash
./dockerctl status frigate frigate
```

MQTT and Home Assistant may continue running but will temporarily stop receiving Frigate-generated events.

---

# 42. Start Frigate Again

Run:

```bash
./dockerctl up frigate frigate
```

Then:

```bash
./dockerctl status frigate frigate
```

Logs:

```bash
docker logs frigate --tail 50
```

---

# 43. Direct Docker Fallback

If the controller cannot be used:

```bash
docker restart frigate
```

Verify:

```bash
docker ps --filter "name=frigate"
```

Logs:

```bash
docker logs frigate --tail 100
```

---

# 44. Frigate Resource Usage

Run:

```bash
docker stats frigate
```

This is important during CPU-based detection because Frigate can become one of the largest resource consumers in the HomeLab.

Monitor:

```text
CPU %
Memory
Network I/O
Block I/O
```

---

# 45. Ubuntu Resource Verification

CPU:

```bash
top
```

or:

```bash
ps aux --sort=-%cpu | head -15
```

Memory:

```bash
free -h
```

Storage:

```bash
df -h
```

Frigate media storage:

```bash
du -sh /media/frigate 2>/dev/null
```

or the corresponding host-side media path.

---

# 46. Troubleshooting — Frigate Container Not Starting

Check:

```bash
docker ps -a --filter "name=frigate"
```

Logs:

```bash
docker logs frigate --tail 100
```

Validate Compose:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/frigate.yml \
  config
```

Common areas include:

```text
YAML errors
Invalid Frigate configuration
Camera URLs
Volume mounts
Device access
Network configuration
Port conflicts
```

---

# 47. Troubleshooting — Camera Offline

Check Frigate logs:

```bash
docker logs frigate --tail 100
```

Investigate:

```text
Camera reachable?
Stream URL correct?
Credentials valid?
RTSP reachable?
USB device present?
FFmpeg starting?
go2rtc able to connect?
```

Do not troubleshoot AI detection until the camera stream itself is confirmed.

---

# 48. Troubleshooting — UI Unreachable

Check:

```bash
docker ps --filter "name=frigate"
```

Then:

```bash
sudo ss -lnt | grep 5000
```

From Windows:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 5000
```

Investigate:

```text
Container
   ↓
Published Port
   ↓
Ubuntu
   ↓
VM Network
   ↓
Browser
```

---

# 49. Troubleshooting — No Events

First verify the camera.

Then check logs:

```bash
docker logs frigate --tail 100
```

Check API:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?limit=10" \
  | jq
```

If the API contains no events, investigate Frigate detection before MQTT or Home Assistant.

---

# 50. Troubleshooting — Event Exists but HA Does Not See It

If Frigate's API contains the event:

```text
Frigate Event Database
      ✅
```

then continue downstream.

Check MQTT:

```bash
docker logs mqtt --tail 50
```

Check Home Assistant:

```bash
docker logs homeassistant --tail 50
```

The path becomes:

```text
Frigate
   ✅
   │
   ▼
MQTT
   ?
   │
   ▼
Home Assistant
   ?
```

This prevents unnecessary Frigate reconfiguration when the event is already valid internally.

---

# 51. Troubleshooting — LPR Recognized but MQTT Update Missing

Check the event directly:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" \
  | jq
```

If:

```text
recognized_license_plate
```

is populated, then LPR itself succeeded.

Use the API as the reliable source for the Lab workflow while continuing to evaluate the MQTT publication behavior.

---

# 52. Troubleshooting — Face API Empty

Run:

```bash
curl -s http://127.0.0.1:5000/api/faces | jq
```

If:

```json
{}
```

then inspect the face storage:

```bash
docker exec frigate find /media/frigate/clips/faces \
  -maxdepth 3 \
  -type f \
  -printf '%p\n'
```

If no files exist, continue investigating the recognition/training workflow rather than treating the API response alone as a transport issue.

---

# 53. Hardware Acceleration Roadmap

The current HomeLab deliberately validates functionality first.

The roadmap is:

```text
CPU-Based Validation
       │
       ├── Camera
       ├── Object Detection
       ├── LPR
       └── Face Recognition
       │
       ▼
Hardware Acceleration
       │
       ├── Coral TPU
       ├── GPU
       └── Intel Quick Sync evaluation
       │
       ▼
Performance Optimization
```

This avoids mixing AI-integration problems with acceleration problems.

---

# 54. Coral TPU

Coral TPU acceleration is planned for a later HomeLab phase.

Its primary role would be to offload object-detection inference from the CPU.

The expected architecture is:

```text
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

Coral should be introduced only after the existing functional workflow is stable.

---

# 55. GPU Acceleration

GPU acceleration will also be evaluated after current AI features are validated.

Potential use cases include:

- Video decode acceleration
- Stream processing
- AI workloads where supported

The existing CPU-based configuration provides the baseline against which acceleration improvements can be compared.

---

# 56. Intel Quick Sync

Intel Quick Sync may also be evaluated where the host/virtualization path supports it.

The objective would primarily be efficient video decode/encode rather than replacing a dedicated detection accelerator.

---

# 57. Frigate and Home Assistant

Frigate integrates into Home Assistant through multiple mechanisms:

```text
Frigate
   │
   ├── MQTT
   │      └── Event-driven communication
   │
   ├── HTTP API
   │      └── Selected AI metadata
   │
   └── Camera Streams
          └── Dashboard / Advanced Camera Card
```

This multi-path architecture gives HomeAuto flexibility when one integration path does not expose all required metadata.

---

# 58. Advanced Camera Card Path

The Home Assistant camera path is:

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
```

This was introduced to improve the camera-viewing experience and reduce perceived latency.

---

# 59. Frigate Operational Workflow

The preferred engineering workflow after a configuration change is:

```text
Edit Frigate Configuration
        │
        ▼
Validate
        │
        ▼
Restart Frigate Only
        │
        ▼
Check Logs
        │
        ▼
Check Camera
        │
        ▼
Check API
        │
        ▼
Check MQTT / HA if required
```

Commands:

```bash
./dockerctl restart frigate frigate
```

```bash
./dockerctl logs frigate frigate
```

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?limit=10" \
  | jq
```

---

# 60. Verification Checklist

| Verification | Command | Expected Result |
|---|---|---|
| Stack exists | `./dockerctl stacks` | `frigate` |
| Service exists | `./dockerctl services frigate` | `frigate` |
| Compose validation | `docker compose ... config` | No errors |
| Container state | `docker ps --filter "name=frigate"` | Running |
| dockerctl state | `./dockerctl status frigate frigate` | Running |
| UI port | `ss -lnt \| grep 5000` | Listener |
| Windows connectivity | `Test-NetConnection ... -Port 5000` | True |
| Web UI | Browser | Accessible |
| Camera stream | Frigate UI | Visible |
| go2rtc | Frigate | Working |
| Recording | Frigate | Verified |
| Snapshots | Frigate | Verified |
| Object detection | Frigate | Verified |
| Person detection | Frigate | Verified |
| Events API | `/api/events` | JSON returned |
| LPR | API event metadata | Plate recognized |
| LPR score | API event metadata | ~0.98–0.99 |
| MQTT | Frigate → Mosquitto | Standard events available |
| Face API | `/api/faces` | Checked |
| Face storage | `/media/frigate/clips/faces` | Directory exists |
| Isolated restart | `./dockerctl restart frigate frigate` | Frigate restarted only |
| Resource monitoring | `docker stats frigate` | Stats visible |

---

# 61. Final Validated State

The current Frigate HomeLab architecture is:

```text
Camera
   │
   ▼
Frigate 0.17.2
   │
   ├── go2rtc
   ├── Live View
   ├── Recording
   ├── Snapshots
   ├── Object Detection
   ├── Person Detection
   ├── LPR
   ├── Face Recognition
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
      Event Metadata
          │
          ▼
     HA REST Bridge
```

Frigate is considered functionally validated when:

- The container starts successfully
- Camera streams are available
- go2rtc functions correctly
- Recording works
- Snapshots work
- Person/object detection works
- Frigate events are available through the API
- LPR successfully recognizes and stores plate metadata
- MQTT works for standard event paths
- The API is available for selected AI metadata
- Frigate can be restarted independently
- AI functionality can be evaluated before hardware acceleration is introduced

---

# 62. Engineering Outcome

The Frigate implementation established an important design principle for HomeAuto:

> **Validate the event at its source before troubleshooting downstream integrations.**

For example:

```text
Detection Problem?
      │
      ▼
Check Frigate API
      │
      ├── Event Missing
      │       ↓
      │   Investigate Frigate
      │
      └── Event Present
              ↓
        Investigate MQTT / HA
```

This approach significantly improves troubleshooting efficiency.

A second principle was established during LPR testing:

> **Use the most reliable integration interface for the metadata being consumed.**

Therefore HomeAuto supports both MQTT and direct API-based AI integration rather than forcing every event through one path.

---

# 63. Next Implementation Stage

With the core Frigate platform documented, the next section should focus specifically on:

```text
Frigate
   │
   ▼
Camera Integration
```

The **Camera Integration** runbook should document:

- Test camera strategy
- USB camera use
- Stream discovery
- Frigate camera configuration
- go2rtc
- Live-view validation
- Stream latency
- recording roles
- camera troubleshooting
- Home Assistant camera exposure
- Advanced Camera Card integration

After that, we can document:

```text
Object Detection
Face Recognition
License Plate Recognition
```

as dedicated AI-feature runbooks.