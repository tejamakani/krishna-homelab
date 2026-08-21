---
title: Portainer Implementation
sidebar_label: Portainer
description: Portainer CE deployment, persistent storage, Docker socket access, HTTPS management, initial setup, troubleshooting, verification, and operational procedures for the Makani HomeAuto HomeLab.
---

# Portainer Implementation

**Portainer CE** provides the graphical container-management layer for the Makani HomeAuto HomeLab.

Docker and Docker Compose remain the underlying runtime and orchestration tools, but Portainer provides a browser-based interface for inspecting and managing the container environment.

```text
Administrator
     │
     ▼
Web Browser
     │
     ▼
Portainer
     │
     ▼
Docker Socket
     │
     ▼
Docker Engine
     │
     ├── Containers
     ├── Images
     ├── Networks
     └── Volumes
```

Portainer is deployed as part of the HomeLab infrastructure stack.

---

# 1. Purpose

Portainer was introduced to provide:

- Browser-based Docker management
- Container visibility
- Container lifecycle operations
- Image visibility
- Network visibility
- Volume visibility
- Stack inspection
- Runtime status
- Basic troubleshooting
- Easier day-to-day HomeLab administration

Portainer complements, rather than replaces, Docker CLI operations.

The operational model is:

```text
Routine Visibility / Administration
             │
             ▼
         Portainer

Detailed Troubleshooting
             │
             ▼
        Docker CLI
```

---

# 2. Current Deployment Model

Portainer is deployed inside:

```text
~/docker/stacks/infrastructure.yml
```

The infrastructure stack contains:

```text
Infrastructure Stack
       │
       ├── Portainer
       └── Dozzle
```

Portainer currently uses:

```text
portainer/portainer-ce:lts
```

The primary management interface is exposed on:

```text
TCP 9443
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

The infrastructure stack should appear in the output.

Verify services defined inside it:

```bash
./dockerctl services infrastructure
```

Expected services should include:

```text
portainer
dozzle
```

---

# 4. Inspect the Infrastructure Compose File

Display the current stack definition:

```bash
cat ~/docker/stacks/infrastructure.yml
```

Before starting the stack, validate the Compose configuration:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  config
```

If the configuration is valid, Docker Compose prints the normalized configuration.

---

# 5. Portainer Compose Pattern

The Portainer service follows a structure similar to:

```yaml
services:

  portainer:
    image: portainer/portainer-ce:lts
    container_name: portainer

    restart: unless-stopped

    ports:
      - "9443:9443"

    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ../portainer/data:/data

    networks:
      - infra_net

networks:
  infra_net:
    external: true
```

The active HomeLab Compose file should remain the authoritative source for exact values.

---

# 6. Why the Docker Socket Is Mounted

Portainer requires access to the Docker daemon.

The standard local Docker socket is:

```text
/var/run/docker.sock
```

Portainer mounts it inside the container:

```yaml
- /var/run/docker.sock:/var/run/docker.sock
```

This allows Portainer to query and manage:

- Containers
- Images
- Networks
- Volumes
- Docker runtime state

The relationship is:

```text
Portainer Container
       │
       ▼
/var/run/docker.sock
       │
       ▼
Docker Daemon
       │
       ▼
HomeLab Containers
```

Because Docker socket access effectively provides control over the Docker host, access to Portainer should be treated as privileged administrative access.

---

# 7. Persistent Portainer Data

Portainer configuration must survive container recreation.

Persistent data is therefore stored outside the disposable container filesystem.

Typical mapping:

```yaml
- ../portainer/data:/data
```

This stores Portainer state under the Docker project directory.

Verify the directory:

```bash
ls -ld ~/docker/portainer
```

or, where applicable:

```bash
ls -ld ~/docker/portainer/data
```

---

# 8. Why Persistence Matters

Without persistent storage:

```text
Delete Portainer Container
          │
          ▼
Portainer Configuration Lost
```

With persistent storage:

```text
Delete / Recreate Portainer Container
          │
          ▼
Persistent /data
          │
          ▼
Portainer Configuration Restored
```

The Portainer container itself should therefore be considered replaceable.

The persistent data directory is the important asset.

---

# 9. Verify Infrastructure Network

Portainer is connected to the infrastructure network.

Check:

```bash
docker network ls
```

Expected network:

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

Verify again:

```bash
docker network ls
```

---

# 10. Start the Infrastructure Stack

Using the preferred service controller:

```bash
cd ~/docker
./dockerctl up infrastructure
```

This starts:

```text
Portainer
Dozzle
```

without starting unrelated HomeLab application stacks.

