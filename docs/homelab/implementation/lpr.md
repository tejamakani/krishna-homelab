---
title: License Plate Recognition
sidebar_label: License Plate Recognition
description: Frigate LPR validation, API-based metadata retrieval, MQTT behavior, Home Assistant REST integration, troubleshooting, and end-to-end verification for the Makani HomeAuto HomeLab.
---

# License Plate Recognition

License Plate Recognition extends the **Makani HomeAuto** surveillance platform beyond generic vehicle detection.

Instead of only identifying:

```text
car
```

or:

```text
vehicle
```

the objective is to extract and expose the actual license plate associated with the event.

The current HomeLab validation path is:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
Vehicle Detection
   │
   ▼
License Plate Recognition
   │
   ▼
Recognized Plate
   │
   ▼
Frigate Event Database
   │
   ├── HTTP API
   └── MQTT
          │
          ▼
     Home Assistant
```

During testing, the HTTP API proved to be the reliable source for the recognized plate metadata.

---

# 1. Purpose

The LPR implementation is intended to provide:

- Vehicle plate recognition
- Plate confidence metadata
- Frigate event correlation
- Home Assistant visibility
- Vehicle-specific automations
- Dashboard display
- Snapshot association
- Future Alexa announcements
- Future known-vehicle workflows

The target workflow is:

```text
Vehicle Arrives
      │
      ▼
Frigate Detects Vehicle
      │
      ▼
Plate Recognized
      │
      ▼
Plate Metadata Stored
      │
      ▼
Home Assistant
      │
      ▼
Automation
```

---

# 2. Dependency Chain

LPR relies on a working upstream video and detection pipeline.

```text
Camera
   │
   ▼
Stable Stream
   │
   ▼
Frigate
   │
   ▼
Vehicle Detection
   │
   ▼
Tracked Vehicle
   │
   ▼
LPR
```

If the camera or vehicle-detection layer is unstable, LPR should not be debugged first.

---

# 3. Current HomeLab Architecture

The current LPR test path is:

```text
USB Camera
     │
     ▼
Frigate 0.17.2
     │
     ▼
Vehicle / Plate Processing
     │
     ▼
LPR Result
     │
     ├──────────────┐
     ▼              ▼
 Frigate API      MQTT
     │              │
     ▼              ▼
Reliable       Inconsistent
for LPR        during Lab test
     │
     ▼
Home Assistant REST Bridge
```

This resulted in a dual-integration model rather than forcing all LPR metadata through MQTT.

---

# 4. Successful Recognition Result

During HomeLab testing, Frigate successfully recognized:

```text
TS07JF8179
```

The associated confidence was approximately:

```text
0.98 – 0.99
```

This confirmed that the following pipeline was functioning:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
Vehicle / Plate Processing
   │
   ▼
LPR Engine
   │
   ▼
Event Metadata
```

---

# 5. Relevant Event Metadata

The important Frigate event fields are:

```text
recognized_license_plate
recognized_license_plate_score
```

The validated result was effectively:

```text
recognized_license_plate = TS07JF8179
```

with:

```text
recognized_license_plate_score ≈ 0.98–0.99
```

---

# 6. Verify Recent Events

Use the Frigate API:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=10" \
  | jq
```

This returns recent events associated with:

```text
usb_camera
```

---

# 7. Filter for LPR Metadata

A more focused query can be used:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=20" |
jq '
  .[] |
  select(.data.recognized_license_plate != null) |
  {
    id,
    camera,
    label,
    start_time,
    plate: .data.recognized_license_plate,
    confidence: .data.recognized_license_plate_score
  }
'
```

The exact JSON nesting should always be validated against the currently running Frigate version.

---

# 8. Retrieve the Latest Recognized Plate

A useful query pattern is:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=50" |
jq '
  map(
    select(
      .data.recognized_license_plate != null
      and
      .data.recognized_license_plate != ""
    )
  ) |
  .[0]
