---
title: Docker Implementation
sidebar_label: Docker
description: Docker Engine, Docker Compose, multi-stack architecture, external networks, persistent storage, service isolation, and operational validation for the Makani HomeAuto HomeLab.
---

# Docker Implementation

Docker provides the primary application runtime for the **Makani HomeAuto HomeLab**.

Rather than installing Home Assistant, Frigate, Mosquitto, Portainer, Dozzle, and WebSSH directly on Ubuntu, the platform uses containers to isolate services and make deployments reproducible.

```text
Ubuntu Server 24.04 LTS
          │
          ▼
      Docker Engine
          │
          ▼
     Docker Compose
          │
    ┌─────┼────────────────────────────┐
    │     │                            │
    ▼     ▼                            ▼
Infrastructure                    Smart Home / AI
    │                                 │
    ├── Portainer                     ├── MQTT
    ├── Dozzle                        ├── Frigate
    └── WebSSH                        └── Home Assistant
```

Docker therefore acts as the common execution layer for the HomeAuto application stack.

---

# 1. Purpose

Docker was selected to provide:

- Application isolation
- Repeatable deployments
- Independent service lifecycle management
- Easier upgrades
- Persistent storage
- Shared container networking
- Portable configuration
- Simplified troubleshooting
- Clear separation between Ubuntu and application workloads

The HomeLab architecture follows:

```text
Ubuntu
   │
   ▼
Docker Engine
   │
   ▼
Docker Compose
   │
   ▼
Independent HomeAuto Services
```

---

# 2. Current Docker Environment

The HomeLab currently uses:

```text
Docker Engine
29.1.3
```

and:

```text
Docker Compose
v2.40.3+ds1
```

Verify:

```bash
docker --version
```

and:

```bash
docker compose version
```

The HomeLab uses the modern Compose syntax:

```bash
docker compose
```

rather than the legacy:

```bash
docker-compose
```

---

# 3. Docker Service Verification

Check the Docker daemon:

```bash
sudo systemctl status docker
```

Expected:

```text
active (running)
```

Check whether Docker is enabled at boot:

```bash
sudo systemctl is-enabled docker
```

Expected:

```text
enabled
```

If Docker is not running:

```bash
sudo systemctl start docker
```

Enable automatic startup:

```bash
sudo systemctl enable docker
```

---

# 4. Verify Docker CLI Access

Run:

```bash
docker ps
```

The command should work without `sudo`.

If permission is denied, check the current groups:

```bash
groups
```

or:

```bash
groups teju
```

If `docker` is missing:

```bash
sudo usermod -aG docker teju
```

Then log out and reconnect.

Verify again:

```bash
docker ps
```

---

# 5. Docker Runtime Validation

A simple runtime validation can be performed using:

```bash
docker run --rm hello-world
```

This verifies:

```text
Docker CLI
   │
   ▼
Docker Daemon
   │
   ▼
Image Pull
   │
   ▼
Container Creation
   │
   ▼
Container Execution
```

After successful execution, the container exits automatically.

---

# 6. Docker Information

Inspect the Docker environment:

```bash
docker info
```

Useful fields include:

```text
Server Version
Storage Driver
Cgroup Driver
Kernel Version
Operating System
CPUs
Total Memory
Docker Root Dir
```

A concise view:

```bash
docker info | grep -E \
"Server Version|Storage Driver|Cgroup|CPUs|Total Memory|Docker Root Dir"
```

---

# 7. Docker Compose Verification

Run:

```bash
docker compose version
```

Expected current environment:

```text
Docker Compose version v2.40.3+ds1
```

Compose v2 is integrated into the Docker CLI.

Therefore:

```bash
docker compose ps
```

is valid.

The legacy command:

```bash
docker-compose ps
```

should not be assumed to exist.

---

# 8. Compose Installation Issue Encountered

During the initial Ubuntu setup, the package:

```text
docker-compose-plugin
```

was attempted.

The system returned:

```text
Unable to locate package docker-compose-plugin
```

The legacy:

```bash
docker-compose
```

command was also unavailable.

This created temporary confusion because many older Docker tutorials still reference:

```bash
docker-compose
```

The working HomeLab ultimately standardized on:

```bash
docker compose
```

using Compose v2.

---

# 9. Initial Compose File Issue

The original Docker workspace contained:

```text
~/docker/docker-compose.yml
```

but the file was effectively empty.

Its size was approximately:

```text
1 byte
```

As a result, Docker Compose operations failed with messages indicating:

```text
empty compose file
```

Commands such as:

```bash
docker compose down
```

or:

```bash
docker compose up -d
```

could not operate because the Compose definition contained no services.

---

# 10. Why the Initial Design Was Changed

The original idea was to manage all HomeAuto services using one large:

```text
docker-compose.yml
```

This was eventually replaced by a layered stack design.

The reasons included:

- Easier troubleshooting
- Independent upgrades
- Service isolation
- Cleaner ownership
- Easier restart procedures
- Better environment organization
- Reduced impact during maintenance

The architecture evolved from:

```text
docker-compose.yml
       │
       ├── Portainer
       ├── Dozzle
       ├── MQTT
       ├── Frigate
       └── Home Assistant
```

to:

```text
stacks/
│
├── infrastructure.yml
├── mqtt.yml
├── frigate.yml
├── homeassistant.yml
└── webssh.yml
```

---

# 11. Current Docker Workspace

The primary project directory is:

```text
/home/teju/docker
```

Enter it using:

```bash
cd ~/docker
```

Verify:

```bash
pwd
```

Expected:

```text
/home/teju/docker
```

---

# 12. Current Directory Structure

The HomeAuto Docker environment follows a structure similar to:

```text
/home/teju/docker/
│
├── .env
├── dockerctl
│
├── stacks/
│   ├── infrastructure.yml
│   ├── mqtt.yml
│   ├── frigate.yml
│   ├── homeassistant.yml
│   └── webssh.yml
│
├── mosquitto/
│   ├── config/
│   ├── data/
│   └── log/
│
└── additional service data
```

This separates:

```text
Compose Definitions
        │
        ▼
~/docker/stacks/

Persistent Application Data
        │
        ▼
~/docker/<service>/
```

---

# 13. Create the Stack Directory

If required:

```bash
mkdir -p ~/docker/stacks
```

Verify:

```bash
ls -ld ~/docker/stacks
```

List current stack files:

```bash
ls -lh ~/docker/stacks/
```

Current stack set:

```text
frigate.yml
homeassistant.yml
infrastructure.yml
mqtt.yml
webssh.yml
```

---

# 14. Current Stack Architecture

The HomeLab is organized as:

```text
Docker Engine
    │
    ├── infrastructure.yml
    │      ├── Portainer
    │      └── Dozzle
    │
    ├── mqtt.yml
    │      └── Mosquitto
    │
    ├── frigate.yml
    │      └── Frigate
    │
    ├── homeassistant.yml
    │      └── Home Assistant
    │
    └── webssh.yml
           └── WebSSH
```

Each stack can be managed independently.

---

# 15. Why Multi-Stack Architecture Is Used

The multi-stack model provides several operational advantages.

For example:

```text
Frigate configuration changed
        │
        ▼
Restart Frigate stack/service only
        │
        ├── MQTT unchanged
        ├── Home Assistant unchanged
        ├── Portainer unchanged
        └── Dozzle unchanged
```

This is preferable to restarting the entire HomeLab.

---

# 16. Environment File

A shared environment file is stored at:

```text
/home/teju/docker/.env
```

Verify:

```bash
ls -la ~/docker/.env
```

The `.env` file can provide values such as:

```text
MQTT_PORT
MQTT_WEBSOCKET_PORT
```

