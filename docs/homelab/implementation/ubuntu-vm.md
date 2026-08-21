---
title: Ubuntu VM Implementation
sidebar_label: Ubuntu VM
description: Ubuntu Server 24.04 LTS installation, preparation, networking, SSH access, package updates, Docker prerequisites, and validation for the Makani HomeAuto HomeLab.
---

# Ubuntu VM Implementation

The **Ubuntu Server VM** provides the primary Linux application platform for the Makani HomeAuto HomeLab.

Rather than running smart-home and AI services directly on Windows, the HomeLab isolates those workloads inside Ubuntu.

```text
Windows 11 Host
       │
       ▼
Virtualization Layer
       │
       ▼
Ubuntu Server 24.04 LTS
       │
       ▼
Docker Engine
       │
       ├── Portainer
       ├── Dozzle
       ├── Mosquitto MQTT
       ├── Frigate AI
       ├── Home Assistant
       └── WebSSH
```

Ubuntu therefore forms the boundary between the physical Windows host and the containerized HomeAuto application stack.

---

# 1. Purpose

The Ubuntu VM provides:

- Linux operating environment
- Docker runtime platform
- Docker Compose
- Persistent application storage
- Container networking
- Service lifecycle management
- AI application hosting
- MQTT services
- Home Assistant services
- Remote administration
- HomeAuto development and troubleshooting environment

The VM allows application services to remain independent from the Windows host.

---

# 2. Current VM Profile

The current HomeLab Ubuntu VM allocation is:

| Resource | Configuration |
|---|---:|
| Operating System | Ubuntu Server 24.04 LTS |
| vCPU | 4 |
| Memory | 8 GB |
| Storage | 80 GB |
| Primary User | `teju` |
| Hostname | `Ubuntu-Frigate` |

The VM shell is typically accessed as:

```text
teju@Ubuntu-Frigate
```

---

# 3. VM Architecture

The HomeLab platform is layered as follows:

```text
Physical Hardware
       │
       ▼
Windows 11
       │
       ▼
Virtual Machine
       │
       ▼
Ubuntu Server 24.04
       │
       ├── Linux networking
       ├── systemd
       ├── SSH
       ├── Docker
       ├── Docker Compose
       └── HomeAuto files
```

The Ubuntu VM is intentionally treated as an application platform rather than a desktop environment.

---

# 4. Ubuntu Server Installation

Create the virtual machine using the Ubuntu Server installation ISO.

During installation, configure:

- Language
- Keyboard layout
- Network interface
- Storage
- Hostname
- Administrative user
- Password
- OpenSSH Server where available

Recommended hostname:

```text
Ubuntu-Frigate
```

Example administrative account:

```text
teju
```

After installation completes, reboot into the new system.

---

# 5. Verify Ubuntu Version

Run:

```bash
lsb_release -a
```

Expected platform:

```text
Ubuntu 24.04 LTS
```

Alternative:

```bash
cat /etc/os-release
```

Example fields:

```text
NAME="Ubuntu"
VERSION="24.04 LTS"
ID=ubuntu
```

Kernel information:

```bash
uname -a
```

---

# 6. Verify Hostname

Run:

```bash
hostname
```

Expected:

```text
Ubuntu-Frigate
```

For additional information:

```bash
hostnamectl
```

This displays:

- Hostname
- Operating system
- Kernel
- Architecture
- Virtualization environment

---

# 7. Verify Current User

Run:

```bash
whoami
```

Expected:

```text
teju
```

Check groups:

```bash
groups
```

Later, Docker access may require membership in the `docker` group.

---

# 8. Verify CPU Allocation

Run:

```bash
nproc
```

Expected:

```text
4
```

Detailed CPU information:

```bash
lscpu
```

Useful fields include:

```text
CPU(s)
Model name
Thread(s) per core
Core(s) per socket
Virtualization
Hypervisor vendor
```

---

# 9. Verify Memory Allocation

