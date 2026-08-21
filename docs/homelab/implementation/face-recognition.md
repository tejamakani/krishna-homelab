---
title: Face Recognition
sidebar_label: Face Recognition
description: Frigate face recognition architecture, enrollment, person identification, MQTT and API validation, Home Assistant integration, troubleshooting, and verification for the Makani HomeAuto HomeLab.
---

# Face Recognition

Face Recognition extends the **Makani HomeAuto** surveillance platform beyond basic person detection.

Instead of identifying only:

```text
person
```

the objective is to associate a detected person with a known identity.

The logical processing path is:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
Person Detection
   │
   ▼
Face Detection
   │
   ▼
Face Recognition
   │
   ▼
Known Identity
   │
   ▼
Frigate sub_label
   │
   ├── MQTT
   └── HTTP API
          │
          ▼
     Home Assistant
```

Face Recognition therefore depends on the underlying camera and person-detection pipelines being operational first.

---

# 1. Purpose

The Face Recognition implementation is intended to provide:

- Detection of known people
- Association of identities with Frigate person events
- Face metadata inside Frigate
- Home Assistant face entities
- Dashboard visibility
- Person-specific automations
- Notifications
- Future Alexa announcements

The engineering objective is not simply to recognize a face.

The complete objective is:

```text
Person Appears
      │
      ▼
Frigate Detects Person
      │
      ▼
Face Recognized
      │
      ▼
Identity Published
      │
      ▼
Home Assistant
      │
      ▼
Automation
```

---

# 2. Dependency Chain

Face Recognition should only be investigated after the preceding layers are working.

```text
Camera
   │
   ▼
Stable Video Stream
   │
   ▼
Frigate
   │
   ▼
Person Detection
   │
   ▼
Tracked Person
   │
   ▼
Face Recognition
```

If person detection itself is failing, troubleshooting the face-recognition layer is premature.

---

# 3. Current Architecture

The HomeLab architecture is:

```text
USB Camera
     │
     ▼
Frigate 0.17.2
     │
     ▼
Person Detection
     │
     ▼
Face Recognition
     │
     ▼
Identity Metadata
     │
     ├──────────────┐
     ▼              ▼
   MQTT          HTTP API
     │              │
     ▼              ▼
Mosquitto       API Validation
     │
     └──────┬───────┘
            ▼
     Home Assistant
            │
            ▼
   Sensor / Automation
```

This provides multiple validation points rather than depending entirely on one integration interface.

---

# 4. Face Recognition Is Not Person Detection

These are separate processing stages.

Person detection answers:

```text
Is there a person?
```

Face recognition answers:

```text
Who is this person?
```

Therefore:

```text
Camera
   │
   ▼
person
   │
   ▼
Known Person
```

is a multi-stage AI workflow.

A person may be detected successfully even when no face can be recognized.

---

# 5. Person Detection Prerequisite

Before testing Face Recognition, perform a controlled person-detection test.

Check recent events:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" \
  | jq
```

Inspect labels:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" |
jq '.[] | {
  id,
  camera,
  label,
  sub_label,
  start_time
}'
```

Expected person events should contain:

```text
label = person
```

---

# 6. Face Recognition Metadata

When a known person is successfully associated with a Frigate event, identity information can appear as the event:

```text
sub_label
```

Conceptually:

```json
{
  "label": "person",
  "sub_label": "known_person"
}
```

This distinction is important.

The primary object remains:

```text
person
```

while the recognized identity is associated with the tracked object through additional metadata.

---

# 7. Face Library

Face recognition requires known identities against which detected faces can be compared.

Conceptually:

```text
Known Person
     │
     ▼
Reference Images
     │
     ▼
Face Library
     │
     ▼