and other deployment-specific variables.

---

# 17. Environment File Security

Sensitive values should not be published.

Protect the environment file:

```bash
chmod 600 ~/docker/.env
```

Verify:

```bash
ls -l ~/docker/.env
```

Avoid committing:

```text
Passwords
API keys
Camera credentials
MQTT credentials
Home Assistant secrets
Private keys
```

to GitHub.

---

# 18. Docker Networks

List Docker networks:

```bash
docker network ls
```

The HomeLab currently uses external networks including:

```text
infra_net
smart_home_net
```

These networks allow containers from different Compose stacks to communicate.

---

# 19. Create Infrastructure Network

If the network does not already exist:

```bash
docker network create infra_net
```

Verify:

```bash
docker network inspect infra_net
```

---

# 20. Create Smart-Home Network

If required:

```bash
docker network create smart_home_net
```

Verify:

```bash
docker network inspect smart_home_net
```

---

# 21. Why External Networks Are Important

By default, Docker Compose creates a network specific to each Compose project.

For example:

```text
infrastructure_default
mqtt_default
frigate_default
```

That can isolate stacks from each other.

External networks allow deliberate cross-stack communication.

```text
                  smart_home_net
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
        MQTT         Frigate   Home Assistant
```

Similarly:

```text
infra_net
   │
   ├── Portainer
   └── Dozzle
```

---

# 22. Network Declaration in Compose

A Compose stack can reference an external network using:

```yaml
networks:
  smart_home_net:
    external: true
```

A service can then attach to it:

```yaml
services:
  example:
    networks:
      - smart_home_net
```

The network must already exist before Compose starts the service.

---

# 23. Verify Container Network Membership

Inspect a network:

```bash
docker network inspect smart_home_net
```

Look under:

```text
Containers
```

to verify attached services.

A concise list:

```bash
docker network inspect smart_home_net \
  --format '{{json .Containers}}' | jq
```

---

# 24. Infrastructure Stack

The infrastructure stack is stored at:

```text
~/docker/stacks/infrastructure.yml
```

Current infrastructure services include:

```text
Portainer
Dozzle
```

Verify the Compose services:

```bash
./dockerctl services infrastructure
```

or directly:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  config --services
```

---

# 25. MQTT Stack

The MQTT stack is stored at:

```text
~/docker/stacks/mqtt.yml
```

Verify:

```bash
./dockerctl services mqtt
```

Mosquitto runs as an independent stack so that messaging can be maintained independently from Frigate and Home Assistant.

---

# 26. Frigate Stack

The Frigate Compose configuration is stored at:

```text
~/docker/stacks/frigate.yml
```

Verify:

```bash
./dockerctl services frigate
```

This stack contains the Frigate AI-surveillance workload.

---

# 27. Home Assistant Stack

The Home Assistant Compose configuration is stored at:

```text
~/docker/stacks/homeassistant.yml
```

Verify:

```bash
./dockerctl services homeassistant
```

Home Assistant is kept separate from Frigate so either service can be restarted independently.

---

# 28. WebSSH Stack

WebSSH is stored at:

```text
~/docker/stacks/webssh.yml
```

Verify:

```bash
./dockerctl services webssh
```

This provides an additional remote-management capability within the Lab.

---

# 29. Validate a Compose File

Before starting a stack, validate the rendered configuration.

Example:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/frigate.yml \
  config
```

For MQTT:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/mqtt.yml \
  config
```

This is extremely useful for detecting:

```text
YAML errors
Missing environment variables
Invalid service definitions
Invalid volume mappings
Invalid networks
```

before starting containers.

---

# 30. List Services in a Compose File

Run:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  config --services
```

This returns the service names actually defined by Compose.

The custom `dockerctl` controller uses the same method internally.

---

# 31. Start a Single Stack

Using `dockerctl`:

```bash
./dockerctl up infrastructure
```

