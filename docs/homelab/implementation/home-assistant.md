---
title: Home Assistant Implementation
sidebar_label: Home Assistant
description: Home Assistant deployment, persistent configuration, MQTT and Frigate integration, HACS, dashboards, Advanced Camera Card, REST-based LPR, Alexa, weather, aircraft monitoring, CAFE, troubleshooting, and end-to-end validation for the Makani HomeAuto HomeLab.
---

# Home Assistant Implementation

**Home Assistant** provides the automation, visualization, integration, and user-interaction layer of the **Makani HomeAuto HomeLab**.

While Frigate performs video AI processing and Mosquitto provides event-driven messaging, Home Assistant converts those services into usable smart-home workflows.

The overall architecture is:

```text
Cameras
   │
   ▼
Frigate
   │
   ├── MQTT
   ├── HTTP API
   └── Camera Streams
          │
          ▼
     Home Assistant
          │
          ├── Dashboard
          ├── Automations
          ├── Notifications
          ├── Alexa
          ├── Weather
          ├── Aircraft Monitoring
          └── Camera Views
```

Home Assistant therefore acts as the primary **control and presentation layer** of the HomeAuto platform.

---

# 1. Purpose

Home Assistant was introduced to provide:

- Smart-home orchestration
- Dashboard visualization
- Frigate integration
- MQTT event consumption
- REST/API integration
- Camera viewing
- Automations
- Notifications
- Alexa integration
- Weather information
- Aircraft monitoring
- Community integrations through HACS

The role of Home Assistant is:

```text
AI / Infrastructure Events
          │
          ▼
     Home Assistant
          │
          ▼
     Useful Action
```

---

# 2. Current Deployment Model

Home Assistant is deployed using Docker Compose.

The stack file is:

```text
/home/teju/docker/stacks/homeassistant.yml
```

The service/container is:

```text
homeassistant
```

Home Assistant is managed independently from Frigate, MQTT, Portainer, and Dozzle.

---

# 3. Verify Home Assistant Stack

Enter the Docker workspace:

```bash
cd ~/docker
```

List stacks:

```bash
./dockerctl stacks
```

Expected:

```text
homeassistant
```

Verify services:

```bash
./dockerctl services homeassistant
```

Expected:

```text
homeassistant
```

---

# 4. Inspect Home Assistant Compose File

Display the active configuration:

```bash
cat ~/docker/stacks/homeassistant.yml
```

Validate the Compose definition:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/homeassistant.yml \
  config
```

If valid, Docker Compose prints the normalized configuration.

---

# 5. Persistent Configuration

Home Assistant configuration is stored outside the disposable container.

The current configuration path is:

```text
/home/teju/docker/homeassistant/config/
```

Important files include:

```text
configuration.yaml
automations.yaml
scripts.yaml
scenes.yaml
secrets.yaml
```

The exact files present depend on the active Home Assistant setup.

---

# 6. Verify Configuration Directory

Run:

```bash
ls -lah ~/docker/homeassistant/config
```

This directory should persist across container recreation.

The operating principle is:

```text
Container
   │
   │ disposable
   ▼

Configuration
   │
   │ persistent
   ▼
Host Filesystem
```

---

# 7. Start Home Assistant

Preferred method:

```bash
cd ~/docker
./dockerctl up homeassistant homeassistant
```

Or start the full stack:

```bash
./dockerctl up homeassistant
```

Direct Compose equivalent:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/homeassistant.yml \
  up -d
```

---

# 8. Verify Container State

Run:

```bash
docker ps --filter "name=homeassistant"
```

Readable view:

```bash
docker ps \
  --filter "name=homeassistant" \
  --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

Home Assistant should report a running state.

---

# 9. Verify Through dockerctl

Run:

```bash
./dockerctl status homeassistant homeassistant
```

For the stack:

```bash
./dockerctl status homeassistant
```

---

# 10. Verify Home Assistant Logs

Run:

```bash
docker logs homeassistant --tail 100
```

or:

```bash
./dockerctl logs homeassistant homeassistant
```

Follow:

```bash
docker logs -f homeassistant
```

Exit with:

```text
Ctrl+C
```

---

# 11. Access Home Assistant

Open Home Assistant using the Ubuntu VM address and the published Home Assistant port.

Typical access pattern:

```text
http://<UBUNTU_VM_IP>:8123
```

The exact published port should be verified from the active Compose file.

---

# 12. Verify Port 8123

On Ubuntu:

```bash
sudo ss -lnt | grep 8123
```

From Windows:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 8123
```