Frigate Recognition
```

The quality of this reference data directly affects recognition reliability.

---

# 8. Enrollment Strategy

A good face dataset should contain multiple clear images of the same person rather than relying on a single photograph.

Useful variations include:

```text
Front View
Slight Left Angle
Slight Right Angle
Different Lighting
Natural Expression
Minor Appearance Variation
```

Avoid poor-quality enrollment images containing:

- Very small faces
- Severe blur
- Heavy shadows
- Multiple people
- Extreme angles
- Major obstruction of the face

---

# 9. Privacy Consideration

Face-recognition data is biometric information and should be treated as sensitive.

Reference images should not be committed into the public Git repository.

Do not store real face datasets under public documentation directories such as:

```text
docs/
static/
```

unless they are intentionally non-sensitive test assets.

Production biometric data should remain within the private HomeAuto infrastructure.

---

# 10. Verify Frigate Face API

The Frigate face endpoint was checked using:

```bash
curl -s \
  http://127.0.0.1:5000/api/faces \
  | jq
```

During one validation stage, the response was:

```json
{}
```

This was an important troubleshooting observation.

It indicated that no face identities were exposed through that API response at that point in testing.

---

# 11. Important Interpretation of Empty Face API

An empty response:

```json
{}
```

does not mean that:

```text
Camera is broken
```

or necessarily that:

```text
Person detection is broken
```

The layers must be tested independently.

```text
Camera
   ✅
   │
Person Detection
   ✅
   │
Face API
   {}
```

This moves the troubleshooting boundary specifically toward the face-recognition workflow.

---

# 12. Face Storage Inspection

The Frigate container was also inspected for face-related storage.

Run:

```bash
docker exec frigate \
  find /media/frigate/clips/faces \
  -maxdepth 2 \
  -type d \
  -printf '%p\n'
```

The directory was observed as:

```text
/media/frigate/clips/faces
```

---

# 13. Search for Stored Face Files

Run:

```bash
docker exec frigate \
  find /media/frigate/clips/faces \
  -maxdepth 3 \
  -type f \
  -printf '%p\n'
```

For a shorter result:

```bash
docker exec frigate \
  find /media/frigate/clips/faces \
  -maxdepth 3 \
  -type f \
  -printf '%p\n' |
head -50
```

During the earlier validation stage, no stored face files were returned.

---

# 14. Why Storage Verification Matters

This allows us to distinguish between:

```text
API Presentation Problem
```

and:

```text
No Face Data Exists
```

For example:

```text
/api/faces
    │
    ▼
   {}
    │
    ▼
Check Face Storage
    │
    ├── Files Exist
    │      │
    │      ▼
    │ Investigate API / Recognition State
    │
    └── No Files
           │
           ▼
      Investigate Enrollment /
      Recognition Pipeline
```

This is consistent with the HomeAuto troubleshooting methodology of validating each layer separately.

---

# 15. Check Frigate Logs

Inspect recent logs:

```bash
docker logs frigate --tail 100
```

Search for face-related messages:

```bash
docker logs frigate --tail 500 |
grep -Ei "face|recognition|person|error|warning"
```

For live monitoring:

```bash
./dockerctl logs frigate frigate
```

Exit with:

```text
Ctrl+C
```

---

# 16. Use Dozzle During Face Testing

Dozzle can provide easier live-log visibility.

Open:

```text
http://<UBUNTU_VM_IP>:8080
```

Select:

```text
frigate
```

Then perform a controlled recognition test in front of the camera.

Watch for:

```text
Person detection
Face processing
Recognition messages
Warnings
Errors
```

---

# 17. Controlled Face Recognition Test

A controlled test should follow the same procedure each time.

```text
01
Confirm Frigate running

02
Confirm camera live

03
Stand clearly in camera view

04
Confirm person detection

05
Allow face to remain visible

06
Inspect Frigate event

07
Inspect sub_label

08
Check Face API

09
Check MQTT

10
Check Home Assistant
```

This produces repeatable results.

---

# 18. Verify Latest Person Event

Run:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" |
jq '
  map(select(.label == "person")) |
  .[0]
'
```

Inspect:

```text
id
camera
label
sub_label
start_time
end_time
```

---

# 19. Inspect Person and sub_label