Direct Docker Compose equivalent:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  up -d
```

---

# 11. Start Portainer Only

The enhanced `dockerctl` controller allows Portainer to be started independently.

```bash
./dockerctl up infrastructure portainer
```

This starts Portainer without intentionally starting or restarting Dozzle.

---

# 12. Verify Portainer Container

Run:

```bash
docker ps --filter "name=portainer"
```

A broader view:

```bash
docker ps \
  --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

Portainer should appear with a running status.

---

# 13. Verify Portainer Through dockerctl

Run:

```bash
./dockerctl status infrastructure portainer
```

This queries Portainer through the infrastructure Compose stack.

For the complete infrastructure stack:

```bash
./dockerctl status infrastructure
```

---

# 14. Verify Port 9443

On Ubuntu:

```bash
sudo ss -lnt | grep 9443
```

Docker can also show the published mapping:

```bash
docker ps --filter "name=portainer" \
  --format "table {{.Names}}\t{{.Ports}}"
```

Expected mapping should include:

```text
9443
```

---

# 15. Verify Portainer from Windows

From Windows PowerShell:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 9443
```

Expected:

```text
TcpTestSucceeded : True
```

This validates:

```text
Windows Browser
      │
      ▼
VM Network
      │
      ▼
Ubuntu
      │
      ▼
Docker Port Publishing
      │
      ▼
Portainer
```

---

# 16. Access Portainer

From a browser:

```text
https://<UBUNTU_VM_IP>:9443
```

Example format:

```text
https://192.168.x.x:9443
```

Portainer uses HTTPS for the management interface.

A browser certificate warning may appear when using the default self-signed certificate.

Confirm that the address is the expected HomeLab VM before proceeding.

---

# 17. Initial Administrator Setup

On the first successful Portainer launch, the browser presents the administrator-account setup page.

The initial setup requires creating:

```text
Administrator Username
Administrator Password
```

After submitting the configuration, Portainer creates the initial administrative account.

The account should use a strong password because Portainer provides privileged Docker management access.

---

# 18. Initial Setup Timeout Encountered

During the HomeLab deployment, the Portainer initial setup screen was encountered multiple times.

Portainer logs indicated behavior associated with the administrator setup state.

One observed condition was effectively:

```text
No administrator account configured
```

Portainer also enforces a limited initial setup window.

If the setup page remains open for too long without completing the administrator configuration, the setup session can expire.

The browser may then no longer complete the initial account creation until the service is restarted.

---

# 19. Recover from Portainer Setup Timeout

If the initial administrator setup expires, restart Portainer only:

```bash
cd ~/docker
./dockerctl restart infrastructure portainer
```

Then verify:

```bash
./dockerctl status infrastructure portainer
```

Open:

```text
https://<UBUNTU_VM_IP>:9443
```

again and complete the administrator setup promptly.

This is preferable to restarting the complete infrastructure stack.

---

# 20. Verify Portainer Logs

Using the service controller:

```bash
./dockerctl logs infrastructure portainer
```

Direct Docker alternative:

```bash
docker logs portainer --tail 100
```

Follow logs:

```bash
docker logs -f portainer
```

Exit:

```text
Ctrl+C
```

Logs are useful for identifying:

- Setup timeout
- Startup failures
- Docker socket access problems
- Database initialization
- HTTPS listener status
- Persistent-data errors

---

# 21. Browser Console Warning Encountered

During initial Portainer setup, the browser developer console showed a Content Security Policy warning related to Angular behavior such as blocked:

```text
eval()
```

This browser-side warning was not itself evidence of a Docker or Portainer container failure.

The more useful validation points were:

```text
Container state
Port 9443
Portainer logs
Initial admin state
Browser access
```

Troubleshooting should therefore prioritize the service state rather than isolated browser-console warnings.

---

# 22. Verify Docker Socket Mapping

Inspect Portainer:

```bash
docker inspect portainer
```

Search for the socket mapping:

```bash
docker inspect portainer | grep docker.sock
```

Expected:

```text
/var/run/docker.sock
```

A more structured view:

```bash
docker inspect portainer \
  --format '{{json .Mounts}}' | jq
```

Do not publish complete inspection output without reviewing it for sensitive information.

---

# 23. Verify Persistent Data Mapping

Run:

```bash
docker inspect portainer \
  --format '{{json .Mounts}}' | jq
```

Confirm that:

```text
/data
```

maps to the intended persistent host location.

---

# 24. Portainer Login Verification

After initial administrator setup, access:

```text
https://<UBUNTU_VM_IP>:9443
```

Log in with the configured administrator account.

The local Docker environment should become visible.

Verify that Portainer can display:

```text
Containers
Images
Networks
Volumes
```

---

# 25. Verify Container Visibility

Inside Portainer:

```text
Environments
     │
     ▼
Local Docker
     │
     ▼
