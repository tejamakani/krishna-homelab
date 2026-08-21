---
title: Mosquitto MQTT Implementation
sidebar_label: Mosquitto MQTT
description: Mosquitto MQTT deployment, authentication, persistent storage, permissions, ports, Docker networking, troubleshooting, verification, and integration for the Makani HomeAuto HomeLab.
---

# Mosquitto MQTT Implementation

**Mosquitto MQTT** provides the event-driven messaging layer for the Makani HomeAuto HomeLab.

It enables lightweight communication between:

- Frigate
- Home Assistant
- MQTT Explorer
- Future IoT devices
- Future automation services

The basic architecture is:

```text
Publishers
    │
    ▼
Mosquitto MQTT Broker
    │
    ▼
Subscribers
```

Within HomeAuto:

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

MQTT remains the preferred asynchronous event bus for standard HomeAuto events.

---

# 1. Purpose

Mosquitto was introduced to provide:

- Lightweight event messaging
- Frigate event publication
- Home Assistant event consumption
- IoT messaging
- Publish/subscribe communication
- Loose coupling between services
- Future Zigbee2MQTT support
- Future automation integrations

MQTT allows producers and consumers to remain independent.

```text
Producer
   │
   │ publish
   ▼
Broker
   │
   │ subscribe
   ▼
Consumer
```

The publisher does not need direct knowledge of the subscriber.

---

# 2. Current MQTT Deployment

The MQTT service is defined in:

```text
/home/teju/docker/stacks/mqtt.yml
```

Current container name:

```text
mqtt
```

Current image:

```text
eclipse-mosquitto:2
```

Docker network:

```text
smart_home_net
```

Published interfaces:

| Interface | Port |
|---|---:|
| MQTT TCP | 1883 |
| MQTT WebSocket | 9001 |

---

# 3. MQTT Stack Architecture

The current architecture is:

```text
Ubuntu Server
     │
     ▼
Docker Engine
     │
     ▼
mqtt.yml
     │
     ▼
Mosquitto Container
     │
     ├── TCP 1883
     ├── WebSocket 9001
     │
     ├── config
     ├── data
     └── log
```

The broker is isolated from other services while still communicating through the shared Docker network.

---

# 4. Verify MQTT Stack

Enter the HomeAuto Docker workspace:

```bash
cd ~/docker
```

Verify that the stack exists:

```bash
./dockerctl stacks
```

Expected:

```text
mqtt
```

Verify the service:

```bash
./dockerctl services mqtt
```

Expected:

```text
mqtt
```

---

# 5. Current Compose Configuration

The MQTT Compose file follows this structure:

```yaml
services:

  mqtt:
    container_name: mqtt

    image: eclipse-mosquitto:2

    restart: unless-stopped

    ports:
      - "${MQTT_PORT}:1883"
      - "${MQTT_WEBSOCKET_PORT}:9001"

    volumes:
      - ../mosquitto/config:/mosquitto/config
      - ../mosquitto/data:/mosquitto/data
      - ../mosquitto/log:/mosquitto/log

    networks:
      - smart_home_net

networks:

  smart_home_net:
    external: true
```

The active Compose file remains the authoritative configuration source.

---

# 6. Validate Compose Configuration

Before starting MQTT:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/mqtt.yml \
  config
```

If the configuration is valid, Docker Compose prints the rendered configuration.

This catches issues such as:

- Invalid YAML
- Missing environment variables
- Missing network references
- Invalid volume mappings

---

# 7. Environment Variables

The MQTT Compose file uses environment variables for the published ports.

Typical values include:

```text
MQTT_PORT=1883
MQTT_WEBSOCKET_PORT=9001
```

Inspect:

```bash
cat ~/docker/.env
```

Do not publish credentials or secrets stored inside this file.

Verify permissions:

```bash
ls -l ~/docker/.env
```

Recommended:

```bash
chmod 600 ~/docker/.env
```

---

# 8. Persistent MQTT Directories

Mosquitto persistent directories are stored under:

```text
/home/teju/docker/mosquitto
```

Required directories:

```text
config
data
log
```

Create them if required:

```bash
mkdir -p ~/docker/mosquitto/config
mkdir -p ~/docker/mosquitto/data
mkdir -p ~/docker/mosquitto/log
```

Verify:

```bash
tree ~/docker/mosquitto
```

or:

```bash
find ~/docker/mosquitto -maxdepth 2 -type d
```

---

# 9. Directory Architecture

The MQTT filesystem layout is:

```text
~/docker/mosquitto/
│
├── config/
│   ├── mosquitto.conf
│   └── passwordfile
│
├── data/
│
└── log/
```

The container mappings are:

```text
Host                               Container