A compact query:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" |
jq '
  map(select(.label == "person")) |
  .[] |
  {
    id,
    camera,
    label,
    sub_label
  }
'
```

The desired progression is:

```text
label: person
sub_label: null
```

before recognition, followed by something equivalent to:

```text
label: person
sub_label: <recognized_identity>
```

when recognition succeeds.

---

# 20. Recognition Architecture

The conceptual identity pipeline is:

```text
Person Event
      │
      ▼
Visible Face
      │
      ▼
Face Representation
      │
      ▼
Known Face Comparison
      │
      ▼
Recognition Confidence
      │
      ▼
Identity
      │
      ▼
sub_label
```

This metadata can then be consumed outside Frigate.

---

# 21. MQTT Integration

For normal event-driven integration, Frigate publishes event information through MQTT.

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

The HomeLab MQTT broker is deployed independently from Frigate.

---

# 22. Verify MQTT

Check broker state:

```bash
cd ~/docker
./dockerctl status mqtt mqtt
```

Logs:

```bash
docker logs mqtt --tail 50
```

---

# 23. Monitor Frigate Events

Subscribe using the configured MQTT credentials:

```bash
mosquitto_sub \
  -h <MQTT_BROKER> \
  -p 1883 \
  -u <MQTT_USER> \
  -P '<MQTT_PASSWORD>' \
  -t 'frigate/events' \
  -v
```

Do not place actual MQTT credentials in the public Git repository.

---

# 24. Inspect Person Events

A useful development command is:

```bash
mosquitto_sub \
  -h <MQTT_BROKER> \
  -p 1883 \
  -u <MQTT_USER> \
  -P '<MQTT_PASSWORD>' \
  -t 'frigate/events' |
jq
```

During a recognition test, inspect:

```text
after.label
after.sub_label
after.camera
```

---

# 25. Home Assistant Face Sensor

The Home Assistant configuration includes an MQTT sensor for the last recognized face.

The implemented structure is based on:

```yaml
mqtt:

  sensor:

    - name: "Frigate Last Recognized Face"

      unique_id: frigate_last_recognized_face

      state_topic: "frigate/events"

      value_template: >-
        {% if value_json.after is defined
              and value_json.after.label == 'person'
              and value_json.after.sub_label is not none
              and value_json.after.sub_label | length >= 2 %}
          {{ value_json.after.sub_label }}
        {% endif %}
```

This exposes recognized identity metadata to Home Assistant.

---

# 26. Home Assistant Entity

The resulting entity is intended to represent:

```text
Frigate Last Recognized Face
```

The flow becomes:

```text
Frigate Person Event
       │
       ▼
sub_label
       │
       ▼
frigate/events
       │
       ▼
Mosquitto
       │
       ▼
Home Assistant MQTT Sensor
       │
       ▼
Recognized Person
```

---

# 27. Home Assistant Sensor Validation

After modifying Home Assistant configuration, validate and restart Home Assistant using the established service-management process.

Restart only Home Assistant:

```bash
cd ~/docker
./dockerctl restart homeassistant homeassistant
```

Check:

```bash
./dockerctl status homeassistant homeassistant
```

Logs:

```bash
./dockerctl logs homeassistant homeassistant
```

The MQTT sensors were confirmed visible after the Home Assistant restart.

---

# 28. Why Home Assistant Restart Is Isolated

Changing the Home Assistant MQTT sensor does not require restarting:

```text
Frigate
MQTT
Portainer
Dozzle
WebSSH
```

Therefore:

```bash
./dockerctl restart homeassistant homeassistant
```

is preferred.

Likewise, changing only Frigate configuration should use:

```bash
./dockerctl restart frigate frigate
```

---

# 29. End-to-End Face Event Path

Once recognition succeeds, the complete event path becomes:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
Person Detection
   │
   ▼
Face Recognition
   │
   ▼
sub_label
   │
   ▼
frigate/events
   │
   ▼
Mosquitto
   │
   ▼
Home Assistant
   │
   ▼
Frigate Last Recognized Face
```