Expected:

```text
TcpTestSucceeded : True
```

---

# 13. Initial Home Assistant Setup

On first access, complete:

- Administrator account creation
- Home name
- Location
- Time zone
- Unit system
- Basic onboarding

The administrator account should use a strong password.

---

# 14. Home Assistant Architecture

The application acts as the integration hub:

```text
                   Home Assistant
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
      MQTT             Frigate          REST API
        │                │                │
        ▼                ▼                ▼
     Events           Cameras          AI Metadata
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                    Automations
```

---

# 15. MQTT Integration

Home Assistant connects to the Mosquitto broker.

The architecture is:

```text
Frigate
   │
   ▼
Mosquitto
   │
   ▼
Home Assistant MQTT Integration
```

MQTT is used for standard event-driven communication.

---

# 16. Verify MQTT Broker First

Before troubleshooting Home Assistant MQTT behavior:

```bash
cd ~/docker
./dockerctl status mqtt mqtt
```

Logs:

```bash
docker logs mqtt --tail 50
```

If MQTT is not healthy, resolve the broker before changing Home Assistant.

---

# 17. Home Assistant MQTT Configuration

The Home Assistant configuration contains an MQTT section.

The current configuration can be inspected using:

```bash
grep -n -A100 "^mqtt:" \
  ~/docker/homeassistant/config/configuration.yaml
```

This is useful for validating indentation and sensor placement.

---

# 18. Frigate Last Recognized Face Sensor

A custom MQTT sensor was created to expose Frigate face metadata.

The sensor uses:

```text
frigate/events
```

as the MQTT topic.

The implementation follows:

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

This converts Frigate `sub_label` metadata into a Home Assistant entity.

---

# 19. Validate YAML Placement

Run:

```bash
grep -n -A100 "^mqtt:" \
  ~/docker/homeassistant/config/configuration.yaml
```

Confirm that:

```text
mqtt:
  sensor:
```

is correctly indented.

YAML indentation errors can prevent entities from loading.

---

# 20. Restart Home Assistant After MQTT Changes

Restart only Home Assistant:

```bash
cd ~/docker
./dockerctl restart homeassistant homeassistant
```

Verify:

```bash
./dockerctl status homeassistant homeassistant
```

Then:

```bash
./dockerctl logs homeassistant homeassistant
```

The HomeLab sensors were confirmed visible after the Home Assistant restart.

---

# 21. Verify MQTT Sensor

Inside Home Assistant:

```text
Developer Tools
   │
   ▼
States
```

Search for the sensor corresponding to:

```text
Frigate Last Recognized Face
```

The entity should be visible after successful configuration loading.

---

# 22. Frigate Integration

Frigate is integrated into Home Assistant to expose surveillance information.

The architecture is:

```text
Frigate
   │
   ├── Camera Streams
   ├── Events
   └── Metadata
          │
          ▼
     Home Assistant
```

This allows camera and AI information to become part of the HomeAuto dashboard.

---

# 23. Frigate Does the AI Processing

Home Assistant does not perform the primary AI detection.

The division of responsibility is:

```text
Frigate
   │
   └── Detection / Recognition

Home Assistant
   │
   └── Visualization / Automation
```

The correct flow is:

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

---

# 24. HACS

The **Home Assistant Community Store (HACS)** has been installed.

HACS provides access to:

- Community integrations
- Frontend cards
- Dashboard components
- Themes
- Custom extensions

This allows HomeAuto to extend beyond the default Home Assistant feature set.

---

# 25. HACS Role in HomeAuto

The architecture is:

```text
Home Assistant
      │
      ▼
     HACS
      │
      ├── Integrations
      ├── Cards
      └── Frontend Extensions
```

HACS is particularly important for advanced dashboard functionality.

---

# 26. HomeAuto Dashboard

A dedicated Home Assistant dashboard has been created.

The dashboard provides a centralized user interface for:

- Cameras
- Surveillance
- AI events
- Smart-home entities
- Weather
- Aircraft monitoring
- HomeAuto integrations

The dashboard should remain a presentation layer rather than a substitute for backend verification.

---

# 27. Dashboard Architecture

The user-facing flow is:

```text
Services
   │
   ▼
Home Assistant Entities
   │
   ▼
HomeAuto Dashboard
```

This allows backend services to remain independent from the dashboard layout.

---

# 28. Advanced Camera Card

The **Advanced Camera Card** has been installed through the Home Assistant ecosystem.

It is used to improve:

- Camera display
- Stream presentation
- Dashboard usability
- Stream selection
- Perceived latency

The viewing path is:

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

# 29. Why Advanced Camera Card Was Introduced

The earlier camera-viewing approach produced more latency than desired.

The Advanced Camera Card was introduced to improve the Home Assistant surveillance experience.

The objective is:

```text
Frigate Live Stream
       │
       ▼
Lower-Latency HA View
```

rather than routing camera AI processing through Home Assistant.

---

# 30. Weather Tracking

Weather information has been integrated into Home Assistant.

The architecture is:

```text
Weather Source
      │
      ▼
Home Assistant
      │
      ├── Dashboard
      └── Automation
```

Potential future automations include:

- Weather-based lighting
- Outdoor alerts
- Rain notifications
- HVAC decisions
- Environmental dashboards

---

# 31. Aircraft Monitoring

Aircraft monitoring has also been integrated into the Home Assistant environment.

This demonstrates that HomeAuto can integrate external real-time data beyond traditional smart-home devices.

The logical path is:

```text
Aircraft Data Source
        │
        ▼
Home Assistant
        │
        ▼
Dashboard / Tracking
```

This is currently treated as an experimental HomeLab integration.

---

# 32. Alexa Integration

Alexa integration has been completed.

Alexa provides another interaction and notification channel.

The architecture is:

```text
Home Assistant
      │
      ▼
Automation
      │
      ▼
Alexa
```

This can support announcements triggered by HomeAuto events.

---

# 33. Example Alexa Surveillance Workflow

Conceptually:

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

Potential use cases include:

- Person detected
- Known person recognized
- Known vehicle detected
- Plate recognized
- Security event

---

# 34. CAFE

CAFE has been installed in the Home Assistant environment.

It is documented as an additional HomeAuto integration/module currently present in the Lab.

Because its exact functional role may evolve, the implementation page should record the active configuration when further validation is completed.

Current status:

```text
Installed
```

---

# 35. REST-Based LPR Integration

LPR introduced a second Frigate-to-Home-Assistant integration path.

The standard path remains:

```text
Frigate
   │
   ▼
MQTT
   │
   ▼
Home Assistant
```

For LPR metadata, the HomeLab uses:

```text
Frigate Event Database
        │
        ▼
Frigate HTTP API
        │
        ▼
Home Assistant REST Sensor
```

This avoids depending entirely on the inconsistent Frigate 0.17.2 MQTT LPR update path observed during testing.

---

# 36. Frigate API Verification

Before configuring Home Assistant:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=20" \
  | jq
```

Verify:

```text
recognized_license_plate
recognized_license_plate_score
```

---

# 37. Validated LPR Result

The HomeLab successfully recognized:

```text
TS07JF8179
```

with confidence around:

```text
0.98 – 0.99
```

This provides the source data for the Home Assistant REST integration.

---

# 38. Target LPR Entity

The intended Home Assistant entity is:

```text
sensor.last_license_plate
```

Example:

```text
state:
TS07JF8179
```

Possible attributes:

```text
confidence
camera
event_id
```

---

# 39. Example REST Sensor Pattern

A REST-based sensor can follow:

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

The exact template should be validated against the live Frigate JSON before final use.

---

# 40. Why Live JSON Must Be Verified

Before relying on a Jinja template:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=5" \
  | jq
```

Confirm the actual field path.

This avoids building Home Assistant logic against assumptions.

---

# 41. Home Assistant → Frigate Reachability

The REST architecture requires Home Assistant to reach Frigate.

The desired internal path is:

```text
Home Assistant
       │
       ▼
smart_home_net
       │
       ▼
Frigate
```

Verify Docker network membership:

```bash
docker network inspect smart_home_net
```

---

# 42. Test Frigate API from Home Assistant Context

Where supported:

```bash
docker exec homeassistant \
  wget -qO- \
  "http://frigate:5000/api/events?camera=usb_camera&limit=1"
```

If the Home Assistant image lacks the required utility, use another diagnostic method rather than modifying the container unnecessarily.

---