Direct Compose equivalent:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  up -d
```

---

# 32. Check Stack Status

Using:

```bash
./dockerctl status infrastructure
```

Direct Compose:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  ps
```

---

# 33. Stop a Stack

Preferred:

```bash
./dockerctl stop infrastructure
```

This stops containers without removing them.

Direct equivalent:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  stop
```

---

# 34. Take a Stack Down

When the stack should be removed:

```bash
./dockerctl down infrastructure
```

Direct equivalent:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  down
```

`down` should be used deliberately because it removes the Compose-created containers and resources according to Compose behavior.

For normal maintenance, prefer:

```bash
stop
```

rather than:

```bash
down
```

---

# 35. Restart a Stack

Using:

```bash
./dockerctl restart mqtt
```

Direct equivalent:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/mqtt.yml \
  restart
```

This restarts all services defined inside that stack.

---

# 36. Restart a Single Service

The enhanced service controller supports service-level restarts.

Example: Portainer only:

```bash
./dockerctl restart infrastructure portainer
```

Dozzle remains unchanged.

Frigate only:

```bash
./dockerctl restart frigate frigate
```

Home Assistant only:

```bash
./dockerctl restart homeassistant homeassistant
```

MQTT only:

```bash
./dockerctl restart mqtt mqtt
```

This supports the operational rule:

> Restart only what changed.

---

# 37. Start a Single Service

Example:

```bash
./dockerctl up infrastructure portainer
```

This runs the equivalent of:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  up -d portainer
```

Using `up -d <service>` is useful because Compose can create the container if required.

---

# 38. Stop a Single Service

Example:

```bash
./dockerctl stop infrastructure portainer
```

This does not intentionally stop Dozzle.

Similarly:

```bash
./dockerctl stop frigate frigate
```

stops Frigate only.

---

# 39. View Running Containers

Run:

```bash
docker ps
```

A more readable view:

```bash
docker ps \
  --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

To include stopped containers:

```bash
docker ps -a
```

---

# 40. Inspect a Container

Example:

```bash
docker inspect frigate
```

For selected information:

```bash
docker inspect frigate | jq
```

Container inspection can expose:

```text
Network configuration
Volume mounts
Environment variables
Restart policy
Container state
Health checks
```

Be careful when publishing output because environment variables may contain secrets.

---

# 41. Container Logs

Direct logs:

```bash
docker logs frigate --tail 50
```

MQTT:

```bash
docker logs mqtt --tail 30
```

Follow logs:

```bash
docker logs -f frigate
```

Using `dockerctl`:

```bash
./dockerctl logs frigate frigate
```

or:

```bash
./dockerctl logs mqtt mqtt
```

Exit follow mode with:

```text
Ctrl+C
```

---

# 42. Container Resource Usage

Run:

```bash
docker stats
```

This displays:

```text
CPU %
Memory usage
Memory %
Network I/O
Block I/O
PIDs
```

For one container:

```bash
docker stats frigate
```

This is particularly useful because Frigate currently performs CPU-based AI processing during functional validation.

---

# 43. Docker Disk Usage

Run:

```bash
docker system df
```

This shows disk consumption by:

```text
Images
Containers
Local volumes
Build cache
```

More detailed:

```bash
docker system df -v
```

---

# 44. Persistent Data

Container images should be considered disposable.

Application state should be stored using bind mounts or Docker volumes.

The HomeLab uses persistent directories such as:

```text
~/docker/mosquitto/config
~/docker/mosquitto/data
~/docker/mosquitto/log
```

Frigate and Home Assistant similarly require persistent configuration/data paths.

The principle is:

```text
Container
   │
   │ disposable
   ▼

Persistent Data
   │
   │ survives recreation
   ▼
Host Filesystem / Volume
```

---

# 45. Mosquitto Persistent Mounts

The MQTT Compose stack uses mappings such as:

```yaml
volumes:
  - ../mosquitto/config:/mosquitto/config
  - ../mosquitto/data:/mosquitto/data
  - ../mosquitto/log:/mosquitto/log