This creates a standard Home Assistant entity from Frigate AI metadata.

---

# 30. Dashboard Integration

The recognized-face entity can later be displayed in the Home Assistant dashboard.

Conceptually:

```text
HomeAuto Dashboard

┌──────────────────────────────┐
│ Last Recognized Person       │
│                              │
│ <recognized_identity>        │
│                              │
│ Camera: usb_camera           │
└──────────────────────────────┘
```

This can be combined with the camera feed provided through the Advanced Camera Card.

---

# 31. Advanced Camera Card

The visual path is:

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

The metadata path remains:

```text
Frigate
   │
   ▼
MQTT / API
   │
   ▼
Home Assistant Sensor
```

Keeping video and metadata paths conceptually separate makes troubleshooting easier.

---

# 32. Future Person-Specific Automation

Once recognition reliability is validated, the sensor can trigger person-specific automations.

For example:

```text
Known Person Recognized
         │
         ▼
Home Assistant
         │
         ├── Dashboard Update
         ├── Notification
         ├── Snapshot
         └── Alexa Announcement
```

Automations should only be enabled after false-recognition behavior has been evaluated.

---

# 33. Alexa Integration Possibility

Because Alexa integration is already available in the Home Assistant environment, a future workflow can be:

```text
Recognized Face
      │
      ▼
Home Assistant
      │
      ▼
Automation
      │
      ▼
Alexa
```

Example outcome:

```text
Known person detected at the entrance.
```

This should be considered a downstream automation rather than part of Frigate recognition itself.

---

# 34. API as Independent Validation

Even when MQTT is used for the final automation, the Frigate API remains useful for troubleshooting.

```text
Face Not Appearing in HA
        │
        ▼
Check Frigate Event API
        │
        ├── Identity Present
        │       │
        │       ▼
        │  Investigate MQTT / HA
        │
        └── Identity Missing
                │
                ▼
         Investigate Frigate
```

This prevents unnecessary MQTT or Home Assistant changes when recognition itself has not succeeded.

---

# 35. API Event Verification

Run:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" |
jq '
  map(select(.label == "person")) |
  .[] |
  {
    id,
    camera,
    label,
    sub_label
  }
'
```

If `sub_label` contains the expected identity, recognition metadata has reached the Frigate event database.

---

# 36. MQTT Verification Boundary

If the API contains:

```text
label = person
sub_label = recognized_identity
```

but Home Assistant does not update:

```text
Face Recognition
      ✅

Frigate Event
      ✅

Home Assistant
      ❌
```

The next layer to inspect is MQTT.

---

# 37. Home Assistant Verification Boundary

If MQTT contains the correct `sub_label`:

```text
Frigate
   ✅
   │
MQTT
   ✅
   │
Home Assistant
   ❌
```

then inspect:

```text
MQTT sensor configuration
Jinja template
Entity state
Home Assistant logs
```

Do not retrain the face model at this stage.

---

# 38. Troubleshooting — Person Not Detected

If no person event exists:

```text
Camera
   │
   ▼
Person Detection
   ❌
```

Face Recognition cannot run successfully.

Check:

```bash
docker logs frigate --tail 200
```

and:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" \
  | jq
```

Resolve object detection first.

---

# 39. Troubleshooting — Person Detected but No Identity

If:

```text
label = person
```

but:

```text
sub_label = null
```

then investigate:

- Face visibility
- Face size
- Lighting
- Camera angle
- Reference images
- Recognition configuration
- Face library
- Recognition confidence

The camera and person detector have already passed.

---

# 40. Troubleshooting — Face Too Small

Face recognition requires enough usable facial detail.

The effective path is:

```text
Person in Frame
      │
      ▼
Face Region
      │
      ▼
Enough Detail?
      │
      ├── YES → Recognition
      │
      └── NO  → Unknown / No Match
```

Camera positioning can therefore be as important as AI configuration.

---

# 41. Troubleshooting — Lighting

Poor lighting can reduce recognition reliability.

Test under:

```text
Normal Daylight
Indoor Lighting
Low Light
Backlighting
```