# 43. Restart After REST Configuration Changes

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

---

# 44. Verify LPR Sensor

Inside Home Assistant:

```text
Developer Tools
   │
   ▼
States
```

Search:

```text
sensor.last_license_plate
```

Expected after a valid LPR test:

```text
TS07JF8179
```

---

# 45. LPR Automation Architecture

Once the sensor is stable:

```text
New Plate
   │
   ▼
REST Sensor State Change
   │
   ▼
Home Assistant Automation
   │
   ├── Dashboard
   ├── Notification
   ├── Snapshot
   └── Alexa
```

---

# 46. Known Vehicle Mapping

Raw recognized plates should remain separate from friendly names.

For example:

```text
Raw:
TS07JF8179
```

can later map to:

```text
Known Vehicle
```

inside Home Assistant automation logic.

This preserves the original AI result.

---

# 47. Duplicate Event Handling

REST polling may observe the same LPR event more than once.

Automations should therefore consider:

- Event ID
- Timestamp
- Last processed plate
- Cooldown window

The conceptual logic is:

```text
Plate Received
      │
      ▼
Already Processed?
      │
      ├── YES → Ignore
      └── NO  → Automate
```

---

# 48. Notification Architecture

Home Assistant can turn AI metadata into actionable notifications.

Example:

```text
Frigate
   │
   ▼
LPR
   │
   ▼
Home Assistant
   │
   ▼
Notification
```

The notification can later include:

- Plate
- Camera
- Confidence
- Snapshot
- Timestamp

---

# 49. Snapshot Integration

The Frigate event ID can be used to correlate the recognized plate with a snapshot.

The logical path is:

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

This provides visual confirmation.

---

# 50. Home Assistant Automations

Home Assistant automations can be implemented through:

- UI automation editor
- YAML
- Blueprints
- Scripts

The correct method depends on complexity and maintainability.

Important automations should be documented separately rather than hidden only inside the UI.

---

# 51. Automation Design Principle

HomeAuto automations should separate:

```text
Trigger
Condition
Action
```

For example:

```text
Trigger
New Plate

Condition
Confidence above threshold

Action
Send notification
```

This makes troubleshooting easier.

---

# 52. Home Assistant Configuration Verification

After editing YAML, inspect the relevant portion.

For MQTT:

```bash
grep -n -A100 "^mqtt:" \
  ~/docker/homeassistant/config/configuration.yaml
```

For REST:

```bash
grep -n -A100 "^rest:" \
  ~/docker/homeassistant/config/configuration.yaml
```

This helps identify indentation and duplicate-key issues.

---

# 53. Configuration Backup

Before major Home Assistant changes:

```bash
cp \
  ~/docker/homeassistant/config/configuration.yaml \
  ~/docker/homeassistant/config/configuration.yaml.backup-$(date +%Y%m%d-%H%M%S)
```

Verify:

```bash
ls -lh \
  ~/docker/homeassistant/config/configuration.yaml*
```

---

# 54. Restart Home Assistant Only

The preferred command is:

```bash
./dockerctl restart homeassistant homeassistant
```

This leaves:

```text
Frigate
MQTT
Portainer
Dozzle
WebSSH
```

untouched.

---

# 55. Stop Home Assistant Only

Run:

```bash
./dockerctl stop homeassistant homeassistant
```

Verify:

```bash
./dockerctl status homeassistant homeassistant
```

Other HomeAuto services continue operating.

---

# 56. Start Home Assistant Again

Run:

```bash
./dockerctl up homeassistant homeassistant
```

Then:

```bash
./dockerctl status homeassistant homeassistant
```

---

# 57. Direct Docker Fallback

If `dockerctl` cannot be used:

```bash
docker restart homeassistant
```

Logs:

```bash
docker logs homeassistant --tail 100
```

This remains the recovery path.

---

# 58. Troubleshooting — Home Assistant Not Starting

Check:

```bash
docker ps -a \
  --filter "name=homeassistant"
```

Logs:

```bash
docker logs homeassistant --tail 200
```

Common causes include:

- YAML syntax
- Duplicate configuration keys
- Invalid integration configuration
- Permission issues
- Volume mapping
- Port conflict

---

# 59. Troubleshooting — YAML Errors

Inspect recent logs:

```bash
docker logs homeassistant --tail 300 |
grep -Ei "yaml|config|error|invalid"
```