```

This keeps:

- configuration
- persistence data
- broker logs

outside the container filesystem.

---

# 46. File Permission Importance

Containerized applications often run using specific Linux UIDs.

Mosquitto exposed this issue during initial deployment.

The application was unable to access:

```text
/mosquitto/log/mosquitto.log
```

and:

```text
/mosquitto/config/passwordfile
```

because the host-side files did not have the correct ownership or permissions.

---

# 47. Mosquitto Permission Fix

The HomeLab corrected ownership using:

```bash
sudo chown -R 1883:1883 ~/docker/mosquitto
```

Directory permissions:

```bash
sudo find ~/docker/mosquitto \
  -type d \
  -exec chmod 755 {} \;
```

Normal files:

```bash
sudo find ~/docker/mosquitto \
  -type f \
  ! -name passwordfile \
  -exec chmod 644 {} \;
```

Password file:

```bash
sudo chmod 600 \
  ~/docker/mosquitto/config/passwordfile
```

This is a good example of why bind-mount permissions must be validated when using containers.

---

# 48. Verify Persistent Directory Ownership

Run:

```bash
ls -l ~/docker/mosquitto/config
```

and:

```bash
ls -ld \
  ~/docker/mosquitto/config \
  ~/docker/mosquitto/data \
  ~/docker/mosquitto/log
```

The Mosquitto directories were ultimately owned by:

```text
1883:1883
```

---

# 49. Restart Policy

Compose services use restart policies where appropriate.

Example:

```yaml
restart: unless-stopped
```

This allows containers to return after Docker/VM restart unless they were deliberately stopped.

The behavior should still be validated for each stack rather than assumed.

---

# 50. Docker Start on Ubuntu Boot

Docker itself is enabled using:

```bash
sudo systemctl enable docker
```

Verify:

```bash
systemctl is-enabled docker
```

Expected:

```text
enabled
```

The HomeAuto services can then be started according to the chosen lifecycle strategy.

The custom controller provides explicit dependency-aware startup:

```bash
./dockerctl start-all
```

---

# 51. Whole-Lab Startup Sequence

The current `dockerctl` startup order is:

```text
Infrastructure
      │
      ▼
MQTT
      │
      ▼
Frigate
      │
      ▼
Home Assistant
      │
      ▼
WebSSH
```

Start:

```bash
cd ~/docker
./dockerctl start-all
```

Verify:

```bash
./dockerctl status
```

---

# 52. Whole-Lab Shutdown Sequence

Shutdown occurs in reverse order:

```text
WebSSH
   │
   ▼
Home Assistant
   │
   ▼
Frigate
   │
   ▼
MQTT
   │
   ▼
Infrastructure
```

Run:

```bash
./dockerctl stop-all
```

Verify:

```bash
docker ps
```

---

# 53. Compose Project Status

Run:

```bash
docker compose ls
```

This displays active Compose projects.

The original `dockerctl status` implementation used this command to show running stacks.

The enhanced controller combines:

```bash
docker ps
```

with:

```bash
docker compose ls
```

for a broader status view.

---

# 54. Direct Container Restart

If required during recovery:

```bash
docker restart frigate
```

or:

```bash
docker restart mqtt
```

or:

```bash
docker restart homeassistant
```

Direct Docker commands remain useful when:

```text
dockerctl problem
Compose problem
Service troubleshooting
Emergency recovery
```

However, normal operations should use:

```text
dockerctl
```

for consistency.

---

# 55. Docker Daemon Troubleshooting

Check:

```bash
sudo systemctl status docker
```

Recent logs:

```bash
journalctl -u docker --since "30 minutes ago"
```

If the daemon itself requires a restart:

```bash
sudo systemctl restart docker
```

This can interrupt multiple containers, so it should not be the first troubleshooting step for an individual application problem.

---

# 56. Container Startup Troubleshooting

If a container fails:

```bash
docker ps -a
```

Find the container state.

Then:

```bash
docker logs <container> --tail 100
```

Example:

```bash
docker logs mqtt --tail 100
```

Inspect:

```bash
docker inspect mqtt
```

Then validate its Compose configuration:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/mqtt.yml \
  config
```