Avoid tuning the recognition system based on a single ideal lighting condition.

---

# 42. Troubleshooting — Incorrect Recognition

If a person is identified incorrectly, do not immediately lower recognition thresholds.

Investigate:

- Quality of reference images
- Similar faces
- Face angle
- Lighting
- Dataset diversity
- Recognition confidence

False positive recognition is generally more problematic than returning an unknown person.

---

# 43. Troubleshooting — Face API Empty

Run:

```bash
curl -s \
  http://127.0.0.1:5000/api/faces \
  | jq
```

If:

```json
{}
```

then inspect storage:

```bash
docker exec frigate \
  find /media/frigate/clips/faces \
  -maxdepth 3 \
  -type f \
  -printf '%p\n'
```

Then inspect logs:

```bash
docker logs frigate --tail 500 |
grep -Ei "face|recognition|error|warning"
```

This provides three independent validation points:

```text
API
Storage
Logs
```

---

# 44. Troubleshooting — MQTT Sensor Does Not Update

First check the raw event:

```bash
mosquitto_sub \
  -h <MQTT_BROKER> \
  -p 1883 \
  -u <MQTT_USER> \
  -P '<MQTT_PASSWORD>' \
  -t 'frigate/events' \
  -v
```

Look for:

```text
after.label
after.sub_label
```

If the correct values are present, inspect Home Assistant.

---

# 45. Home Assistant Logs

Run:

```bash
docker logs homeassistant --tail 100
```

Search MQTT-related entries:

```bash
docker logs homeassistant --tail 500 |
grep -Ei "mqtt|template|sensor|error|warning"
```

---

# 46. Verify Home Assistant Configuration

After editing:

```text
configuration.yaml
```

check the relevant MQTT block:

```bash
grep -n -A100 "^mqtt:" \
  ~/docker/homeassistant/config/configuration.yaml
```

This is useful for validating indentation and sensor placement.

YAML indentation is significant.

---

# 47. Restart Home Assistant After Sensor Changes

Run:

```bash
cd ~/docker

./dockerctl restart \
  homeassistant \
  homeassistant
```

Then:

```bash
./dockerctl logs \
  homeassistant \
  homeassistant
```

Verify the entity in Home Assistant after startup completes.

---

# 48. Restart Frigate After Recognition Changes

If the Frigate face-recognition configuration changes:

```bash
cd ~/docker

./dockerctl restart \
  frigate \
  frigate
```

Check:

```bash
./dockerctl logs \
  frigate \
  frigate
```

Do not restart Home Assistant unless its configuration also changed.

---

# 49. Face Recognition Resource Usage

Face Recognition adds another AI workload beyond base object detection.

Monitor Frigate:

```bash
docker stats frigate
```

Host:

```bash
top
```

Memory:

```bash
free -h
```

This helps establish the CPU-based performance baseline.

---

# 50. Current Validation Status

The current engineering status should be represented conservatively.

| Component | Status |
|---|---|
| Camera Pipeline | ✅ Validated |
| Frigate | ✅ Running |
| Person Detection | ✅ Validated |
| Frigate MQTT | ✅ Operational |
| HA MQTT Sensors | ✅ Visible |
| Face API | 🟡 Tested |
| Face Storage Path | ✅ Verified |
| Stored Face Files | 🟡 Further validation |
| Identity Recognition | 🟡 Under validation |
| `sub_label` End-to-End | 🟡 Under validation |
| HA Face Automation | ⏳ Next phase |
| Alexa Face Announcement | ⏳ Future |
| Hardware Acceleration | ⏳ Future |

Do not mark Face Recognition fully complete until a known person is consistently recognized end-to-end.

---

# 51. Why This Status Matters

HomeAuto documentation should distinguish between:

```text
Installed
Configured
Tested
Validated
Production Ready
```

These are not equivalent.

For Face Recognition, the correct current state is:

```text
Infrastructure
      ✅

Integration Framework
      ✅

End-to-End Recognition
      🟡 Under Validation
```

