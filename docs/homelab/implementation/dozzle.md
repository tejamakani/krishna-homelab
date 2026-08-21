---
title: Dozzle Implementation
sidebar_label: Dozzle
description: Dozzle deployment, Docker socket access, real-time container log monitoring, verification, isolated restart, and troubleshooting for the Makani HomeAuto HomeLab.
---

# Dozzle Implementation

**Dozzle** provides lightweight, browser-based, real-time log monitoring for Docker containers in the Makani HomeAuto HomeLab.

While Portainer is used for container management and platform visibility, Dozzle focuses specifically on fast access to application logs.

```text
Administrator
     │
     ▼
Web Browser
     │
     ▼
Dozzle
     │
     ▼
Docker Socket
     │
     ▼
Docker Engine
     │
     ├── Portainer Logs
     ├── MQTT Logs
     ├── Frigate Logs
     ├── Home Assistant Logs
     └── Other Container Logs
```

Dozzle is deployed as part of the HomeLab infrastructure stack.

---

# 1. Purpose

Dozzle was introduced to simplify real-time troubleshooting.

Without Dozzle, logs are typically inspected using commands such as:

```bash
docker logs frigate --tail 50
```

or:

```bash
docker logs -f mqtt
```

Dozzle provides the same type of visibility through a browser.

It is particularly useful during:

- Frigate configuration testing
- MQTT troubleshooting
- Home Assistant integration testing
- Container startup failures
- Service restart validation
- Configuration changes
- Multi-container troubleshooting

The operational model becomes:

```text
Quick Visual Log Inspection
            │
            ▼
          Dozzle

Detailed CLI Investigation
            │
            ▼
       docker logs
```

---

# 2. Current Deployment Model

Dozzle is deployed inside:

```text
~/docker/stacks/infrastructure.yml
```

The infrastructure stack currently contains:

```text
Infrastructure Stack
       │
       ├── Portainer
       └── Dozzle
```

The current Dozzle image is:

```text
amir20/dozzle:latest
```

The web interface is exposed on:

```text
TCP 8080
```

---

# 3. Verify Infrastructure Stack

Enter the Docker project directory:

```bash
cd ~/docker
```

List available stacks:

```bash
./dockerctl stacks
```

Verify services inside the infrastructure stack:

```bash
./dockerctl services infrastructure
```

Expected services should include:

```text
portainer
dozzle
```

---

# 4. Inspect Infrastructure Compose File

Display the active stack definition:

```bash
cat ~/docker/stacks/infrastructure.yml
```

Before starting Dozzle, validate the Compose configuration:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  config
```

If valid, Docker Compose prints the normalized configuration.

---

# 5. Dozzle Compose Pattern

The Dozzle service follows a structure similar to:

```yaml
services:

  dozzle:
    image: amir20/dozzle:latest
    container_name: dozzle

    restart: unless-stopped

    ports:
      - "8080:8080"

    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro

    networks:
      - infra_net

networks:
  infra_net:
    external: true
```

The active Compose file remains the authoritative source for exact configuration.

---

# 6. Why Docker Socket Access Is Required

Dozzle reads container metadata and logs through the Docker API exposed by:

```text
/var/run/docker.sock
```

The socket is mounted into the container:

```yaml
- /var/run/docker.sock:/var/run/docker.sock:ro
```

The `:ro` suffix indicates that the bind mount is read-only from the container filesystem perspective.

The relationship is:

```text
Dozzle
   │
   ▼
Docker Socket
   │
   ▼
Docker Engine
   │
   ▼
Container Logs
```

This allows Dozzle to discover running containers and stream their logs.

---

# 7. Security Consideration

Even though the Docker socket is mounted read-only, access to the Docker socket should still be treated as privileged.

Dozzle should therefore be available only to trusted administrators and trusted networks.

Recommended access model:

```text
Trusted Admin Device
       │
       ▼
Private Network / VPN
       │
       ▼
Dozzle :8080
```

Avoid direct public exposure of the Dozzle interface.

---

# 8. Verify Infrastructure Network

Check Docker networks:

```bash
docker network ls
```

Expected:

```text
infra_net
```

Inspect:

```bash
docker network inspect infra_net
```

If the network does not exist:

```bash
docker network create infra_net
```

Then verify:

```bash
docker network ls
```

---

# 9. Start the Infrastructure Stack

Start the complete infrastructure stack:

```bash
cd ~/docker
./dockerctl up infrastructure
```

This starts:

```text
Portainer
Dozzle
```

Direct Compose equivalent:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  up -d
```

---