~/docker/mosquitto/config   →      /mosquitto/config
~/docker/mosquitto/data     →      /mosquitto/data
~/docker/mosquitto/log      →      /mosquitto/log
```

This ensures that broker state survives container recreation.

---

# 10. Why Persistent Storage Is Required

Without persistent storage:

```text
Remove MQTT Container
       │
       ▼
Configuration Lost
Persistence Lost
Logs Lost
```

With bind-mounted storage:

```text
Recreate MQTT Container
       │
       ▼
Host Data Remains
       │
       ▼
Broker Returns with Configuration
```

The container itself remains disposable.

---

# 11. Mosquitto Configuration

The broker configuration is stored at:

```text
~/docker/mosquitto/config/mosquitto.conf
```

Edit:

```bash
nano ~/docker/mosquitto/config/mosquitto.conf
```

A HomeLab configuration may include:

```conf
persistence true
persistence_location /mosquitto/data/

log_dest file /mosquitto/log/mosquitto.log

allow_anonymous false
password_file /mosquitto/config/passwordfile

listener 1883
protocol mqtt

listener 9001
protocol websockets
```

The current deployed file should remain the authoritative source.

---

# 12. MQTT Authentication

Anonymous access is disabled.

Authentication is provided through:

```text
/mosquitto/config/passwordfile
```

Mosquitto uses the password file to authenticate MQTT clients.

The intended architecture is:

```text
Client
   │
   ├── Username
   └── Password
        │
        ▼
Mosquitto
        │
        ▼
Authenticated Session
```

---

# 13. Password File Creation

The password file can be generated using `mosquitto_passwd`.

If Mosquitto tools are available locally:

```bash
mosquitto_passwd -c \
  ~/docker/mosquitto/config/passwordfile \
  <mqtt-username>
```

The command prompts for the password.

Do not put the real MQTT password into documentation.

---

# 14. Password Creation Issue Encountered

During initial HomeLab configuration, attempts to create the password file returned:

```text
Error: Empty password
```

This occurred while attempting to execute password creation through the container workflow.

The issue demonstrated that credential generation should be verified independently rather than assuming that the file exists because a command was executed.

Always verify:

```bash
ls -l ~/docker/mosquitto/config/passwordfile
```

and inspect that the file is not empty:

```bash
wc -c ~/docker/mosquitto/config/passwordfile
```

Do not display the contents publicly.

---

# 15. Verify Password File

Run:

```bash
ls -lh \
  ~/docker/mosquitto/config/passwordfile
```

Check ownership:

```bash
stat \
  ~/docker/mosquitto/config/passwordfile
```

The password file should not be world-readable.

---

# 16. Initial Permission Problem

The first MQTT deployment experienced container startup failures because Mosquitto could not access mounted host files.

Errors included:

```text
Unable to open log file /mosquitto/log/mosquitto.log
```

and:

```text
Unable to open pwfile /mosquitto/config/passwordfile
```

The container exited with:

```text
exit code 13
```

This was not a Mosquitto configuration syntax issue.

The problem was host filesystem ownership and permissions.

---

# 17. Root Cause

The Mosquitto container runs using the Mosquitto service account.

The mounted host directories initially did not provide the required access.

The result was:

```text
Mosquitto Container
        │
        ▼
Host Bind Mount
        │
        ├── Config
        ├── Password File
        └── Log Directory
               │
               ▼
       Permission Denied
```

---

# 18. Correct Mosquitto Ownership

The HomeLab resolved the issue by assigning ownership to UID/GID:

```text
1883:1883
```

Run:

```bash
sudo chown -R 1883:1883 \
  ~/docker/mosquitto
```

Verify:

```bash
ls -ln ~/docker/mosquitto
```

---

# 19. Correct Directory Permissions

Directories were configured as:

```text
755
```

Run:

```bash
sudo find ~/docker/mosquitto \
  -type d \
  -exec chmod 755 {} \;
```

Verify:

```bash
find ~/docker/mosquitto \
  -type d \
  -printf '%m %u:%g %p\n'
