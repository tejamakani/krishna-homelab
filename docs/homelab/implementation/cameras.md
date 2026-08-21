---
title: Camera Integration
sidebar_label: Camera Integration
description: Camera onboarding, stream validation, go2rtc, Frigate ingestion, recording, snapshots, Home Assistant viewing, latency optimization, troubleshooting, and verification for the Makani HomeAuto HomeLab.
---

# Camera Integration

Camera integration provides the video-ingestion layer for the **Makani HomeAuto HomeLab**.

Before enabling advanced AI capabilities such as object detection, face recognition, or License Plate Recognition, the camera pipeline must first be validated independently.

The design principle is:

```text
Camera First
     │
     ▼
Stable Video Stream
     │
     ▼
Frigate Ingestion
     │
     ▼
go2rtc
     │
     ▼
Recording / Snapshots
     │
     ▼
AI Detection
```

This prevents camera, codec, or stream issues from being incorrectly diagnosed as AI-processing problems.

---

# 1. Purpose

The Camera Integration stage validates:

- Camera connectivity
- Video stream availability
- Frigate camera ingestion
- FFmpeg processing
- go2rtc restreaming
- Live camera viewing
- Recording
- Snapshot generation
- Home Assistant camera exposure
- Low-latency dashboard viewing
- Readiness for object detection
- Readiness for LPR
- Readiness for face recognition

The HomeLab camera environment is intentionally used as a functional validation platform before Production cameras are introduced.

---

# 2. Camera Integration Architecture

The camera workflow is:

```text
Camera Source
      │
      ▼
Video Stream
      │
      ▼
Frigate
      │
      ├── FFmpeg
      ├── go2rtc
      ├── Live View
      ├── Recording
      ├── Snapshots
      └── Detection Pipeline
```

The Home Assistant viewing path is:

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

---

# 3. HomeLab Camera Strategy

The Lab does not require the final Production CCTV infrastructure in order to validate Frigate.

A simpler camera source can first be used to verify:

```text
Video Ingestion
     │
     ▼
Frigate
     │
     ▼
AI Pipeline
```

This allows application development to proceed before:

- Production IP cameras
- NVR integration
- Remote-site cameras
- Dedicated PoE infrastructure
- Hardware AI acceleration

are introduced.

---

# 4. USB Camera Testing

A locally available camera can be used as a temporary Frigate source during Lab validation.

The test architecture is:

```text
USB Camera
     │
     ▼
Ubuntu / Device Access
     │
     ▼
Frigate Container
     │
     ▼
Camera Pipeline
```

This type of camera source is useful for validating:

- Person detection
- Object detection
- Face recognition
- LPR
- Snapshots
- Recording

without depending on a remote IP camera environment.

---

# 5. Verify USB Camera on Ubuntu

List video devices:

```bash
ls -l /dev/video*
```

If a camera is present, output may contain devices such as:

```text
/dev/video0
/dev/video1
```

The exact device numbering depends on the host and virtualization configuration.

---

# 6. Inspect Video Devices

Install `v4l-utils` if required:

```bash
sudo apt update
sudo apt install v4l-utils -y
```

List available camera devices:

```bash
v4l2-ctl --list-devices
```

Inspect a specific device:

```bash
v4l2-ctl \
  --device=/dev/video0 \
  --all
```

This can provide:

- Driver
- Device name
- Video format
- Resolution support
- Frame rate support

---

# 7. List Supported Camera Formats

Run:

```bash
v4l2-ctl \
  --device=/dev/video0 \
  --list-formats-ext
```

This is useful for identifying supported combinations such as:

```text
MJPEG
YUYV
Resolution
Frame rate
```

The actual format should be selected based on what the camera and Frigate/FFmpeg pipeline support reliably.

---

# 8. Virtualization Consideration

Because the HomeLab runs inside an Ubuntu virtual machine, physical camera access depends on whether the virtualization platform exposes the device to the Ubuntu guest.

The path becomes:

```text
Physical Camera
       │
       ▼
Windows Host
       │
       ▼
Virtualization Layer
       │
       ▼
Ubuntu VM
       │
       ▼
/dev/video*
```

If the camera is visible in Windows but not inside Ubuntu, the problem exists before Frigate.

---

# 9. Camera Troubleshooting Boundary

Use this diagnostic sequence:

```text
Camera visible on physical host?
          │
          ▼
Camera passed to VM?
          │
          ▼
Ubuntu sees /dev/video*?
          │
          ▼
FFmpeg can access device?
          │
          ▼
Frigate can ingest stream?
```

Do not change Frigate detection settings until the underlying camera path is working.

---

# 10. Verify Frigate Container Device Access

Inspect the Frigate container:

```bash
docker inspect frigate | jq
```

Or inspect device mappings:

```bash
docker inspect frigate \
  --format '{{json .HostConfig.Devices}}' | jq
```

Where USB devices are mapped directly, the Frigate Compose configuration must expose the required device.

Example pattern:

```yaml
devices:
  - /dev/video0:/dev/video0
```

The active `frigate.yml` remains the authoritative configuration.

---

# 11. Verify Camera Access from the Container

Check whether the device is visible inside Frigate:

```bash
docker exec frigate ls -l /dev/video*
```

If the expected device is missing:

```text
Ubuntu sees camera
        │
        ▼
Frigate does not
```

then inspect the Compose device mapping.

---

# 12. Camera Naming

Each Frigate camera should have a meaningful logical name.

For example:

```yaml
cameras:

  usb_camera:
```

A descriptive camera name becomes important because it is reused in:

- Frigate events
- MQTT topics
- API queries
- Home Assistant
- Automations
- LPR metadata
- Notifications

The HomeLab has used a camera identifier such as:

```text
usb_camera
```

during AI validation.

---

# 13. Camera Configuration Structure

A simplified Frigate camera configuration follows the pattern:

```yaml
cameras:

  usb_camera:

    ffmpeg:

      inputs:

        - path: <camera-stream>

          roles:
            - detect
            - record
```

The exact camera path depends on whether the source is:

```text
USB
RTSP
HTTP
go2rtc
NVR
```

The current Frigate configuration should remain the authoritative source.

---

# 14. Stream Roles

Frigate allows a video stream to perform different roles.

Common roles include:

```text
detect
record
```

Conceptually:

```text
Camera Stream
      │
      ├── detect
      │      │
      │      ▼
      │  AI Processing
      │
      └── record
             │
             ▼
         Recording
```

Using different streams for different purposes becomes more important with Production IP cameras.

---

# 15. Production Multi-Stream Design

Many IP cameras provide:

```text
Main Stream
Sub Stream
```

A recommended future architecture is:

```text
Camera
   │
   ├── Main Stream
   │      │
   │      └── Recording
   │
   └── Sub Stream
          │
          └── Detection
```

This reduces AI-processing load because the lower-resolution stream can be used for detection while retaining the higher-resolution stream for recordings.

---

# 16. go2rtc Role

Frigate includes **go2rtc** for stream restreaming and low-latency camera delivery.

The architecture is:

```text
Camera
   │
   ▼
go2rtc
   │
   ├── Frigate
   ├── Browser
   └── Home Assistant
```

Rather than every application independently connecting to the physical camera, go2rtc can provide a shared restreaming layer.

---

# 17. Why Restreaming Helps

Without restreaming:

```text
Camera
  │
  ├── Frigate connection
  ├── Home Assistant connection
  ├── Browser connection
  └── Other client connection
```

With go2rtc:

```text
Camera
   │
   ▼
go2rtc
   │
   ├── Frigate
   ├── Home Assistant
   └── Browser
```

This reduces unnecessary camera sessions.

---

# 18. Example go2rtc Structure

A typical configuration pattern is:

```yaml
go2rtc:

  streams:

    usb_camera:
      - <camera-source>
```

The exact source should be taken from the current Frigate configuration.

---

# 19. Verify Frigate Startup

After camera configuration changes:

```bash
cd ~/docker
./dockerctl restart frigate frigate
```

Immediately inspect:

```bash
./dockerctl logs frigate frigate
```

Look for:

```text
FFmpeg startup
Camera startup
go2rtc startup
Connection errors
Decode failures
Stream timeouts
```

---

# 20. Do Not Restart the Entire HomeLab

Camera configuration changes normally require only Frigate to restart.

Use:

```bash
./dockerctl restart frigate frigate
```

rather than:

```bash
./dockerctl restart-all
```

This leaves:

```text
MQTT
Home Assistant
Portainer
Dozzle
WebSSH
```

running.

---

# 21. Verify Camera in Frigate

Open:

```text
http://<UBUNTU_VM_IP>:5000
```

The configured camera should appear in the Frigate interface.

Verify:

- Live video visible
- No repeated disconnects
- Expected camera name
- Correct orientation
- Stable frame delivery

---

# 22. Verify Frigate API

Check events:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" \
  | jq
```

If the camera is generating detection events, the API should return associated event data.

---

# 23. FFmpeg Troubleshooting

FFmpeg performs much of the underlying video processing.

Frigate logs should be checked for messages involving:

```text
ffmpeg
decode
stream
connection
timeout
frames
```

Run:

```bash
docker logs frigate --tail 200 |
grep -i ffmpeg
```

or:

```bash
docker logs frigate --tail 200 |
grep -Ei "error|ffmpeg|camera|stream"
```

---

# 24. Verify Camera Stream Independently

Where the source is RTSP, test it independently from Frigate.

Using FFmpeg:

```bash
ffmpeg -rtsp_transport tcp \
  -i "<RTSP_URL>" \
  -t 10 \
  -f null -
```

This helps determine whether:

```text
Camera Stream
```

itself works before involving Frigate.

Never publish camera usernames or passwords in documentation.

---

# 25. RTSP Architecture

For future IP-camera deployments:

```text
IP Camera
     │
     ▼
RTSP
     │
     ▼
Frigate / go2rtc
```

Typical URI structure:

```text
rtsp://<username>:<password>@<camera-ip>:554/<stream-path>
```

Actual credentials and URLs must remain private.

---

# 26. Camera Credentials

Camera credentials should not be hard-coded into public documentation.

Instead use:

```text
<camera-username>
<camera-password>
<camera-ip>
```

Sensitive values may be supplied through:

- Environment files
- Secrets files
- Protected configuration
- Private runtime configuration

---

# 27. Recording Validation

After the camera stream is stable, enable recording.

Verify recording through the Frigate UI.

The path becomes:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
Recording Pipeline
   │
   ▼
Persistent Media Storage
```

---

# 28. Verify Recording Storage

Inspect the media directory:

```bash
docker exec frigate \
  find /media/frigate \
  -maxdepth 2 \
  -type d \
  -printf '%p\n' |
head -50
```

The actual host-side media directory should also be verified from the Compose mounts.

---

# 29. Recording Disk Usage

Check media usage:

```bash
docker exec frigate \
  du -sh /media/frigate 2>/dev/null
```

If mounted on the Ubuntu host, inspect the host directory as well.

Disk usage should be monitored because video retention can consume storage rapidly.

---

# 30. Snapshot Validation

Frigate snapshots should be verified after detections occur.

The flow is:

```text
Detection
   │
   ▼
Event
   │
   ▼
Snapshot
```

Snapshots later become useful for:

- Notifications
- Home Assistant dashboards
- LPR
- Face recognition
- Event review

---

# 31. Camera → Detection Separation

A camera being visible does not automatically prove that detection works.

Validation should therefore remain layered.

```text
Camera Visible
      ✅
      │
      ▼
Recording
      ✅
      │
      ▼
Snapshot
      ✅
      │
      ▼
Object Detection
      ?
```

Each layer should be verified separately.

---

# 32. Camera → Home Assistant Integration

Once Frigate camera streams are stable, they can be exposed through Home Assistant.