# 10. Start Dozzle Only

To start Dozzle without intentionally starting or restarting Portainer:

```bash
./dockerctl up infrastructure dozzle
```

This is the preferred isolated service operation.

---

# 11. Verify Dozzle Container

Run:

```bash
docker ps --filter "name=dozzle"
```

For a readable container list:

```bash
docker ps \
  --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

Dozzle should appear with a running state.

---

# 12. Verify Dozzle Through dockerctl

Run:

```bash
./dockerctl status infrastructure dozzle
```

For the whole infrastructure stack:

```bash
./dockerctl status infrastructure
```

---

# 13. Verify Port 8080

On Ubuntu:

```bash
sudo ss -lnt | grep 8080
```

Docker port mapping:

```bash
docker ps --filter "name=dozzle" \
  --format "table {{.Names}}\t{{.Ports}}"
```

Expected published port:

```text
8080
```

---

# 14. Verify Connectivity from Windows

From Windows PowerShell:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 8080
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
VM Network
   │
   ▼
Ubuntu
   │
   ▼
Docker Port Mapping
   │
   ▼
Dozzle
```

---

# 15. Access Dozzle

Open:

```text
http://<UBUNTU_VM_IP>:8080
```

Example format:

```text
http://192.168.x.x:8080
```

The browser should display the Dozzle interface and available Docker containers.

---

# 16. Verify Container Discovery

After opening Dozzle, the interface should display running containers.

Depending on which HomeLab stacks are active, examples may include:

```text
portainer
dozzle
mqtt
frigate
homeassistant
webssh
```

Dozzle obtains this information from the Docker socket.

---

# 17. Verify Frigate Logs

Select:

```text
frigate
```

inside Dozzle.

The interface should begin displaying the container's current log stream.

Equivalent CLI command:

```bash
docker logs -f frigate
```

For only recent output:

```bash
docker logs frigate --tail 50
```

---

# 18. Verify MQTT Logs

Select:

```text
mqtt
```

inside Dozzle.

Equivalent CLI:

```bash
docker logs -f mqtt
```

or:

```bash
docker logs mqtt --tail 30
```

This is especially useful for validating:

- Broker startup
- Authentication errors
- Listener configuration
- Client connections
- Permission problems

---

# 19. Verify Home Assistant Logs

Select the Home Assistant container.

Equivalent CLI:

```bash
docker logs homeassistant --tail 50
```

Dozzle provides faster switching between services when troubleshooting an integration involving more than one container.

---

# 20. Multi-Service Troubleshooting

One of Dozzle's primary benefits is visibility across several applications without changing terminals.

For example:

```text
Camera Event
     │
     ▼
Frigate
     │
     ▼
MQTT
     │
     ▼
Home Assistant
```

When troubleshooting this workflow, Dozzle allows rapid inspection of:

```text
Frigate logs
MQTT logs
Home Assistant logs
```

from the same browser interface.

This is useful when determining where an event flow is failing.

---

# 21. Example Troubleshooting Flow

Assume a Frigate event does not appear in Home Assistant.

A structured investigation is:

```text
Check Frigate
     │
     ▼
Was event generated?
     │
     ▼
Check MQTT
     │
     ▼
Was event published?
     │
     ▼
Check Home Assistant
     │
     ▼
Was event consumed?
```

Using Dozzle:

```text
Frigate tab
   ↓
MQTT tab
   ↓
Home Assistant tab
```

This reduces the need to repeatedly run separate log commands.

---

# 22. Dozzle vs Portainer Logs

Portainer can expose container logs as part of its management interface.

Dozzle is still useful because its interface is optimized specifically for real-time log inspection.

The distinction is:

```text
Portainer
   │
   ├── Containers
   ├── Networks
   ├── Images
   ├── Volumes
   └── Logs

Dozzle
   │
   └── Fast Real-Time Logs
```

Portainer remains the broader management platform.

Dozzle remains the focused observability tool.

---

# 23. Dozzle vs Docker CLI

Dozzle provides convenience, but Docker CLI remains the authoritative troubleshooting method.

## Dozzle

Best suited for:

- Fast log inspection
- Switching between containers
- Browser-based troubleshooting
- Real-time observation

## Docker CLI

Best suited for:

- Scripting
- Filtering
- Historical output
- Remote SSH administration
- Recovery
- Troubleshooting Dozzle itself

The operational hierarchy is:

```text
Quick Observation
      │
      ▼
    Dozzle

Service Management
      │
      ▼
   dockerctl

Deep Troubleshooting
      │
      ▼
 Docker CLI
```