```

---

# 20. Correct File Permissions

Normal configuration files were configured as:

```text
644
```

Run:

```bash
sudo find ~/docker/mosquitto \
  -type f \
  ! -name passwordfile \
  -exec chmod 644 {} \;
```

---

# 21. Protect the Password File

The password file was configured as:

```text
600
```

Run:

```bash
sudo chmod 600 \
  ~/docker/mosquitto/config/passwordfile
```

Verify:

```bash
ls -l \
  ~/docker/mosquitto/config/passwordfile
```

Expected mode:

```text
-rw-------
```

---

# 22. Final Permission Model

The resulting permission model is:

```text
~/docker/mosquitto/
        │
        ├── directories
        │      755
        │
        ├── mosquitto.conf
        │      644
        │
        └── passwordfile
               600
```

Ownership:

```text
1883:1883
```

This allowed the Mosquitto process inside the container to access the required files.

---

# 23. Verify Final Ownership

Run:

```bash
ls -l ~/docker/mosquitto/config
```

Expected structure similar to:

```text
mosquitto.conf
passwordfile
```

Verify directories:

```bash
ls -ld \
  ~/docker/mosquitto/config \
  ~/docker/mosquitto/data \
  ~/docker/mosquitto/log
```

---

# 24. Verify smart_home_net

MQTT is attached to:

```text
smart_home_net
```

Check:

```bash
docker network ls
```

Expected:

```text
smart_home_net
```

Inspect:

```bash
docker network inspect smart_home_net
```

If missing:

```bash
docker network create smart_home_net
```

---

# 25. Why MQTT Uses smart_home_net

The messaging network provides shared connectivity between HomeAuto services.

```text
                 smart_home_net
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
      MQTT          Frigate      Home Assistant
```

This allows services in separate Compose stacks to communicate using Docker networking.

---

# 26. Start MQTT

Preferred method:

```bash
cd ~/docker
./dockerctl up mqtt
```

Start only the MQTT service:

```bash
./dockerctl up mqtt mqtt
```

Direct Compose equivalent:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/mqtt.yml \
  up -d
```

---

# 27. Verify MQTT Container

Run:

```bash
docker ps --filter "name=mqtt"
```

Readable output:

```bash
docker ps \
  --filter "name=mqtt" \
  --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

The MQTT container should report a running state.

---

# 28. Verify Through dockerctl

Run:

```bash
./dockerctl status mqtt mqtt
```

For the complete stack:

```bash
./dockerctl status mqtt
```

---

# 29. Verify MQTT Logs

Run:

```bash
docker logs mqtt --tail 30
```

or:

```bash
./dockerctl logs mqtt mqtt
```

The working HomeLab environment showed successful Mosquitto startup with:

```text
Mosquitto 2.1.2 starting
```

and listeners on:

```text
1883
9001
```

The broker was running as:

```text
user: mosquitto
```

---

# 30. Successful Startup State

The successful startup behavior included:

```text
Mosquitto 2.1.2 starting
Config loaded
IPv4 listener opened on 1883
IPv6 listener opened on 1883
WebSocket listener opened on 9001
Mosquitto running
```

This confirmed that the earlier permission problems had been resolved.

---

# 31. Verify Port 1883

On Ubuntu:

```bash
sudo ss -lnt | grep 1883
```

Expected listener:

```text
1883
```

Docker mapping:

```bash
docker ps --filter "name=mqtt" \
  --format "table {{.Names}}\t{{.Ports}}"
```

---

# 32. Verify WebSocket Port 9001

Run:

```bash
sudo ss -lnt | grep 9001
```

Expected:

```text
9001
```

The WebSocket listener can be used by clients requiring MQTT over WebSockets.

---

# 33. Verify MQTT from Windows

From Windows PowerShell:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 1883
```

Expected:

```text
TcpTestSucceeded : True
```

WebSocket port:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 9001
```

Expected:

```text
TcpTestSucceeded : True
```

---

# 34. Install MQTT CLI Tools

For broker testing, install Mosquitto clients on Ubuntu if required:

```bash
sudo apt update
sudo apt install mosquitto-clients -y
```

Verify:

```bash
mosquitto_pub --help
```

and:

```bash
mosquitto_sub --help
```

---

# 35. Publish / Subscribe Verification

Open terminal 1.

Subscribe:

```bash
mosquitto_sub \
  -h 127.0.0.1 \
  -p 1883 \
  -u "<mqtt-username>" \
  -P "<mqtt-password>" \
  -t "homeauto/test" \
  -v