Containers
```

The currently deployed HomeAuto containers should be visible.

Typical HomeLab services include:

```text
portainer
dozzle
mqtt
frigate
homeassistant
webssh
```

The exact list depends on which stacks are running.

---

# 26. Verify Image Visibility

Inside Portainer:

```text
Images
```

The interface should display downloaded container images.

Current HomeLab images include examples such as:

```text
portainer/portainer-ce:lts
amir20/dozzle
eclipse-mosquitto
Frigate image
Home Assistant image
```

---

# 27. Verify Docker Networks

Inside Portainer:

```text
Networks
```

Verify that the HomeAuto networks are visible:

```text
infra_net
smart_home_net
```

This provides a useful graphical view of Docker networking.

---

# 28. Verify Volumes / Bind-Mounted Data

Portainer can also expose Docker-managed volumes and container mount information.

However, much of the HomeLab persistent configuration is maintained through host bind mounts under:

```text
~/docker/
```

The Linux filesystem remains the authoritative location for those files.

---

# 29. Portainer Role in Daily Operations

Portainer is useful for:

```text
Quick container status
      │
      ├── Running
      ├── Stopped
      ├── Restarting
      └── Unhealthy

Container inspection
      │
      ├── Image
      ├── Ports
      ├── Networks
      └── Mounts

Basic operations
      │
      ├── Start
      ├── Stop
      └── Restart
```

However, HomeAuto's preferred controlled operations remain:

```bash
./dockerctl
```

because `dockerctl` understands the HomeLab stack organization and provides repeatable service-level commands.

---

# 30. Portainer vs dockerctl

The roles are different.

## Portainer

Best suited for:

- Visual inspection
- Container overview
- Network visualization
- Image visibility
- Basic interactive administration

## dockerctl

Best suited for:

- Repeatable operational commands
- Dependency-aware startup
- Graceful shutdown
- Stack-level operations
- Individual-service restart
- Scriptable administration

The preferred HomeAuto model is:

```text
Visualization
     │
     ▼
Portainer

Operations
     │
     ▼
dockerctl

Deep Troubleshooting
     │
     ▼
Docker CLI
```

---

# 31. Restart Portainer Only

If Portainer itself requires maintenance:

```bash
cd ~/docker
./dockerctl restart infrastructure portainer
```

Verify:

```bash
./dockerctl status infrastructure portainer
```

Inspect:

```bash
./dockerctl logs infrastructure portainer
```

This does not intentionally restart:

```text
Dozzle
MQTT
Frigate
Home Assistant
WebSSH
```

---

# 32. Stop Portainer Only

Run:

```bash
./dockerctl stop infrastructure portainer
```

Verify:

```bash
./dockerctl status infrastructure portainer
```

Dozzle should remain operational if it was already running.

---

# 33. Start Portainer Again

Run:

```bash
./dockerctl up infrastructure portainer
```

Then:

```bash
./dockerctl status infrastructure portainer
```

---

# 34. Restart Complete Infrastructure Stack

If both Portainer and Dozzle require a restart:

```bash
./dockerctl restart infrastructure
```

This is different from:

```bash
./dockerctl restart infrastructure portainer
```

The first restarts the whole stack.

The second restarts only Portainer.

---

# 35. Direct Docker Fallback

If `dockerctl` cannot be used:

```bash
docker restart portainer
```

Verify:

```bash
docker ps --filter "name=portainer"
```

Logs:

```bash
docker logs portainer --tail 100
```

This is the direct recovery path.

---

# 36. Troubleshooting — Portainer Not Running

Check:

```bash
docker ps -a --filter "name=portainer"
```

Inspect logs:

```bash
docker logs portainer --tail 100
```

Validate Compose:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  config
```

Then try:

```bash
./dockerctl up infrastructure portainer
```

---

# 37. Troubleshooting — Port 9443 Unreachable

Check the container:

```bash
docker ps --filter "name=portainer"
```

Check published ports:

```bash
docker ps --filter "name=portainer" \
  --format "table {{.Names}}\t{{.Ports}}"
```

Check Ubuntu listener:

```bash
sudo ss -lnt | grep 9443
```

From Windows:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 9443
```

This isolates whether the issue exists at:

```text
Container
   │
   ▼
Docker Port Mapping
   │
   ▼
Ubuntu
   │
   ▼
VM Network
   │
   ▼
Windows Browser
```

---

# 38. Troubleshooting — Docker Environment Missing

If Portainer opens but the local Docker environment is unavailable, verify the Docker socket.

Check Docker itself:

```bash
docker ps
```

Check socket:

```bash
ls -l /var/run/docker.sock
```

Inspect container mount:

```bash
docker inspect portainer | grep docker.sock
```

If the socket is missing from the Portainer Compose definition, Portainer cannot manage the local Docker engine.

---

# 39. Troubleshooting — Persistent Data

If Portainer unexpectedly behaves as though it is a new installation, inspect the `/data` mount.

```bash
docker inspect portainer \
  --format '{{json .Mounts}}' | jq