The architecture is:

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
```

This avoids making Home Assistant directly responsible for AI video processing.

---

# 33. Advanced Camera Card

The Home Assistant environment uses **Advanced Camera Card** for improved camera visualization.

The card replaced the earlier camera-viewing approach used during testing.

Its purpose is to improve:

- Camera presentation
- Stream selection
- Dashboard integration
- User experience
- Perceived stream latency

The viewing path is:

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
```

---

# 34. Why Home Assistant Does Not Perform Detection

Home Assistant provides the automation and visualization layer.

Frigate provides the video AI layer.

The intended separation is:

```text
Frigate
   │
   └── Detection

Home Assistant
   │
   └── Automation / Dashboard
```

Therefore:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
AI Event
   │
   ▼
Home Assistant
```

rather than:

```text
Camera
   │
   ▼
Home Assistant
   │
   ▼
Frigate
```

---

# 35. Camera Event Architecture

Once detection is enabled:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
Detection Event
   │
   ├── MQTT
   │
   └── HTTP API
```

This keeps video processing in Frigate while making metadata available to other HomeAuto services.

---

# 36. Camera API Query

For a camera named:

```text
usb_camera
```

retrieve events using:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" \
  | jq
```

This verifies whether the camera is contributing events to the Frigate database.

---

# 37. LPR Camera Testing

The camera pipeline was also used for LPR validation.

The test flow was:

```text
Camera
   │
   ▼
Vehicle / Plate
   │
   ▼
Frigate
   │
   ▼
LPR
   │
   ▼
Event Database
```

During testing, Frigate successfully stored:

```text
recognized_license_plate = TS07JF8179
```

with confidence approximately:

```text
0.98 – 0.99
```

This confirmed that the camera image quality and AI pipeline were sufficient for the tested LPR scenario.

---

# 38. Face Recognition Camera Testing

The same camera layer is being used for face-recognition validation.

The flow is:

```text
Camera
   │
   ▼
Person
   │
   ▼
Frigate Detection
   │
   ▼
Face Pipeline
```

Current status remains:

```text
Under Validation
```

because stored face entries have not yet been fully validated end-to-end.

---

# 39. Camera Positioning for AI Tests

During Lab testing, camera positioning directly affects AI results.

Important factors include:

- Subject distance
- Camera angle
- Lighting
- Motion blur
- Resolution
- Frame rate
- Obstructions

For LPR specifically:

```text
Plate
 │
 ├── sufficiently large in frame
 ├── reasonably straight
 ├── adequately illuminated
 └── not heavily blurred
```

For face recognition:

```text
Face
 │
 ├── visible
 ├── adequately illuminated
 ├── sufficiently large
 └── reasonably frontal
```

---

# 40. Stream Latency

Camera latency should be evaluated separately from AI-event latency.

There are several stages:

```text
Camera Capture
      │
      ▼
Transport
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
Browser
```

Delay may originate at any stage.

---

# 41. Latency Troubleshooting

If the Home Assistant camera view is slow:

```text
Check Frigate Live View
       │
       ▼
Is Frigate also delayed?
       │
       ├── YES
       │     ↓
       │ Camera / codec / go2rtc issue
       │
       └── NO
             ↓
       Home Assistant viewing path
```

The Advanced Camera Card was introduced to improve the Home Assistant viewing experience.

---

# 42. Inspect Frigate Logs During Camera Testing

Run:

```bash
docker logs frigate --tail 100
```

or live:

```bash
./dockerctl logs frigate frigate
```

Useful search:

```bash
docker logs frigate --tail 300 |
grep -Ei "camera|ffmpeg|go2rtc|error|warning"
```

---

# 43. Use Dozzle for Live Camera Troubleshooting

Dozzle can also be used during camera testing.

Open:

```text
http://<UBUNTU_VM_IP>:8080
```

Select:

```text
frigate
```

Then restart Frigate:

```bash
./dockerctl restart frigate frigate
```

Observe the startup logs in real time.

---

# 44. Troubleshooting — Camera Missing in Ubuntu

Check:

```bash
ls -l /dev/video*
```

and:

```bash
v4l2-ctl --list-devices
```

If nothing is returned:

```text
Camera not available to Ubuntu
```

Investigate the virtualization/device-passthrough layer before Frigate.

---

# 45. Troubleshooting — Camera Missing Inside Frigate

If Ubuntu sees:

```text
/dev/video0
```

but Frigate does not:

```bash
docker exec frigate ls -l /dev/video*
```

Then inspect:

```bash
docker inspect frigate \
  --format '{{json .HostConfig.Devices}}' | jq