Run:

```bash
free -h
```

The VM should report approximately:

```text
8 GB RAM
```

For raw information:

```bash
cat /proc/meminfo | head
```

Interactive monitoring:

```bash
top
```

or, if installed:

```bash
htop
```

---

# 10. Verify Storage

Run:

```bash
lsblk
```

Then:

```bash
df -h
```

The VM should provide approximately:

```text
80 GB virtual storage
```

Important directories that eventually consume storage include:

```text
/var/lib/docker
/home/teju/docker
/media/frigate
Home Assistant data
Mosquitto persistence
Logs
```

Frigate recordings can become the dominant storage consumer as camera retention increases.

---

# 11. Check Filesystem Utilization

Run:

```bash
df -h /
```

Example output structure:

```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/...         ...   ...   ...  ... /
```

Docker storage can be inspected later using:

```bash
docker system df
```

---

# 12. Network Interface Verification

Run:

```bash
ip -br addr
```

Example:

```text
lo       UNKNOWN    127.0.0.1/8
ens33    UP         192.168.x.x/24
```

For full details:

```bash
ip addr
```

The main interface should show:

```text
State: UP
IPv4 address assigned
Correct subnet
```

---

# 13. Verify Default Route

Run:

```bash
ip route
```

Expected structure:

```text
default via <gateway> dev <interface>
<local-network> dev <interface>
```

The default route is required for:

- Ubuntu package downloads
- Docker image pulls
- HACS
- Home Assistant updates
- External integrations
- Frigate image downloads

---

# 14. Test Gateway Connectivity

Run:

```bash
ping -c 4 <gateway-ip>
```

Example:

```bash
ping -c 4 192.168.1.1
```

Successful replies confirm local Layer-3 connectivity.

---

# 15. Test Internet Connectivity

Run:

```bash
ping -c 4 8.8.8.8
```

If successful, IP routing is working.

Then test DNS:

```bash
ping -c 4 google.com
```

or:

```bash
getent hosts github.com
```

The troubleshooting sequence should be:

```text
Interface
   │
   ▼
IP Address
   │
   ▼
Default Route
   │
   ▼
Gateway
   │
   ▼
Internet
   │
   ▼
DNS
```

---

# 16. Determine Ubuntu VM IP

Run:

```bash
hostname -I
```

or:

```bash
ip -br addr
```

Record the primary LAN address because it is used to access HomeAuto services.

Typical access pattern:

```text
http://<UBUNTU_VM_IP>:PORT
```

---

# 17. Verify Connectivity from Windows

From Windows PowerShell:

```powershell
ping <UBUNTU_VM_IP>
```