---

# 57. Compose YAML Troubleshooting

A malformed Compose file can prevent startup.

Always validate:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/<stack>.yml \
  config
```

Example:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/frigate.yml \
  config
```

If successful, Compose prints the normalized configuration.

---

# 58. Empty Compose File Troubleshooting

If Compose reports:

```text
empty compose file
```

check the target file:

```bash
ls -lh docker-compose.yml
```

Then:

```bash
cat docker-compose.yml
```

An empty or nearly empty file cannot define services.

This was one of the initial HomeLab issues and contributed to the move toward explicit per-stack Compose files.

---

# 59. Missing Network Troubleshooting

If Compose references:

```yaml
external: true
```

but the external network does not exist, startup may fail.

Check:

```bash
docker network ls
```

Create if required:

```bash
docker network create smart_home_net
```

or:

```bash
docker network create infra_net
```

Retry:

```bash
./dockerctl up <stack>
```

---

# 60. Container-to-Container Connectivity

Containers on a shared Docker network should be able to resolve each other using Docker DNS and service/container names where applicable.

Inspect:

```bash
docker network inspect smart_home_net
```

Then test from a suitable container where diagnostic tools are available.

The intended application communication includes:

```text
Frigate
   │
   ▼
MQTT
```

and:

```text
Home Assistant
   │
   ▼
MQTT
```

through the shared smart-home network.

---

# 61. Published Port Verification

List:

```bash
docker ps \
  --format "table {{.Names}}\t{{.Ports}}"
```

Example published services in the HomeLab include:

```text
Portainer     9443
Dozzle        8080
MQTT          1883
MQTT WS       9001
Frigate       5000
```

Exact ports should be verified from the active Compose files.

---

# 62. Verify Listening Ports on Ubuntu

Run:

```bash
sudo ss -lnt
```

Specific example:

```bash
sudo ss -lnt | grep 1883
```

or:

```bash
sudo ss -lnt | grep 9443
```

---

# 63. Verify Ports from Windows

From PowerShell:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 9443
```

Dozzle:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 8080
```

MQTT:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 1883
```

Frigate:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 5000
```

Expected:

```text
TcpTestSucceeded : True
```

---

# 64. Infrastructure Service Verification

Portainer:

```bash
docker ps --filter "name=portainer"
```

Dozzle:

```bash
docker ps --filter "name=dozzle"
```

Logs:

```bash
./dockerctl logs infrastructure portainer
```

and:

```bash
./dockerctl logs infrastructure dozzle
```

---

# 65. MQTT Verification

Check:

```bash
docker ps --filter "name=mqtt"
```

Logs:

```bash
docker logs mqtt --tail 30
```

Successful Mosquitto startup should show listeners for:

```text
1883
9001
```

The detailed MQTT implementation is documented separately.

---

# 66. Frigate Verification

Check:

```bash
docker ps --filter "name=frigate"
```

Logs:

```bash
docker logs frigate --tail 50
```

API:

```bash
curl -s http://127.0.0.1:5000/api/events | jq
```

The Frigate page documents the full AI-surveillance implementation.

---

# 67. Home Assistant Verification

Check:

```bash
docker ps --filter "name=homeassistant"
```

Logs:

```bash
docker logs homeassistant --tail 50
```

The Home Assistant implementation page documents HACS, dashboards, Frigate integration, Advanced Camera Card, aircraft monitoring, weather, Alexa, and other integrations.

---

# 68. Docker Backup Considerations

The important assets are not the running containers themselves.