```

The issue is likely container device exposure.

---

# 46. Troubleshooting — Camera Stream Fails

Check:

```bash
docker logs frigate --tail 200
```

Possible causes:

```text
Invalid stream URL
Wrong username/password
Camera offline
RTSP disabled
Codec unsupported
Network unreachable
USB device missing
FFmpeg failure
```

---

# 47. Troubleshooting — RTSP Camera Unreachable

Test network:

```bash
ping -c 4 <CAMERA_IP>
```

Test RTSP port:

```bash
nc -vz <CAMERA_IP> 554
```

If `nc` is unavailable:

```bash
sudo apt install netcat-openbsd -y
```

Then retry.

---

# 48. Troubleshooting — Stream Works Outside Frigate

If FFmpeg can read the camera stream but Frigate cannot:

```text
Camera
   ✅

Network
   ✅

RTSP
   ✅

Frigate
   ❌
```

Investigate:

- Frigate YAML
- FFmpeg input parameters
- Roles
- go2rtc configuration
- Container networking

---

# 49. Troubleshooting — Frigate Camera Works but HA Does Not

If:

```text
Frigate Live View
      ✅
```

but:

```text
Home Assistant
      ❌
```

then avoid changing the camera itself.

Investigate:

```text
Frigate integration
go2rtc path
Home Assistant entity
Advanced Camera Card
Browser
```

---

# 50. Troubleshooting — Recording Not Working

Verify:

```text
Camera stream
       ✅
```

Then inspect:

```bash
docker logs frigate --tail 100
```

Check:

- `record` role
- Recording configuration
- Media mount
- Storage permissions
- Available disk space

Disk:

```bash
df -h
```

---

# 51. Troubleshooting — Storage Full

Check:

```bash
df -h
```

Frigate media:

```bash
docker exec frigate \
  du -sh /media/frigate 2>/dev/null
```

If storage usage is excessive, investigate:

- Retention policy
- Continuous recording
- Number of cameras
- Resolution
- Bitrate
- Recording duration

Do not delete media blindly without understanding the retention configuration.

---

# 52. Camera Restart Procedure

Most camera-configuration changes require only Frigate to restart.

Run:

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

---

# 53. Camera Verification Workflow

Use the following sequence after adding a camera:

```text
01
Camera visible / reachable

02
Stream independently tested

03
Frigate configuration validated

04
Frigate restarted

05
Frigate logs clean

06
Live view visible

07
go2rtc stable

08
Recording validated

09
Snapshot validated

10
Detection enabled

11
API event verified

12
Home Assistant view verified
```

---

# 54. Camera Verification Commands

## Frigate state

```bash
./dockerctl status frigate frigate
```

## Logs

```bash
docker logs frigate --tail 100
```

## Frigate UI listener

```bash
sudo ss -lnt | grep 5000
```

## Events

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" \
  | jq
```

## Resource utilization

```bash
docker stats frigate
```

## Storage

```bash
df -h
```

---

# 55. Camera Integration Verification Checklist