Then verify TCP connectivity to SSH:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 22
```

Expected:

```text
TcpTestSucceeded : True
```

---

# 18. OpenSSH Server Verification

Check SSH:

```bash
sudo systemctl status ssh
```

Expected:

```text
active (running)
```

If SSH is not installed:

```bash
sudo apt update
sudo apt install openssh-server -y
```

Enable it:

```bash
sudo systemctl enable ssh
```

Start it:

```bash
sudo systemctl start ssh
```

Verify again:

```bash
sudo systemctl status ssh
```

---

# 19. SSH Access from Windows

From PowerShell:

```powershell
ssh teju@<UBUNTU_VM_IP>
```

Example:

```powershell
ssh teju@192.168.x.x
```

On first connection, SSH may display a host-key prompt.

Confirm the fingerprint only if the VM address and host are expected.

After login:

```text
teju@Ubuntu-Frigate:~$
```

---

# 20. Update Ubuntu Packages

Before installing application dependencies:

```bash
sudo apt update
```

Then:

```bash
sudo apt upgrade -y
```

If package cleanup is required:

```bash
sudo apt autoremove -y
```

This keeps the base VM current before Docker and HomeAuto services are installed.

---

# 21. Reboot After Major Updates

If kernel or system-level packages were updated:

```bash
sudo reboot
```

Reconnect after the VM returns:

```powershell
ssh teju@<UBUNTU_VM_IP>
```

Verify uptime:

```bash
uptime
```

---

# 22. Verify Time and Timezone

Run:

```bash
timedatectl
```

This shows:

- Local time
- Universal time
- Time zone
- NTP state

Accurate time is important for:

- Frigate events
- Camera recordings
- Home Assistant automations
- Logs
- MQTT timestamps
- Troubleshooting

---

# 23. NTP Synchronization

Check:

```bash
timedatectl status
```

Look for:

```text
System clock synchronized: yes
NTP service: active
```

Enable network time synchronization if required:

```bash
sudo timedatectl set-ntp true
```

---

# 24. Verify DNS Configuration

Run:

```bash
resolvectl status
```

or:

```bash
cat /etc/resolv.conf
```

Test:

```bash
getent hosts github.com
```

A working DNS resolver is required for Docker Hub and Ubuntu repositories.

---

# 25. Create the HomeAuto Docker Workspace

The HomeLab application workspace is located under:

```text
/home/teju/docker
```

Create it if required:

```bash
mkdir -p ~/docker
```

Enter it:

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

# 26. Create Stack Directory

Create:

```bash
mkdir -p ~/docker/stacks
```

Verify:

```bash
ls -ld ~/docker/stacks
```

The stack directory eventually contains:

```text
frigate.yml
homeassistant.yml
infrastructure.yml
mqtt.yml
webssh.yml
```

---

# 27. HomeAuto Directory Structure

The current environment follows a structure similar to:

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
└── ...
```

This keeps service definitions and persistent data separate.

---

# 28. Install Basic Administration Tools

Useful packages include:

```bash
sudo apt install -y \
  curl \
  wget \
  git \
  jq \
  nano \
  unzip \
  ca-certificates \
  gnupg \
  lsb-release
```

These utilities are used throughout the HomeLab implementation.

---

# 29. Verify Installed Tools

Run:

```bash
curl --version
```

```bash
git --version
```

```bash
jq --version
```

```bash
nano --version
```

These tools later support API testing, Git workflows, JSON inspection, and configuration editing.

---

# 30. Verify sudo Access

Run:

```bash
sudo whoami
```

Expected:

```text
root
```

The terminal will normally not display password characters while typing the sudo password.

This is standard Linux behavior.

---

# 31. Check systemd State

Run:

```bash
systemctl is-system-running
```

Typical healthy states include:

```text
running
```

or sometimes:

```text
degraded
```

If degraded:

```bash
systemctl --failed
```

Investigate failed services before deploying HomeAuto workloads.

---

# 32. Check Ubuntu Firewall

Run:

```bash
sudo ufw status
```

Possible default state:

```text
Status: inactive
```

If UFW is enabled, required service ports must be explicitly permitted.

Do not blindly disable the firewall in a Production environment.

For the Lab, document any rules that are added.

---

# 33. Docker Prerequisite Check

Before Docker installation, verify:

```bash
uname -m
```

Expected architecture is generally:

```text
x86_64
```

Check package architecture:

```bash
dpkg --print-architecture
```

Typical:

```text
amd64
```

---

# 34. Docker Installation State

The current HomeLab ultimately reached:

```text
Docker 29.1.3
```

and:

```text
Docker Compose v2.40.3+ds1
```

Verify Docker:

```bash
docker --version
```

Verify Compose:

```bash
docker compose version
```

---

# 35. Docker Service Verification

Run:

```bash
sudo systemctl status docker
```

The service should report:

```text
active (running)
```

The HomeLab previously showed Docker running as a systemd service and enabled for startup.

Verify enablement:

```bash
sudo systemctl is-enabled docker
```

Expected:

```text
enabled
```

---

# 36. Start Docker if Required

```bash
sudo systemctl start docker
```

Enable at boot:

```bash
sudo systemctl enable docker
```