Backup priorities include:

```text
Compose files
.env structure
Application configuration
Home Assistant config
Frigate config
Mosquitto config
Persistent data
dockerctl
```

Container images can normally be pulled again.

The operational principle is:

```text
Configuration + Persistent Data
            │
            ▼
      Rebuildable Platform
```

---

# 69. Useful Docker Commands

## Running containers

```bash
docker ps
```

## All containers

```bash
docker ps -a
```

## Images

```bash
docker images
```

## Networks

```bash
docker network ls
```

## Volumes

```bash
docker volume ls
```

## Resource usage

```bash
docker stats
```

## Disk usage

```bash
docker system df
```

## Logs

```bash
docker logs <container>
```

## Inspect

```bash
docker inspect <container>
```

---

# 70. HomeLab Operational Workflow

The resulting operational workflow is:

```text
Ubuntu VM
   │
   ▼
Docker Engine
   │
   ▼
dockerctl
   │
   ├── start-all
   ├── stop-all
   ├── restart-all
   │
   ├── stack operations
   │
   └── service operations
           │
           ▼
      Docker Compose
           │
           ▼
      Docker Containers
```

---

# 71. Verification Checklist

| Test | Command | Expected Result |
|---|---|---|
| Docker CLI | `docker --version` | Docker 29.1.3 |
| Compose | `docker compose version` | Compose v2 |
| Docker daemon | `systemctl status docker` | Active |
| Boot enablement | `systemctl is-enabled docker` | enabled |
| User access | `docker ps` | Runs without sudo |
| Runtime | `docker run --rm hello-world` | Successful |
| Stack files | `ls -lh ~/docker/stacks/` | Stack files visible |
| Config validation | `docker compose ... config` | No config errors |
| Networks | `docker network ls` | `infra_net`, `smart_home_net` |
| Stack discovery | `./dockerctl stacks` | All stacks shown |
| Service discovery | `./dockerctl services <stack>` | Services shown |
| Full startup | `./dockerctl start-all` | Stacks started |
| Status | `./dockerctl status` | Services visible |
| Isolated restart | `./dockerctl restart frigate frigate` | Frigate only restarted |
| Logs | `./dockerctl logs <stack> <service>` | Logs visible |
| Full shutdown | `./dockerctl stop-all` | Services stopped |

---

# 72. Final Validated State

The Docker platform now provides a modular application runtime for HomeAuto.

```text
Ubuntu Server 24.04
        │
        ▼
   Docker Engine
        │
        ▼
   Docker Compose
        │
        ▼
     dockerctl
        │
 ┌──────┼─────────────────────────────────┐
 │      │                                 │
 ▼      ▼                                 ▼
Infrastructure       Messaging       Smart Home / AI
 │                     │                  │
 ├── Portainer         └── MQTT           ├── Frigate
 ├── Dozzle                               ├── Home Assistant
 └── WebSSH                               └── Future Services
        │
        ▼
 External Networks
        │
        ├── infra_net
        └── smart_home_net
```

The Docker layer is considered validated when:

- Docker Engine is operational
- Compose v2 is available
- Docker starts with Ubuntu
- Stack definitions validate successfully
- External networks exist
- Persistent data is mapped outside disposable containers
- Services can be managed independently
- Complete Lab startup and shutdown are controlled through `dockerctl`
- Individual services can be restarted without intentionally affecting unrelated modules
- Logs and resource information are available for troubleshooting

---

# 73. Next Implementation Stage

With Docker operational, the next implementation stage is the infrastructure-management layer:

```text
Ubuntu
   │
   ▼
Docker
   │
   │ COMPLETE
   ▼
Infrastructure Stack
   │
   ├── Portainer
   └── Dozzle
```

The next section documents **Portainer**, including its container configuration, persistent data, HTTPS access on port `9443`, initial administrator setup, setup timeout behavior, troubleshooting, and final validation.