---

# 24. Restart Dozzle Only

If Dozzle itself requires maintenance:

```bash
cd ~/docker
./dockerctl restart infrastructure dozzle
```

Verify:

```bash
./dockerctl status infrastructure dozzle
```

Portainer should remain unaffected.

---

# 25. Stop Dozzle Only

Run:

```bash
./dockerctl stop infrastructure dozzle
```

Verify:

```bash
./dockerctl status infrastructure dozzle
```

This should not intentionally stop Portainer.

---

# 26. Start Dozzle Again

Run:

```bash
./dockerctl up infrastructure dozzle
```

Then verify:

```bash
./dockerctl status infrastructure dozzle
```

---

# 27. Restart Complete Infrastructure Stack

If both Portainer and Dozzle require maintenance:

```bash
./dockerctl restart infrastructure
```

This is different from:

```bash
./dockerctl restart infrastructure dozzle
```

The first restarts every service in the infrastructure stack.

The second restarts only Dozzle.

---

# 28. View Dozzle Logs

Using `dockerctl`:

```bash
./dockerctl logs infrastructure dozzle
```

Direct Docker:

```bash
docker logs dozzle --tail 100
```

Follow:

```bash
docker logs -f dozzle
```

Exit:

```text
Ctrl+C
```

---

# 29. Verify Docker Socket Mount

Inspect the container:

```bash
docker inspect dozzle
```

Search for:

```bash
docker inspect dozzle | grep docker.sock
```

Expected reference:

```text
/var/run/docker.sock
```

Structured view:

```bash
docker inspect dozzle \
  --format '{{json .Mounts}}' | jq
```

---

# 30. Verify Read-Only Socket Mapping

Inspect the mount details:

```bash
docker inspect dozzle \
  --format '{{json .Mounts}}' | jq
```

The Docker socket mount should correspond to the intended configuration.

The Compose definition should show:

```yaml
/var/run/docker.sock:/var/run/docker.sock:ro
```

---

# 31. Troubleshooting — Dozzle Not Running

Check all matching containers:

```bash
docker ps -a --filter "name=dozzle"
```

Inspect logs:

```bash
docker logs dozzle --tail 100
```

Validate Compose:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  config
```

Then retry:

```bash
./dockerctl up infrastructure dozzle
```

---

# 32. Troubleshooting — Port 8080 Unreachable

First check the container:

```bash
docker ps --filter "name=dozzle"
```

Check published ports:

```bash
docker ps --filter "name=dozzle" \
  --format "table {{.Names}}\t{{.Ports}}"
```

Check the Ubuntu listener:

```bash
sudo ss -lnt | grep 8080
```

From Windows:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 8080
```

Troubleshoot in this order:

```text
Dozzle Container
      │
      ▼
Docker Port Mapping
      │
      ▼
Ubuntu Network
      │
      ▼
Windows Connectivity
      │
      ▼
Browser
```

---

# 33. Troubleshooting — Containers Not Visible

If Dozzle opens but containers are missing, verify the Docker socket.

On Ubuntu:

```bash
ls -l /var/run/docker.sock
```

Check Docker:

```bash
docker ps
```

Inspect the Dozzle mount:

```bash
docker inspect dozzle | grep docker.sock
```

If the socket is not mounted correctly, Dozzle cannot discover the local Docker environment.

---

# 34. Troubleshooting — Logs Not Appearing

First determine whether the container itself is producing logs.

Example:

```bash
docker logs frigate --tail 20
```

If CLI logs are available but Dozzle shows none:

```text
Docker logging works
        │
        ▼
Investigate Dozzle
        │
        ├── socket mount
        ├── container state
        └── browser session
```

Restart Dozzle if required:

```bash
./dockerctl restart infrastructure dozzle
```

---

# 35. Troubleshooting — Container Name Changed

If services are recreated with a different container name or naming pattern, Dozzle may display them differently.

Verify:

```bash
docker ps \
  --format "table {{.Names}}\t{{.Image}}"
```

Dozzle reads the active Docker state rather than relying on static documentation.

---

# 36. Update Strategy

The current image uses:

```text
amir20/dozzle:latest
```

Using the `latest` tag means future image pulls may introduce a newer release.

To inspect the current image:

```bash
docker images | grep dozzle
```

Pull the configured tag:

```bash
docker pull amir20/dozzle:latest
```