Verify:

```bash
sudo systemctl status docker
```

---

# 37. Docker User Access

Check whether the user belongs to the Docker group:

```bash
groups teju
```

If `docker` is missing:

```bash
sudo usermod -aG docker teju
```

Then log out and back in, or restart the SSH session.

Verify:

```bash
groups
```

Test:

```bash
docker ps
```

The command should execute without requiring `sudo`.

---

# 38. Docker Hello-World Verification

Where appropriate:

```bash
docker run --rm hello-world
```

This validates:

```text
Docker CLI
   │
   ▼
Docker Engine
   │
   ▼
Container Image Pull
   │
   ▼
Container Execution
```

After verification, the container exits automatically.

---

# 39. Docker Compose Verification

Run:

```bash
docker compose version
```

The HomeLab uses the modern syntax:

```bash
docker compose
```

rather than the legacy:

```bash
docker-compose
```

---

# 40. Docker Compose Package Issue Encountered

During the initial Ubuntu setup, an attempt was made to install:

```text
docker-compose-plugin
```

but the package was not available from the active Ubuntu package sources.

The system reported an error similar to:

```text
Unable to locate package docker-compose-plugin
```

The legacy command:

```bash
docker-compose
```

was also not installed.

The working environment ultimately used:

```bash
docker compose
```

with Docker Compose v2.

This distinction is important throughout the HomeAuto documentation.

---

# 41. Verify Docker Information

Run:

```bash
docker info
```

This confirms:

- Docker server version
- Storage driver
- Cgroup configuration
- Kernel
- CPU allocation
- Memory
- Docker root directory

A concise view:

```bash
docker info | grep -E "Server Version|Storage Driver|Cgroup|CPUs|Total Memory|Docker Root Dir"
```

---

# 42. Docker Network Baseline

List Docker networks:

```bash
docker network ls
```

The HomeLab eventually uses external networks including:

```text
infra_net
smart_home_net
```

Create only if they do not already exist:

```bash
docker network create infra_net
```

```bash
docker network create smart_home_net
```

Verify:

```bash
docker network ls
```

---

# 43. Why External Networks Are Used

Separate Compose stacks need a shared communication layer.

```text
Infrastructure Stack
       │
       └──── infra_net

Smart Home Services
       │
       ├──── smart_home_net
       │
       ├── MQTT
       ├── Frigate
       └── Home Assistant
```

External networks allow independent Compose files to communicate without forcing every service into one large Compose project.

---

# 44. Environment File

The central environment file is stored at:

```text
/home/teju/docker/.env
```

Create:

```bash
nano ~/docker/.env
```

The exact secrets and credentials should not be committed to Git.

Typical variables may include:

```text
MQTT_PORT
MQTT_WEBSOCKET_PORT
```

and other deployment-specific values.

---

# 45. Protect Sensitive Files

Check permissions:

```bash
ls -la ~/docker/.env
```

Where appropriate:

```bash
chmod 600 ~/docker/.env
```

Do not publish:

- Passwords
- API tokens
- MQTT credentials
- Home Assistant secrets
- Camera passwords
- Private keys

---

# 46. Git Ignore Considerations

If the Docker workspace itself is ever version controlled, sensitive files should be excluded.

Example:

```text
.env
*.secret
secrets.yaml
passwordfile
```

Secrets should never be embedded into public GitHub documentation.

---

# 47. Service Controller Installation

The HomeLab uses the custom:

```text
~/docker/dockerctl
```

controller for stack and service lifecycle management.

Verify:

```bash
ls -lh ~/docker/dockerctl
```

Make executable if needed:

```bash
chmod +x ~/docker/dockerctl
```

Validate:

```bash
bash -n ~/docker/dockerctl
```

No output indicates valid Bash syntax.

---

# 48. Discover HomeLab Stacks

Run:

```bash
cd ~/docker
./dockerctl stacks
```

Expected current stack set:

```text
frigate
homeassistant
infrastructure
mqtt
webssh
```

---

# 49. Start Complete HomeLab

Once Docker and Compose are operational:

```bash
cd ~/docker
./dockerctl start-all
```

The configured startup sequence is:

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

---

# 50. Check Complete HomeLab Status

Run:

```bash
./dockerctl status
```

Also:

```bash
docker ps
```

Readable output:

```bash
docker ps \
  --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

---

# 51. Stop Complete HomeLab

Before shutting down Ubuntu:

```bash
cd ~/docker
./dockerctl stop-all
```

Verify:

```bash
docker ps
```

Then:

```bash
sudo shutdown -h now
```

---

# 52. Ubuntu VM Startup Procedure

Recommended sequence:

```text
Windows Host
     │
     ▼
Start Ubuntu VM
     │
     ▼
Login / SSH
     │
     ▼
Verify Network
     │
     ▼
Verify Docker
     │
     ▼
Start HomeAuto
```

Commands:

```bash
ip -br addr
```

```bash
systemctl status docker
```

```bash
cd ~/docker
./dockerctl start-all
```

```bash
./dockerctl status
```

---

# 53. Ubuntu VM Shutdown Procedure

Recommended sequence:

```text
HomeAuto Services
       │
       ▼
dockerctl stop-all
       │
       ▼
Verify containers
       │
       ▼
Ubuntu shutdown
       │
       ▼