This keeps the engineering documentation accurate.

---

# 52. Verification Workflow

Use the following sequence:

```text
01
Verify Camera

02
Verify Frigate

03
Verify Person Detection

04
Present Known Person

05
Check Frigate Event

06
Check sub_label

07
Check /api/faces

08
Check Face Storage

09
Check MQTT Event

10
Check HA Sensor

11
Repeat Test

12
Measure Reliability
```

A single successful recognition should not be considered sufficient for final validation.

---

# 53. Verification Commands

## Frigate

```bash
./dockerctl status frigate frigate
```

## Camera/person events

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" \
  | jq
```

## Face API

```bash
curl -s \
  http://127.0.0.1:5000/api/faces \
  | jq
```

## Face storage

```bash
docker exec frigate \
  find /media/frigate/clips/faces \
  -maxdepth 3 \
  -type f \
  -printf '%p\n'
```

## Frigate logs

```bash
docker logs frigate --tail 200
```

## Home Assistant

```bash
./dockerctl status \
  homeassistant \
  homeassistant
```

## HA logs

```bash
docker logs homeassistant --tail 100
```

---

# 54. Face Recognition Verification Checklist

| Verification | Method | Expected Result |
|---|---|---|
| Camera | Frigate UI | Stream visible |
| Person detection | Controlled test | `person` detected |
| Person event | `/api/events` | Event returned |
| Face API | `/api/faces` | Endpoint reachable |
| Face storage | Container inspection | Path available |
| Face library | Frigate | Known identity enrolled |
| Recognition | Controlled test | Identity detected |
| `sub_label` | Event metadata | Known identity |
| MQTT | `frigate/events` | Person event received |
| HA MQTT sensor | Home Assistant | Entity visible |
| HA sensor state | Recognition test | Identity updates |
| Frigate logs | Docker / Dozzle | No persistent errors |
| Repeatability | Multiple tests | Consistent recognition |

---

# 55. Target End State

The final Face Recognition architecture is:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
Person Detection
   │
   ▼
Face Recognition
   │
   ▼
Known Identity
   │
   ▼
sub_label
   │
   ├─────────────┐
   │             │
   ▼             ▼
 MQTT          API
   │             │
   ▼             │
Mosquitto        │
   │             │
   └──────┬──────┘
          ▼
   Home Assistant
          │
          ├── Sensor
          ├── Dashboard
          ├── Notification
          ├── Snapshot
          └── Alexa
```

---

# 56. Engineering Outcome

Face Recognition demonstrates why HomeAuto separates:

```text
Detection
Recognition
Transport
Automation
```

into independent troubleshooting domains.

For example:

```text
Person detected?
      │
      ├── NO
      │    └── Object Detection Problem
      │
      └── YES
            │
            ▼
      Face recognized?
            │
            ├── NO
            │    └── Recognition Problem
            │
            └── YES
                  │
                  ▼
           MQTT/API contains identity?
                  │
                  ├── NO
                  │    └── Metadata Transport
                  │
                  └── YES
                        │
                        ▼
                  HA updated?
                        │
                        ├── NO → HA Integration
                        │
                        └── YES → Validated
```

This is the same layered troubleshooting methodology used throughout the Makani HomeAuto platform.

---

# 57. Next Implementation Stage

The next runbook is:

```text
Camera
   │
   ▼
Vehicle Detection
   │
   ▼
License Plate Recognition
```

Unlike Face Recognition, we already have strong evidence from the Lab for the LPR pipeline.

The **LPR** documentation will capture:

```text
TS07JF8179
      │
      ▼
Frigate 0.17.2
      │
      ▼
recognized_license_plate
      │
      ▼
~0.98–0.99 confidence
      │
      ▼
Frigate Event Database
      │
      ▼
HTTP API
      │
      ▼
Home Assistant REST Bridge
```

It will also document why we bypassed the inconsistent MQTT LPR publication path for this specific AI service while retaining MQTT for the rest of the HomeAuto event architecture.