Recreate only Dozzle:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  up -d dozzle
```

Verify:

```bash
./dockerctl status infrastructure dozzle
```

Logs:

```bash
./dockerctl logs infrastructure dozzle
```

For Production environments, a pinned image version may be preferable to an uncontrolled `latest` tag.

---

# 37. Resource Usage

Dozzle is designed to be relatively lightweight.

Check its current resource usage:

```bash
docker stats dozzle
```

This displays:

```text
CPU
Memory
Network I/O
Block I/O
PIDs
```

Exit using:

```text
Ctrl+C
```

---

# 38. Dozzle During HomeLab Startup

Dozzle starts as part of the infrastructure layer.

The complete HomeLab startup sequence is:

```text
Infrastructure
      │
      ├── Portainer
      └── Dozzle
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

Start everything:

```bash
cd ~/docker
./dockerctl start-all
```

Because Dozzle starts early, it can be used to observe logs from subsequent application services as they come online.

---

# 39. Dozzle During Troubleshooting

An example HomeLab workflow:

```text
Modify Frigate Configuration
          │
          ▼
Restart Frigate
          │
          ▼
./dockerctl restart frigate frigate
          │
          ▼
Open Dozzle
          │
          ▼
Watch Frigate Startup Logs
```

This provides immediate feedback after configuration changes.

---

# 40. Direct CLI Fallback

If Dozzle is unavailable, logs can always be accessed directly.

Frigate:

```bash
docker logs frigate --tail 50
```

MQTT:

```bash
docker logs mqtt --tail 30
```

Home Assistant:

```bash
docker logs homeassistant --tail 50
```

Portainer:

```bash
docker logs portainer --tail 50
```

Dozzle itself:

```bash
docker logs dozzle --tail 50
```

---

# 41. Verification Checklist

| Verification | Command | Expected Result |
|---|---|---|
| Stack exists | `./dockerctl stacks` | `infrastructure` visible |
| Service exists | `./dockerctl services infrastructure` | `dozzle` visible |
| Compose config | `docker compose ... config` | No errors |
| Container state | `docker ps --filter "name=dozzle"` | Running |
| dockerctl status | `./dockerctl status infrastructure dozzle` | Running |
| Port 8080 | `ss -lnt \| grep 8080` | Listener visible |
| Windows connectivity | `Test-NetConnection <VM-IP> -Port 8080` | True |
| Browser access | `http://<VM-IP>:8080` | UI loads |
| Containers visible | Dozzle UI | Running containers listed |
| Frigate logs | Dozzle UI | Logs visible |
| MQTT logs | Dozzle UI | Logs visible |
| Docker socket | `docker inspect dozzle` | Socket mounted |
| Isolated restart | `./dockerctl restart infrastructure dozzle` | Dozzle restarts only |
| Portainer unaffected | `./dockerctl status infrastructure portainer` | Still running |

---

# 42. Final Validated State

The HomeLab observability flow is:

```text
Docker Containers
       │
       ▼
Docker Logging
       │
       ▼
Docker Socket
       │
       ▼
Dozzle
       │
       ▼
Browser-Based Live Logs
```

Dozzle is considered operational when:

- The container is running
- Port 8080 is reachable
- The web interface loads
- Running containers are visible
- Container logs can be streamed
- Frigate logs are accessible
- MQTT logs are accessible
- Home Assistant logs are accessible
- Docker socket access works
- Dozzle can be restarted independently
- Portainer and other services remain unaffected during Dozzle maintenance

---

# 43. Engineering Outcome

The infrastructure-management layer now provides two complementary interfaces:

```text
Docker Infrastructure
       │
       ├── Portainer
       │      │
       │      └── Container Management
       │
       └── Dozzle
              │
              └── Real-Time Logs
```

Together with `dockerctl` and Docker CLI:

```text
Portainer
   │
   └── Visual Management

Dozzle
   │
   └── Real-Time Logs

dockerctl
   │
   └── Controlled Lifecycle Management

Docker CLI
   │
   └── Deep Troubleshooting
```

This creates a practical operational toolkit for continued HomeAuto development.

---

# 44. Next Implementation Stage

With the infrastructure-management layer established, the next implementation stage is the messaging layer:

```text
Docker
   │
   ├── Portainer
   ├── Dozzle
   │
   │   COMPLETE
   ▼
Mosquitto MQTT
```

The next section documents **Mosquitto MQTT**, including:

- Compose deployment
- `smart_home_net`
- Port `1883`
- WebSocket `9001`
- Authentication
- Password file creation
- File permissions
- UID/GID `1883:1883`
- Publish/subscribe verification
- MQTT Explorer validation
- Startup errors encountered
- Permission failures
- Individual MQTT restart procedures
- Frigate and Home Assistant integration