'
```

This helps identify the latest event containing LPR metadata.

---

# 9. Compact Latest LPR Output

For troubleshooting:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=50" |
jq '
  map(
    select(
      .data.recognized_license_plate != null
      and
      .data.recognized_license_plate != ""
    )
  ) |
  .[0] |
  {
    id,
    camera,
    plate: .data.recognized_license_plate,
    confidence: .data.recognized_license_plate_score
  }
'
```

Expected result structure:

```json
{
  "id": "<event-id>",
  "camera": "usb_camera",
  "plate": "TS07JF8179",
  "confidence": 0.989
}
```

The exact score may vary between detections.

---

# 10. Why API Validation Matters

The API provides a direct view of Frigate's internal event state.

This allows us to distinguish:

```text
Recognition Failure
```

from:

```text
Integration Failure
```

For example:

```text
Plate Visible in Frigate API
           │
           ▼
      LPR Succeeded
           │
           ▼
Check MQTT / HA
```

This was critical during the HomeLab test.

---

# 11. MQTT Integration Expectation

The expected MQTT paths included:

```text
frigate/events
```

and:

```text
frigate/tracked_object_update
```

The intention was to obtain recognized plate metadata through standard event-driven MQTT communication.

The logical design was:

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

---

# 12. Monitor Frigate MQTT

Subscribe to all Frigate topics:

```bash
mosquitto_sub \
  -h <MQTT_BROKER> \
  -p 1883 \
  -u <MQTT_USER> \
  -P '<MQTT_PASSWORD>' \
  -t 'frigate/#' \
  -v
```

Do not publish actual MQTT credentials.

---

# 13. Monitor frigate/events

Run:

```bash
mosquitto_sub \
  -h <MQTT_BROKER> \
  -p 1883 \
  -u <MQTT_USER> \
  -P '<MQTT_PASSWORD>' \
  -t 'frigate/events' \
  -v
```

During a plate-recognition test, inspect the event payload.

---

# 14. Monitor tracked_object_update

Run:

```bash
mosquitto_sub \
  -h <MQTT_BROKER> \
  -p 1883 \
  -u <MQTT_USER> \
  -P '<MQTT_PASSWORD>' \
  -t 'frigate/tracked_object_update' \
  -v
```

This topic is relevant to updated object metadata.

---

# 15. MQTT Behavior Observed

During the Frigate 0.17.2 HomeLab validation:

```text
LPR Recognition
      ✅

Event Database
      ✅

Frigate HTTP API
      ✅

Expected MQTT LPR Metadata
      ⚠ Inconsistent
```

This was an important finding.

The MQTT broker itself remained healthy.

The problem was not:

```text
Mosquitto failure
```

The observed behavior was specific to the Frigate LPR publication/update path.

---

# 16. Why MQTT Was Not Removed

MQTT continues to work well for standard HomeAuto event communication.

Therefore the architecture was not changed to:

```text
Remove MQTT
```

Instead:

```text
Standard Frigate Events
        │
        └── MQTT

Selected LPR Metadata
        │
        └── HTTP API
```

This provides the most reliable interface for each use case.

---

# 17. Dual Integration Model

The resulting architecture is:

```text
                    Frigate
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
        MQTT                    HTTP API
          │                         │
          ▼                         ▼
 Standard Events          LPR / AI Metadata
          │                         │
          └────────────┬────────────┘
                       ▼
                Home Assistant
```

---

# 18. Home Assistant REST Bridge

The HomeLab design therefore introduces a REST sensor for LPR.

The intended flow is:

```text
Frigate Event Database
        │
        ▼
Frigate HTTP API
        │
        ▼
Home Assistant REST Sensor
        │
        ▼
sensor.last_license_plate
```

The entity can then be used like any other Home Assistant sensor.

---

# 19. Target Home Assistant Sensor

The target entity is:

```text
sensor.last_license_plate
```

Example state:

```text
TS07JF8179
```

Possible attributes:

```text
confidence
camera
event_id
```