Check indentation manually.

YAML structure is whitespace-sensitive.

---

# 60. Troubleshooting — MQTT Sensor Missing

First verify MQTT itself:

```bash
./dockerctl status mqtt mqtt
```

Then inspect configuration:

```bash
grep -n -A100 "^mqtt:" \
  ~/docker/homeassistant/config/configuration.yaml
```

Restart Home Assistant:

```bash
./dockerctl restart homeassistant homeassistant
```

Then check:

```text
Developer Tools → States
```

---

# 61. Troubleshooting — Face Sensor Does Not Update

Check raw MQTT:

```bash
mosquitto_sub \
  -h <MQTT_BROKER> \
  -p 1883 \
  -u <MQTT_USER> \
  -P '<MQTT_PASSWORD>' \
  -t 'frigate/events' \
  -v
```

Verify:

```text
after.label
after.sub_label
```

If MQTT contains the identity, the issue is downstream in Home Assistant.

---

# 62. Troubleshooting — LPR REST Sensor Unknown

First:

```bash
curl -s \
  "http://127.0.0.1:5000/api/events?camera=usb_camera&limit=20" \
  | jq
```

If the plate exists there, inspect:

- REST resource URL
- JSON field path
- Jinja template
- Container connectivity
- Home Assistant logs

---

# 63. Troubleshooting — Frigate Camera Missing in HA

If the Frigate UI shows the camera but Home Assistant does not:

```text
Frigate
   ✅

Home Assistant
   ❌
```

investigate:

- Frigate integration
- Camera entity
- go2rtc
- Advanced Camera Card
- Browser

Do not change the physical camera unless Frigate itself also has a problem.

---

# 64. Troubleshooting — Camera Latency

Compare:

```text
Frigate Live View
```

with:

```text
Home Assistant Camera View
```

If Frigate is responsive but Home Assistant is delayed, investigate the HA viewing path rather than the camera.

The Advanced Camera Card was introduced specifically to improve this experience.

---

# 65. Troubleshooting — Alexa Automation

Separate the layers:

```text
Sensor Updated?
      │
      ├── NO
      │    └── Integration problem
      │
      └── YES
            │
            ▼
      Automation Triggered?
            │
            ├── NO
            │    └── Automation logic
            │
            └── YES
                  │
                  ▼
             Alexa Action?
                  │
                  └── Alexa integration
```

This avoids troubleshooting Alexa when the trigger never occurred.

---

# 66. Resource Usage

Check Home Assistant:

```bash
docker stats homeassistant
```

The HomeLab VM resources are shared between:

```text
Home Assistant
Frigate
MQTT
Portainer
Dozzle
WebSSH
```

Frigate generally remains the heavier AI workload.

---

# 67. Home Assistant Backup Priority

Important assets include:

```text
configuration.yaml
automations.yaml
scripts.yaml
scenes.yaml
secrets.yaml
.storage/
HACS configuration
Custom components
Dashboard configuration
```

The running container is replaceable.

The persistent configuration is not.

---

# 68. Secrets

Sensitive values should not be committed to Git.

Examples:

- Passwords
- Tokens
- Alexa credentials
- API keys
- MQTT credentials
- Camera credentials

Use:

```text
secrets.yaml
```

or another protected secrets mechanism where supported.

---

# 69. Home Assistant Operational Workflow

The preferred workflow after configuration changes is:

```text
Edit Configuration
      │
      ▼
Review YAML
      │
      ▼
Restart HA Only
      │
      ▼
Check Logs
      │
      ▼
Verify Entity
      │
      ▼
Verify Automation
```

Commands:

```bash
./dockerctl restart homeassistant homeassistant
```

```bash
./dockerctl logs homeassistant homeassistant
```

---

# 70. End-to-End AI Integration

The current HomeAuto AI architecture is:

```text
Camera
   │
   ▼
Frigate
   │
   ├── Object Detection
   ├── Face Recognition
   └── LPR
          │
          ├───────────────┐
          │               │
          ▼               ▼
        MQTT           HTTP API
          │               │
          ▼               ▼
     Mosquitto       REST Sensor
          │               │
          └───────┬───────┘
                  ▼
           Home Assistant
                  │
         ┌────────┼────────┐
         ▼        ▼        ▼
     Dashboard  Alexa   Notification
```

---

# 71. Current Implementation Status