Windows host shutdown if required
```

Commands:

```bash
cd ~/docker
./dockerctl stop-all
```

```bash
docker ps
```

Then:

```bash
sudo shutdown -h now
```

---

# 54. Individual Service Restart

A VM reboot is not required for ordinary application maintenance.

Frigate only:

```bash
./dockerctl restart frigate frigate
```

MQTT only:

```bash
./dockerctl restart mqtt mqtt
```

Home Assistant only:

```bash
./dockerctl restart homeassistant homeassistant
```

Portainer only:

```bash
./dockerctl restart infrastructure portainer
```

Dozzle only:

```bash
./dockerctl restart infrastructure dozzle
```

This keeps unrelated modules operational.

---

# 55. Linux Process Verification

Inspect processes:

```bash
ps aux
```

For Docker:

```bash
ps aux | grep dockerd
```

For targeted application state, use container tools rather than relying only on Linux process listings.

---

# 56. Listening Port Verification

Run:

```bash
sudo ss -lntup
```

or:

```bash
sudo ss -lnt
```

This identifies listening TCP sockets.

For a specific port:

```bash
sudo ss -lnt | grep 1883
```

or:

```bash
sudo ss -lnt | grep 9443
```

---

# 57. Disk Usage Investigation

If storage utilization grows:

```bash
df -h
```

Then:

```bash
sudo du -sh /var/lib/docker
```

Docker:

```bash
docker system df
```

Large HomeAuto data directories can be inspected using:

```bash
du -sh ~/docker/* 2>/dev/null
```

---

# 58. Memory Troubleshooting

Check:

```bash
free -h
```

Then:

```bash
top
```

For the largest processes:

```bash
ps aux --sort=-%mem | head -15
```

For Docker:

```bash
docker stats
```

This is especially useful while Frigate is running CPU-based AI processing.

---

# 59. CPU Troubleshooting

Run:

```bash
top
```

or:

```bash
ps aux --sort=-%cpu | head -15
```

Docker-specific:

```bash
docker stats
```

This helps identify high utilization caused by:

- Frigate detection
- Video decode
- Home Assistant
- Container workloads
- AI processing

---

# 60. Docker Troubleshooting

Check service:

```bash
systemctl status docker
```

Recent Docker daemon logs:

```bash
journalctl -u docker --since "30 minutes ago"
```

Restart Docker only when necessary:

```bash
sudo systemctl restart docker
```

Be aware that restarting Docker may interrupt multiple HomeAuto services.

Prefer individual service restarts using `dockerctl` wherever possible.

---

# 61. Network Troubleshooting

Check interface:

```bash
ip -br addr
```

Route:

```bash
ip route
```

Gateway:

```bash
ping -c 4 <gateway>
```

Internet:

```bash
ping -c 4 8.8.8.8
```

DNS:

```bash
getent hosts github.com
```

Ports:

```bash
sudo ss -lntup
```

---

# 62. SSH Troubleshooting

Check:

```bash
sudo systemctl status ssh
```

Restart if required:

```bash
sudo systemctl restart ssh
```

Verify port 22:

```bash
sudo ss -lnt | grep :22
```

From Windows:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 22
```

---

# 63. Sudo Password Behavior

Linux terminals intentionally do not display password characters when using:

```bash
sudo
```

For example:

```bash
sudo whoami
```

The terminal appears unchanged while the password is entered.

Successful authentication returns:

```text
root
```

This behavior was encountered during HomeLab administration and is normal.

---

# 64. Verification Checklist

| Test | Command | Expected Result |
|---|---|---|
| Ubuntu version | `lsb_release -a` | Ubuntu 24.04 LTS |
| Hostname | `hostname` | Ubuntu-Frigate |
| User | `whoami` | teju |
| CPU | `nproc` | 4 |
| Memory | `free -h` | ~8 GB |
| Storage | `df -h` | VM storage available |
| Interface | `ip -br addr` | Interface UP |
| Route | `ip route` | Default route present |
| Internet | `ping -c 4 8.8.8.8` | Successful |
| DNS | `getent hosts github.com` | Resolves |
| SSH | `systemctl status ssh` | Active |
| sudo | `sudo whoami` | root |
| Docker | `docker --version` | Docker available |
| Compose | `docker compose version` | Compose v2 available |
| Docker service | `systemctl status docker` | Active |
| Docker startup | `systemctl is-enabled docker` | enabled |
| Docker user access | `docker ps` | Runs without sudo |
| Networks | `docker network ls` | HomeAuto networks visible |
| dockerctl | `bash -n ~/docker/dockerctl` | No syntax errors |
| Stack discovery | `./dockerctl stacks` | Stacks displayed |
| Platform startup | `./dockerctl start-all` | Services started |
| Platform state | `./dockerctl status` | Services visible |

---

# 65. Final Validated State

The Ubuntu VM acts as the primary application operating system for the HomeLab.

```text
Ubuntu Server 24.04 LTS
          │
          ├── 4 vCPU
          ├── 8 GB RAM
          ├── 80 GB Storage
          ├── Network Connectivity
          ├── SSH
          ├── systemd
          ├── Docker Engine
          ├── Docker Compose
          │
          ▼
        dockerctl
          │
    ┌─────┼──────────────────────┐
    │     │                      │
    ▼     ▼                      ▼
Infrastructure   Messaging   Smart Home / AI
    │               │              │
    ▼               ▼              ▼
Portainer        Mosquitto       Frigate
Dozzle                         Home Assistant
                               WebSSH
```

The Ubuntu layer is considered ready when:

- Ubuntu boots normally
- SSH is available
- Networking is functional
- DNS resolution works
- Package management works
- Docker is active
- Docker starts automatically
- Docker Compose v2 is available
- External networks exist
- HomeAuto stack files are present
- `dockerctl` operates correctly
- Individual services can be restarted independently
- The complete HomeLab can start and stop gracefully

---

# 66. Next Implementation Stage

With Ubuntu prepared, the next implementation layer is:

```text
Windows Host
     │
     ▼
Ubuntu VM
     │
     │ COMPLETE
     ▼
Docker Platform
     │
     ▼
Containerized HomeAuto Services
```

The next section documents the **Docker implementation**, including Docker installation, Compose behavior, directory organization, external networks, multi-stack architecture, persistent data, container lifecycle, verification, and the transition from the original single Compose file into the current layered stack design.