This provides structured metadata for downstream automations.

---

# 20. Example REST Sensor Pattern

A Home Assistant REST sensor can follow a structure similar to:

```yaml
rest:

  - resource: >-
      http://frigate:5000/api/events?camera=usb_camera&limit=50

    scan_interval: 10

    sensor:

      - name: "Last License Plate"

        unique_id: frigate_last_license_plate

        value_template: >-
          {% set events = value_json
            | selectattr(
                'data.recognized_license_plate',
                'defined'
              )
            | selectattr(
                'data.recognized_license_plate',
                'ne',
                none
              )
            | list
          %}

          {% if events | length > 0 %}
            {{ events[0].data.recognized_license_plate }}
          {% else %}
            unknown
          {% endif %}
```

The final YAML should be validated against the exact JSON returned by the running Frigate instance.

---

# 21. Why the REST Sensor Must Be Tested Against Real JSON

Jinja templates depend on the actual payload shape.

Therefore first save a real event:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=5" \
  | jq
```

Then confirm whether the fields exist as:

```text
data.recognized_license_plate
```

or another path in the active Frigate version.

Do not assume the template without checking the live API response.

---

# 22. Home Assistant Network Reachability

Before configuring the REST sensor, verify that Home Assistant can reach Frigate.

Because both services are containerized, the preferred path should use the shared Docker networking configuration where available.

The logical path is:

```text
Home Assistant Container
       │
       ▼
smart_home_net
       │
       ▼
Frigate Container
```

---

# 23. Test Frigate Access from Home Assistant Container

A useful diagnostic approach is to test from the Home Assistant container.

For example:

```bash
docker exec homeassistant \
  wget -qO- \
  "http://frigate:5000/api/events?camera=usb_camera&limit=1"
```

If `wget` is unavailable inside the image, use another supported diagnostic method rather than modifying the container unnecessarily.

---

# 24. Restart Home Assistant Only

After editing Home Assistant configuration:

```bash
cd ~/docker
./dockerctl restart homeassistant homeassistant
```

Verify:

```bash
./dockerctl status homeassistant homeassistant
```

Logs:

```bash
./dockerctl logs homeassistant homeassistant
```

Frigate does not need to restart if only Home Assistant configuration changed.

---

# 25. Verify REST Sensor in Home Assistant

After Home Assistant restarts, open:

```text
Developer Tools
   │
   ▼
States
```

Search for:

```text
sensor.last_license_plate
```

The desired state after a recognized vehicle test is:

```text
TS07JF8179
```

---

# 26. Home Assistant Dashboard Integration

The LPR sensor can be displayed on the HomeAuto dashboard.

Conceptually:

```text
┌──────────────────────────────────┐
│ Last Recognized Vehicle          │
│                                  │
│ TS07JF8179                       │
│                                  │
│ Confidence: 98.9%                │
│ Camera: usb_camera               │
└──────────────────────────────────┘
```

This converts Frigate AI metadata into a simple Home Assistant entity.

---

# 27. Automation Possibilities

Once the REST sensor is stable:

```text
New Plate Recognized
        │
        ▼
Home Assistant
        │
        ├── Notification
        ├── Snapshot
        ├── Dashboard Update
        ├── Vehicle Log
        └── Alexa Announcement
```

These are downstream automations and should be validated separately from LPR itself.

---

# 28. Alexa Announcement Workflow

Because Alexa integration is already available in the Home Assistant environment, a future automation can follow:

```text
Plate Recognized
      │
      ▼
sensor.last_license_plate
      │
      ▼
Automation
      │
      ▼
Alexa
```

Example outcome:

```text
Known vehicle detected at the entrance.
```

---

# 29. Known Vehicle Mapping

A future Home Assistant mapping could translate plates into friendly vehicle identities.

Conceptually:

```text
TS07JF8179
      │
      ▼
Known Vehicle Mapping
      │
      ▼