```

Verify the host-side directory exists.

Example:

```bash
ls -lah ~/docker/portainer/data
```

A missing or incorrect persistent mount can cause configuration loss after container recreation.

---

# 40. Troubleshooting — Setup Screen Reappears

If the initial administrator setup screen unexpectedly appears again, investigate whether:

```text
Portainer persistent data exists
/data is mounted correctly
Portainer database exists
The container was pointed to a different host directory
```

Do not simply recreate the administrator account without first understanding why existing state was not loaded.

---

# 41. Upgrade Strategy

Portainer currently uses:

```text
portainer/portainer-ce:lts
```

Before upgrading:

```bash
cd ~/docker
```

Validate current state:

```bash
./dockerctl status infrastructure portainer
```

Back up persistent data where appropriate.

Then pull the updated image:

```bash
docker pull portainer/portainer-ce:lts
```

Recreate the service using Compose:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/infrastructure.yml \
  up -d portainer
```

Verify:

```bash
./dockerctl status infrastructure portainer
```

and:

```bash
./dockerctl logs infrastructure portainer
```

Version upgrades should be performed deliberately rather than using uncontrolled automatic updates.

---

# 42. Portainer Security Considerations

Portainer provides privileged Docker management access.

Security considerations include:

- Strong administrator password
- Restrict management access to trusted networks
- Avoid exposing Portainer directly to the public Internet
- Protect the Ubuntu VM
- Protect Docker socket access
- Back up persistent Portainer data
- Use HTTPS
- Review user accounts and permissions

The preferred architecture is:

```text
Trusted Admin Device
        │
        ▼
Private / Secure Network
        │
        ▼
Portainer :9443
        │
        ▼
Docker Host
```

Not:

```text
Public Internet
      │
      ▼
Open Portainer
```

Remote access should be provided through a secure VPN or similar trusted-access mechanism.

---

# 43. Verification Checklist

| Verification | Command | Expected Result |
|---|---|---|
| Stack exists | `./dockerctl stacks` | `infrastructure` visible |
| Service exists | `./dockerctl services infrastructure` | `portainer` visible |
| Compose validation | `docker compose ... config` | No errors |
| Container state | `docker ps --filter "name=portainer"` | Running |
| Stack status | `./dockerctl status infrastructure portainer` | Running |
| Port | `ss -lnt \| grep 9443` | Listener visible |
| Windows connectivity | `Test-NetConnection <VM-IP> -Port 9443` | True |
| Browser access | `https://<VM-IP>:9443` | Login page |
| Admin login | Browser | Successful |
| Docker visibility | Portainer UI | Containers visible |
| Networks | Portainer UI | Networks visible |
| Socket mapping | `docker inspect portainer` | docker.sock mounted |
| Persistent data | `docker inspect portainer` | `/data` mapped |
| Logs | `./dockerctl logs infrastructure portainer` | No critical errors |
| Isolated restart | `./dockerctl restart infrastructure portainer` | Portainer restarts only |

---

# 44. Final Validated State

The HomeLab management architecture is now:

```text
Administrator
      │
      ▼
Portainer HTTPS :9443
      │
      ▼
Docker Socket
      │
      ▼
Docker Engine
      │
      ├── Portainer
      ├── Dozzle
      ├── MQTT
      ├── Frigate
      ├── Home Assistant
      └── WebSSH
```

Portainer is considered operational when:

- The container is running
- Port 9443 is reachable
- The administrator can authenticate
- The local Docker environment is visible
- Containers are visible
- Docker networks are visible
- Persistent `/data` storage is mounted
- Docker socket access is functional
- Portainer can be restarted independently
- Other HomeAuto services are unaffected during Portainer-only maintenance

---

# 45. Engineering Outcome

Portainer provides a graphical operational view of the Docker platform without changing the underlying HomeAuto management philosophy.

The operational hierarchy remains:

```text
Portainer
   │
   └── Visual management and inspection

dockerctl
   │
   └── Controlled lifecycle operations

Docker CLI
   │
   └── Deep troubleshooting and recovery
```

This separation provides both convenience and operational control.

---

# 46. Next Implementation Stage

With Portainer operational, the next infrastructure component is:

```text
Docker Infrastructure
       │
       ├── Portainer
       │      COMPLETE
       │
       ▼
     Dozzle
```

The next section documents **Dozzle**, including Docker socket access, browser-based real-time logs, port `8080`, deployment through the infrastructure stack, isolated restart procedures, verification, and troubleshooting.