```

Do not store real passwords in documentation or shell history where avoidable.

---

# 36. Publish a Test Message

From terminal 2:

```bash
mosquitto_pub \
  -h 127.0.0.1 \
  -p 1883 \
  -u "<mqtt-username>" \
  -P "<mqtt-password>" \
  -t "homeauto/test" \
  -m "MQTT test successful"
```

Terminal 1 should display:

```text
homeauto/test MQTT test successful
```

This verifies:

```text
Publisher
   │
   ▼
Mosquitto
   │
   ▼
Subscriber
```

---

# 37. Avoid Exposing Passwords

The `-P` option places the password directly in the command line.

For ad-hoc Lab testing this may be convenient, but it can appear in shell history or process listings.

For sensitive environments, prefer safer credential handling.

Never publish actual MQTT credentials in Git.

---

# 38. Anonymous Connection Test

Because:

```conf
allow_anonymous false
```

is configured, a connection without valid credentials should fail.

Example:

```bash
mosquitto_sub \
  -h 127.0.0.1 \
  -p 1883 \
  -t "homeauto/test"
```

The expected result is an authentication or authorization failure.

This confirms that anonymous access is disabled.

---

# 39. MQTT Explorer Validation

MQTT Explorer was also used as a graphical MQTT client.

Configure MQTT Explorer with:

```text
Host      : <UBUNTU_VM_IP>
Port      : 1883
Username  : <configured MQTT user>
Password  : <configured MQTT password>
```

After connecting, MQTT Explorer provides visibility into:

```text
Broker
 │
 └── Topics
      │
      ├── Frigate topics
      ├── Home Assistant topics
      └── Test topics
```

---

# 40. Verify MQTT Explorer Connection

Successful connection confirms:

- Network reachability
- Port 1883
- Authentication
- Broker availability
- Client compatibility

A test topic can be published using:

```text
homeauto/test
```

and observed in MQTT Explorer.

---

# 41. Frigate MQTT Integration

Frigate uses Mosquitto to publish event information.

The architecture is:

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
```

Frigate publishes event information that can be consumed by Home Assistant and diagnostic clients.

---

# 42. Home Assistant MQTT Integration

Home Assistant subscribes to MQTT topics through the Mosquitto broker.

```text
Mosquitto
   │
   ▼
Home Assistant MQTT Integration
   │
   ▼
Entities / Events / Automations
```

This supports event-driven smart-home workflows.

---

# 43. End-to-End MQTT Event Flow

The standard HomeAuto event path is:

```text
Camera
   │
   ▼
Frigate
   │
   │ Detection Event
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
Notification
```

This path has been used for standard detection workflows.

---

# 44. MQTT Is Not the Only Frigate Integration Path

The HomeLab also uses the Frigate HTTP API for selected AI metadata.

This became necessary during LPR testing.

```text
                   Frigate
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
        MQTT                   HTTP API
          │                       │
          ▼                       ▼
 Standard Events          Selected AI Metadata
          │                       │
          └───────────┬───────────┘
                      ▼
               Home Assistant
```

MQTT remains the standard event bus.

REST/API access is retained as an alternate path where required.

---

# 45. LPR MQTT Observation

During Frigate 0.17.2 LPR testing, license plate recognition itself succeeded.

The plate:

```text
TS07JF8179
```

was successfully stored by Frigate.

However, the expected LPR MQTT update was not consistently observed during the Lab test.

This did not indicate failure of the MQTT broker itself.

The broker was operational.

The issue was specific to the expected Frigate LPR metadata publication path.

---

# 46. Why REST Was Introduced for LPR

Frigate's event database/API reliably exposed:

```text
recognized_license_plate
recognized_license_plate_score
```

The architecture therefore became:

```text
Standard Events
      │
      ▼
MQTT

LPR / Selected AI Metadata
      │
      ▼
Frigate HTTP API
```

This preserves MQTT while avoiding a single dependency path for every AI feature.

---

# 47. Restart MQTT Only

If MQTT requires maintenance:

```bash
cd ~/docker
./dockerctl restart mqtt mqtt
```

Verify:

```bash
./dockerctl status mqtt mqtt
```

Inspect logs:

```bash
./dockerctl logs mqtt mqtt
```

This does not intentionally restart:

```text
Frigate
Home Assistant
Portainer
Dozzle
WebSSH
```

---

# 48. Stop MQTT Only

Run:

```bash
./dockerctl stop mqtt mqtt
```

Verify:

```bash
./dockerctl status mqtt mqtt
```

Be aware that applications depending on MQTT may remain running but lose broker connectivity while MQTT is stopped.

---

# 49. Start MQTT Again

Run:

```bash
./dockerctl up mqtt mqtt
```

Then:

```bash
./dockerctl status mqtt mqtt
```

Logs:

```bash
docker logs mqtt --tail 30
```

---

# 50. Restart Complete MQTT Stack

The MQTT stack currently contains the MQTT service, so:

```bash
./dockerctl restart mqtt
```

restarts the complete stack.

Service-specific operation is still preferred for consistency:

```bash
./dockerctl restart mqtt mqtt
```

---

# 51. Direct Docker Fallback

If the controller cannot be used:

```bash
docker restart mqtt
```

Verify:

```bash
docker ps --filter "name=mqtt"
```

Logs:

```bash
docker logs mqtt --tail 50
```

---

# 52. Troubleshooting — Container Exits Immediately

Check:

```bash
docker ps -a --filter "name=mqtt"
```

Inspect:

```bash
docker logs mqtt --tail 100
```

Common areas:

```text
Configuration syntax
Password file
File ownership
Log directory
Persistence directory
External network
Port conflict
```

---

# 53. Troubleshooting — Exit Code 13

If the container exits with:

```text
13
```

and logs show:

```text
Unable to open log file
```

or:

```text
Unable to open pwfile
```

verify ownership:

```bash
ls -ln ~/docker/mosquitto/config
```

and:

```bash
ls -ldn \
  ~/docker/mosquitto/config \
  ~/docker/mosquitto/data \
  ~/docker/mosquitto/log
```

Correct:

```bash
sudo chown -R 1883:1883 \
  ~/docker/mosquitto
```

Then restore appropriate permissions.

---

# 54. Troubleshooting — Password File Cannot Be Read

Verify:

```bash
ls -l \
  ~/docker/mosquitto/config/passwordfile
```

Expected:

```text
owner 1883
group 1883
mode 600
```

Correct:

```bash
sudo chown 1883:1883 \
  ~/docker/mosquitto/config/passwordfile
```

```bash
sudo chmod 600 \
  ~/docker/mosquitto/config/passwordfile
```

Restart:

```bash
./dockerctl restart mqtt mqtt
```

---

# 55. Troubleshooting — Log File Cannot Be Opened

Check:

```bash
ls -ld ~/docker/mosquitto/log
```

Correct ownership:

```bash
sudo chown -R 1883:1883 \
  ~/docker/mosquitto/log
```

Directory mode:

```bash
sudo chmod 755 \
  ~/docker/mosquitto/log
```

Restart:

```bash
./dockerctl restart mqtt mqtt
```

Then:

```bash
docker logs mqtt --tail 30
```

---

# 56. Troubleshooting — Port 1883 Unreachable

Check container:

```bash
docker ps --filter "name=mqtt"
```

Check mapping:

```bash
docker ps \
  --filter "name=mqtt" \
  --format "table {{.Names}}\t{{.Ports}}"
```

Check listener:

```bash
sudo ss -lnt | grep 1883
```

From Windows:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 1883
```

Investigate in this order:

```text
Mosquitto Process
      │
      ▼
Container
      │
      ▼
Docker Port Mapping
      │
      ▼
Ubuntu
      │
      ▼
Network
      │
      ▼
Client
```

---

# 57. Troubleshooting — Authentication Failure

Check broker logs:

```bash
docker logs mqtt --tail 100
```

Verify:

```text
Username
Password
password_file path
allow_anonymous
passwordfile permissions
```

Confirm the client is using the configured username.

Do not attempt to debug authentication by temporarily publishing real credentials into documentation.

---

# 58. Troubleshooting — smart_home_net Missing

Check:

```bash
docker network ls
```

If missing:

```bash
docker network create smart_home_net
```

Then:

```bash
./dockerctl up mqtt mqtt
```

---

# 59. Troubleshooting — Compose Validation

Validate:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/mqtt.yml \
  config
```

This catches issues before container startup.

---

# 60. MQTT Resource Usage

Check:

```bash
docker stats mqtt
```

MQTT is expected to remain a relatively lightweight service compared with video-processing workloads such as Frigate.

---

# 61. MQTT Persistence

Broker persistence is configured using:

```text
/mosquitto/data
```

Verify:

```bash
ls -lah ~/docker/mosquitto/data
```

Mosquitto may persist broker state according to its configured persistence settings.

The exact contents should be managed by the broker rather than edited manually.

---

# 62. MQTT Logs

Broker log files are stored under:

```text
~/docker/mosquitto/log
```

Verify:

```bash
ls -lah ~/docker/mosquitto/log
```

Where configured:

```text
mosquitto.log
```

can provide persistent broker logs in addition to Docker logs.

---

# 63. Backup Requirements

Important MQTT backup assets include:

```text
mqtt.yml
mosquitto.conf
passwordfile
.env structure
persistent broker data
```

The password file contains authentication information and must be stored securely.

Do not publish it to GitHub.

---

# 64. MQTT Security Considerations

Current security controls include:

- Authentication enabled
- Anonymous access disabled
- Password file protected
- Broker isolated inside Docker
- Shared Docker networking used deliberately
- Direct public Internet exposure avoided

The desired architecture is:

```text
Trusted HomeAuto Services
          │
          ▼
      MQTT Broker
          │
          ▼
Private / Controlled Network
```

not:

```text
Public Internet
      │
      ▼
Open MQTT Broker
```

Remote access should use a secure private networking method rather than exposing port `1883` directly to the Internet.

---

# 65. Verification Checklist

| Verification | Command | Expected Result |
|---|---|---|
| Stack exists | `./dockerctl stacks` | `mqtt` visible |
| Service exists | `./dockerctl services mqtt` | `mqtt` |
| Compose config | `docker compose ... config` | No errors |
| Network | `docker network ls` | `smart_home_net` visible |
| Directories | `ls -ld ~/docker/mosquitto/*` | Present |
| Ownership | `ls -ln ~/docker/mosquitto` | 1883:1883 |
| Password mode | `ls -l passwordfile` | 600 |
| Container | `docker ps --filter "name=mqtt"` | Running |
| MQTT listener | `ss -lnt \| grep 1883` | Listener |
| WebSocket listener | `ss -lnt \| grep 9001` | Listener |
| Windows MQTT | `Test-NetConnection ... -Port 1883` | True |
| Windows WS | `Test-NetConnection ... -Port 9001` | True |
| Logs | `docker logs mqtt --tail 30` | Broker running |
| Publish | `mosquitto_pub` | Message accepted |
| Subscribe | `mosquitto_sub` | Message received |
| GUI client | MQTT Explorer | Connected |
| Auth | Anonymous test | Rejected |
| Isolated restart | `./dockerctl restart mqtt mqtt` | MQTT restarted only |

---

# 66. Final Validated State

The MQTT layer is now:

```text
                smart_home_net
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
     Frigate       Mosquitto    Home Assistant
                      │
                      ├── TCP 1883
                      ├── WS 9001
                      │
                      ├── Authentication
                      ├── Persistence
                      └── Logging
```

Mosquitto is considered operational when:

- The MQTT container runs successfully
- Port 1883 listens
- Port 9001 listens
- Authentication works
- Anonymous access is rejected
- Publish/subscribe tests succeed
- MQTT Explorer can connect
- Frigate can publish events
- Home Assistant can consume MQTT events
- Persistent storage is mounted
- Password-file permissions are correct
- Log permissions are correct
- MQTT can be restarted independently

---

# 67. Engineering Outcome

The MQTT implementation introduced several important HomeLab lessons:

```text
Container Started
      │
      ▼
Application Permissions Matter
      │
      ▼
Bind-Mounted UID/GID Must Match
      │
      ▼
Authentication Must Be Verified
      │
      ▼
Network Connectivity Must Be Tested
      │
      ▼
Publish / Subscribe Must Be Validated
```

The permission issues encountered during the implementation became an important example of container filesystem ownership and bind-mount behavior.

---

# 68. Next Implementation Stage

With the messaging layer established, the next stage is:

```text
Docker
   │
   ├── Portainer
   ├── Dozzle
   ├── MQTT
   │     COMPLETE
   ▼
Frigate AI
```

The next section documents **Frigate AI**, including:

- Compose deployment
- Configuration layout
- Camera ingestion
- go2rtc
- Recording
- Snapshots
- CPU-based AI processing
- MQTT integration
- HTTP API
- Person/object detection
- Face recognition
- License Plate Recognition
- API validation
- Isolated restart workflow
- Troubleshooting
- Hardware-acceleration roadmap