Family Vehicle
```

This should be implemented in Home Assistant rather than modifying the raw Frigate-recognized plate value.

---

# 30. Why Raw Plate and Friendly Name Should Remain Separate

Maintain:

```text
Raw AI Result
      │
      ▼
TS07JF8179
```

separately from:

```text
Business / Automation Meaning
      │
      ▼
Known Vehicle
```

This preserves evidence and simplifies troubleshooting.

---

# 31. LPR Event Snapshot

The recognized plate event can also be associated with a Frigate event snapshot.

The path is:

```text
Plate Recognition
       │
       ▼
Frigate Event ID
       │
       ▼
Snapshot
       │
       ▼
Home Assistant Notification
```

This provides visual confirmation alongside the detected plate.

---

# 32. Preserve Event ID

The event ID is valuable because it connects:

```text
Plate
Camera
Timestamp
Snapshot
Recording
```

A robust REST sensor or automation should therefore preserve the Frigate event ID as an attribute where practical.

---

# 33. Suggested Sensor Attributes

The ideal entity model is:

```text
sensor.last_license_plate

state:
  TS07JF8179

attributes:
  confidence: 0.989
  camera: usb_camera
  event_id: <event-id>
```

Additional timestamps can also be retained if needed.

---

# 34. Avoid Excessive API Polling

A REST sensor polls the Frigate API.

The scan interval should not be unnecessarily aggressive.

For example:

```text
10–30 seconds
```

may be sufficient for a Lab dashboard depending on the automation requirement.

This should be balanced against:

- API load
- Desired notification speed
- Home Assistant polling frequency

---

# 35. Duplicate Plate Events

One vehicle may be observed more than once.

Therefore automation logic should consider duplicates.

Conceptually:

```text
Same Plate
   │
   ▼
New Sensor Update
   │
   ▼
Was Recently Announced?
   │
   ├── YES → Ignore
   │
   └── NO  → Notify
```

This avoids repeated Alexa announcements or notifications.

---

# 36. Confidence Threshold

Although the test result was approximately:

```text
0.98–0.99
```

future automation should still consider a minimum confidence threshold.

Conceptually:

```text
Plate Recognition
       │
       ▼
Confidence
       │
       ├── High Enough
       │      │
       │      ▼
       │   Automation
       │
       └── Too Low
              │
              ▼
           Ignore / Review
```

The final threshold should be determined from repeated real-world testing.

---

# 37. Camera Quality and LPR

Recognition quality depends heavily on the video source.

Relevant factors include:

- Plate size in frame
- Camera angle
- Vehicle speed
- Lighting
- Motion blur
- Resolution
- Compression
- Exposure

A software configuration cannot fully compensate for poor plate visibility.

---

# 38. Controlled LPR Test Procedure

Use a repeatable test sequence.

```text
01
Verify Frigate running

02
Verify camera live

03
Present visible plate

04
Wait for vehicle/event detection

05
Check Frigate UI

06
Check API

07
Confirm plate text

08
Confirm confidence

09
Check MQTT

10
Check HA REST sensor
```

---

# 39. Verify Frigate Status

Run:

```bash
cd ~/docker
./dockerctl status frigate frigate
```

Logs:

```bash
docker logs frigate --tail 100
```

---

# 40. Verify Latest LPR API Event

Run:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=20" \
  | jq
```

Find:

```text
recognized_license_plate
```

---

# 41. Search API Output for Plate Metadata

A quick diagnostic command:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=20" |
grep -o '"recognized_license_plate"[^,}]*'
```

For structured analysis, `jq` is preferred.

---

# 42. Troubleshooting — No Plate Recognized

First verify:

```text
Vehicle detected?
```

Then investigate:

- Plate visible
- Image sharpness
- Lighting
- Vehicle angle
- Recognition configuration
- Frigate logs
- Event metadata

Run:

```bash
docker logs frigate --tail 300 |
grep -Ei "plate|lpr|license|error|warning"
```

---

# 43. Troubleshooting — Event Exists but Plate Field Is Empty

If the event exists but:

```text
recognized_license_plate = null
```

then:

```text
Camera
      ✅