| Verification | Command / Method | Expected Result |
|---|---|---|
| Camera visible to Ubuntu | `ls /dev/video*` | Device visible where applicable |
| Camera capabilities | `v4l2-ctl --list-formats-ext` | Formats shown |
| Container device access | `docker exec frigate ls /dev/video*` | Device visible where applicable |
| Frigate stack | `./dockerctl status frigate frigate` | Running |
| Frigate logs | `docker logs frigate --tail 100` | No persistent stream failure |
| Frigate UI | Browser | Camera visible |
| go2rtc | Frigate UI/config | Stream operational |
| Live view | Frigate | Video visible |
| Recording | Frigate | Verified |
| Snapshot | Frigate | Verified |
| Events API | `/api/events` | Camera events returned |
| Object detection readiness | Frigate | Ready |
| LPR camera quality | Frigate API | Plate successfully recognized |
| HA camera view | Home Assistant | Camera visible |
| Advanced Camera Card | HA Dashboard | Operational |
| Frigate restart | `./dockerctl restart frigate frigate` | Frigate only restarted |

---

# 56. Current Functional State

The HomeLab camera pipeline is:

```text
Camera Source
      │
      ▼
Frigate
      │
      ├── Live View
      ├── go2rtc
      ├── Recording
      ├── Snapshot
      ├── Object Detection
      ├── LPR
      └── Face Recognition Validation
      │
      ▼
Home Assistant
      │
      ▼
Advanced Camera Card
```

The camera layer is considered functionally validated when:

- The source is reachable
- Frigate can ingest the stream
- Live video is visible
- go2rtc works
- Recording works
- Snapshots work
- Detection events can be produced
- API events identify the correct camera
- LPR receives sufficient image quality
- Home Assistant can display the stream
- Frigate can be restarted without affecting unrelated services

---

# 57. Production Camera Roadmap

The current Lab camera setup establishes the application pipeline.

Production will expand this architecture to dedicated IP cameras.

The future model is:

```text
PoE IP Cameras
       │
       ▼
Camera Network / VLAN
       │
       ▼
NVR / Direct RTSP
       │
       ▼
Frigate
       │
       ▼
AI Detection
       │
       ▼
Home Assistant
```

Production considerations include:

- Camera VLAN
- PoE switching
- Static addressing / DHCP reservations
- RTSP authentication
- Main/sub streams
- Camera bitrate
- Recording retention
- Camera isolation
- Firewall policy
- Hardware decoding
- Coral TPU
- Production storage

---

# 58. Remote-Site Camera Roadmap

The architecture may also include cameras located at another physical site.

The secure design is:

```text
Site B Cameras / NVR
        │
        ▼
Site B Network
        │
        ▼
Encrypted VPN
        │
        ▼
Site A HomeAuto Network
        │
        ▼
Frigate
```

Camera streams should not be exposed directly to the public Internet.

A secure site-to-site or host-based VPN should provide private connectivity.

---

# 59. Scaling Considerations

A future Production implementation may contain many more cameras than the HomeLab.

Scaling affects:

```text
Network bandwidth
CPU
Video decoding
Detection processing
Storage
Recording retention
Home Assistant dashboard load
```

The HomeLab therefore validates functionality first before Production sizing is finalized.

---

# 60. Hardware Acceleration

The current camera testing is primarily focused on functionality.

The planned performance path is:

```text
Current
   │
   ▼
CPU-Based Video / AI Validation
   │
   ▼
Hardware Acceleration
   │
   ├── Coral TPU
   ├── GPU
   └── Intel Quick Sync
```

This separates functional errors from acceleration-specific problems.

---

# 61. Engineering Outcome

The camera implementation established an important troubleshooting principle:

> **Validate the video pipeline before validating the AI pipeline.**

The correct troubleshooting order is:

```text
Camera
   │
   ▼
Network / Device
   │
   ▼
Video Stream
   │
   ▼
Frigate
   │
   ▼
go2rtc
   │
   ▼
Recording
   │
   ▼
Detection
   │
   ▼
Integration
```

This prevents downstream services from being investigated when the problem originates at the camera source.

---

# 62. Next Implementation Stage

With the camera pipeline validated, the next stage is:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
Object Detection
```

The **Object Detection** runbook should document:

- Detector configuration
- Tracked objects
- Person detection
- Event lifecycle
- Frigate API verification
- MQTT event validation
- Snapshots
- Recording association
- Home Assistant consumption
- Detection troubleshooting
- CPU utilization
- Future Coral TPU acceleration