| Component | Status |
|---|---|
| Home Assistant | ✅ Installed |
| Persistent Configuration | ✅ Implemented |
| MQTT Integration | ✅ Implemented |
| Frigate Integration | ✅ Implemented |
| HACS | ✅ Installed |
| HomeAuto Dashboard | ✅ Created |
| Advanced Camera Card | ✅ Installed |
| Weather Tracking | ✅ Implemented |
| Aircraft Monitoring | ✅ Implemented |
| Alexa Integration | ✅ Implemented |
| CAFE | ✅ Installed |
| Frigate Face MQTT Sensor | ✅ Visible |
| Face Recognition | 🟡 Under Validation |
| Frigate API | ✅ Verified |
| LPR API | ✅ Verified |
| LPR REST Bridge | 🟡 Under Validation |
| LPR Dashboard Automation | ⏳ Next phase |
| Alexa AI Announcements | ⏳ Future |

---

# 72. Verification Checklist

| Verification | Method | Expected Result |
|---|---|---|
| Stack exists | `./dockerctl stacks` | `homeassistant` |
| Service exists | `./dockerctl services homeassistant` | Service visible |
| Compose | `docker compose ... config` | Valid |
| Container | `docker ps` | Running |
| HA status | `./dockerctl status homeassistant homeassistant` | Running |
| Port 8123 | `ss -lnt \| grep 8123` | Listener |
| Browser | HA UI | Accessible |
| MQTT broker | dockerctl | Running |
| MQTT sensor | HA States | Visible |
| Frigate integration | HA | Available |
| HACS | HA | Installed |
| Dashboard | HA | Available |
| Camera Card | HA | Operational |
| Weather | HA | Available |
| Aircraft monitoring | HA | Available |
| Alexa | HA | Connected |
| LPR API | curl | Plate metadata |
| REST sensor | HA | Under validation |
| Isolated restart | dockerctl | HA only restarted |

---

# 73. Final Validated State

The Home Assistant layer currently operates as:

```text
Home Assistant
      │
      ├── MQTT
      │      │
      │      ▼
      │   Frigate Events
      │
      ├── Frigate Integration
      │
      ├── REST API
      │      │
      │      ▼
      │   LPR Metadata
      │
      ├── HACS
      ├── Advanced Camera Card
      ├── Weather
      ├── Aircraft Monitoring
      ├── Alexa
      └── CAFE
             │
             ▼
        HomeAuto Dashboard
```

Home Assistant is considered functionally validated when:

- The container starts successfully
- The UI is reachable
- Persistent configuration survives restarts
- MQTT is connected
- Frigate entities are available
- Custom MQTT sensors load
- HACS functions
- Advanced Camera Card displays camera streams
- Weather data is visible
- Aircraft monitoring is available
- Alexa integration works
- Frigate AI metadata can be consumed
- Home Assistant can be restarted independently

---

# 74. Engineering Outcome

Home Assistant completes the HomeAuto application chain:

```text
Infrastructure
      │
      ▼
Docker
      │
      ▼
MQTT / Frigate
      │
      ▼
AI Metadata
      │
      ▼
Home Assistant
      │
      ▼
Human-Useful Automation
```

The key architectural principle is:

> **Frigate detects. MQTT transports. APIs expose. Home Assistant automates.**

This keeps each platform responsible for the layer it is best suited to handle.

---

# 75. HomeLab Implementation Complete

The HomeLab implementation chain is now documented as:

```text
Windows Host
     │
     ▼
Ubuntu VM
     │
     ▼
Docker
     │
     ▼
Service Management
     │
     ├── Portainer
     ├── Dozzle
     │
     ▼
Mosquitto MQTT
     │
     ▼
Frigate AI
     │
     ├── Cameras
     ├── Object Detection
     ├── Face Recognition
     └── LPR
     │
     ▼
Home Assistant
```

The next HomeLab documentation section should therefore move to:

```text
04 · Challenges Faced
```

where the major real-world problems from the build can be consolidated, including:

- Empty Compose file
- Compose v1/v2 confusion
- Portainer setup timeout
- MQTT password creation failure
- Mosquitto permissions / exit code 13
- MQTT log and password-file access
- Frigate LPR MQTT inconsistency
- Face-recognition validation gaps
- Camera/stream latency
- YAML configuration issues
- Service-isolation requirements
- Mobile/light-theme documentation issues