Vehicle Detection
      ✅

Event Creation
      ✅

LPR
      ❌
```

Focus on the LPR-processing layer rather than MQTT or Home Assistant.

---

# 44. Troubleshooting — API Has Plate but MQTT Does Not

If the API shows:

```text
TS07JF8179
```

but MQTT does not expose the expected metadata:

```text
LPR
   ✅

Frigate Database
   ✅

API
   ✅

MQTT Update
   ⚠
```

use the REST integration path for this Lab workflow.

Do not modify the Mosquitto broker simply because LPR metadata is absent from a specific Frigate MQTT topic.

---

# 45. Troubleshooting — MQTT Broker

The broker itself can be checked independently:

```bash
./dockerctl status mqtt mqtt
```

Logs:

```bash
docker logs mqtt --tail 50
```

Publish/subscribe:

```bash
mosquitto_pub
```

and:

```bash
mosquitto_sub
```

If normal MQTT messaging succeeds, the broker is healthy.

---

# 46. Troubleshooting — REST Sensor Unknown

If Home Assistant shows:

```text
unknown
```

check Frigate first:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=20" \
  | jq
```

Then investigate:

```text
API reachability
JSON field path
Jinja template
Home Assistant REST configuration
```

---

# 47. Troubleshooting — REST Sensor Does Not Update

Check Home Assistant logs:

```bash
docker logs homeassistant --tail 200 |
grep -Ei "rest|template|sensor|error|warning"
```

Verify the configured scan interval.

Then test the API directly again.

---

# 48. Troubleshooting — Home Assistant Cannot Reach Frigate

Check both containers:

```bash
docker ps \
  --filter "name=frigate"
```

```bash
docker ps \
  --filter "name=homeassistant"
```

Inspect network membership:

```bash
docker network inspect smart_home_net
```

Both services should be attached where the architecture requires direct container-to-container access.

---

# 49. Restart Frigate After LPR Configuration Changes

If LPR configuration changes:

```bash
cd ~/docker
./dockerctl restart frigate frigate
```

Then:

```bash
./dockerctl logs frigate frigate
```

Do not restart Home Assistant unless its configuration also changed.

---

# 50. Restart Home Assistant After REST Changes

If only the REST sensor changes:

```bash
cd ~/docker
./dockerctl restart homeassistant homeassistant
```

Verify:

```bash
./dockerctl status homeassistant homeassistant
```

This preserves service isolation.

---

# 51. Resource Monitoring During LPR

Run:

```bash
docker stats frigate
```

This allows LPR to be evaluated as part of the overall CPU-based AI workload.

The current phase includes:

```text
Object Detection
Face Recognition
LPR
```

before hardware acceleration is introduced.

---

# 52. Hardware Acceleration Roadmap

Once the complete AI workflow is functionally validated:

```text
Current
   │
   ▼
CPU-Based Validation
   │
   ├── Object Detection
   ├── Face Recognition
   └── LPR
   │
   ▼
Hardware Acceleration
```

Future evaluation includes:

```text
Coral TPU
GPU acceleration
Intel Quick Sync
```

The purpose is performance optimization rather than correcting functional AI behavior.

---

# 53. LPR Security and Privacy

License plates are identifying data.

Production implementations should consider:

- Data retention
- Access control
- Event retention
- Snapshot retention
- Dashboard permissions
- Notification content
- Public repository exposure

Real plate history should not be published unnecessarily.

---

# 54. Current Validation Status

| Component | Status |
|---|---|
| Camera Pipeline | ✅ Validated |
| Vehicle / Object Detection | ✅ Validated |
| Frigate LPR | ✅ Validated |
| Test Plate Recognition | ✅ `TS07JF8179` |
| Recognition Confidence | ✅ ~0.98–0.99 |
| Event Database | ✅ Verified |
| HTTP API | ✅ Verified |
| MQTT Broker | ✅ Healthy |
| LPR MQTT Metadata Path | ⚠ Inconsistent in Lab |
| REST Integration Design | ✅ Established |
| HA REST Sensor | 🟡 Under Validation |
| Dashboard Display | ⏳ Next phase |
| Alexa Announcement | ⏳ Future |
| Known Vehicle Mapping | ⏳ Future |

---

# 55. Why LPR Is Marked Differently from Face Recognition

Face Recognition is still being validated at the recognition layer itself.

LPR has already passed:

```text
Recognition
   ✅

Event Storage
   ✅

API Retrieval
   ✅
```

The remaining work is primarily:

```text
Home Assistant Integration
Automation
Dashboard
```

Therefore LPR itself is considered functionally validated even though the complete Home Assistant workflow is still being refined.

---

# 56. Verification Workflow

Use:

```text
01
Verify Camera

02
Verify Vehicle Detection

03
Present Plate

04
Verify Frigate Event

05
Verify recognized_license_plate

06
Verify confidence

07
Check MQTT Topics

08
Check REST Sensor

09
Check Dashboard

10
Check Automation
```

---

# 57. Verification Commands

## Frigate state

```bash
./dockerctl status frigate frigate
```

## Frigate logs

```bash
docker logs frigate --tail 200
```

## Recent events

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=20" \
  | jq
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

# 58. LPR Verification Checklist

| Verification | Method | Expected Result |
|---|---|---|
| Camera | Frigate UI | Video visible |
| Vehicle/object | Frigate | Detected |
| Frigate event | `/api/events` | Event created |
| Plate metadata | API | Plate present |
| Test plate | API | `TS07JF8179` |
| Confidence | API | ~0.98–0.99 |
| MQTT broker | dockerctl | Healthy |
| `frigate/events` | MQTT | Standard event traffic |
| `tracked_object_update` | MQTT | Validate current behavior |
| REST source | Frigate API | Reliable |
| HA connectivity | Network/API | Reachable |
| REST sensor | Home Assistant | Plate state |
| Isolated Frigate restart | dockerctl | Frigate only |
| Isolated HA restart | dockerctl | HA only |

---

# 59. Target End State

The intended LPR architecture is:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
Vehicle / LPR
   │
   ▼
Recognized Plate
   │
   ▼
Frigate Event Database
   │
   ├─────────────────┐
   │                 │
   ▼                 ▼
MQTT              HTTP API
   │                 │
   │                 ▼
   │          HA REST Sensor
   │                 │
   └──────────┬──────┘
              ▼
       Home Assistant
              │
              ├── Dashboard
              ├── Notification
              ├── Snapshot
              ├── Vehicle Mapping
              └── Alexa
```

---

# 60. Engineering Outcome

The LPR test established one of the most important HomeAuto integration principles:

> **A working AI result and a working transport path are separate things.**

The recognition pipeline succeeded:

```text
Camera
   │
   ▼
Frigate
   │
   ▼
LPR
   │
   ▼
TS07JF8179
      ✅
```

The event database and API succeeded:

```text
Frigate Event Database
        ✅

HTTP API
        ✅
```

The MQTT LPR update path was inconsistent during this Frigate 0.17.2 test.

Instead of treating that as failure of the entire design, HomeAuto introduced an alternate API-based integration path.

This produces a more resilient architecture:

```text
Use MQTT where MQTT is reliable.
Use the API where the API is the authoritative source.
```

---

# 61. Next Implementation Stage

With the AI pipeline documented, the next major implementation section is:

```text
Home Assistant
```

That runbook should consolidate:

- Home Assistant container deployment
- Persistent configuration
- Initial access
- MQTT integration
- Frigate integration
- HACS
- HomeAuto dashboard
- Advanced Camera Card
- Last Recognized Face sensor
- REST-based LPR sensor
- Automations
- Weather tracking
- Aircraft monitoring
- Alexa integration
- CAFE
- Service restart and validation
- End-to-end Frigate → HA workflows