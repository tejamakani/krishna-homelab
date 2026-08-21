---
title: Windows Host Implementation
sidebar_label: Windows Host
description: Windows 11 host preparation, virtualization validation, networking, hardware verification, and operational checks for the Makani HomeAuto HomeLab.
---

# Windows Host Implementation

The **Windows 11 Host** provides the physical compute foundation for the Makani HomeAuto HomeLab.

Rather than installing HomeAuto applications directly on Windows, the host provides the compute, memory, storage, networking, and virtualization resources required by the Ubuntu Server VM.

```text
Physical Hardware
       │
       ▼
Windows 11 Host
       │
       ▼
Virtualization Layer
       │
       ▼
Ubuntu Server VM
       │
       ▼
Docker Engine
       │
       ├── Portainer
       ├── Dozzle
       ├── Mosquitto MQTT
       ├── Frigate
       ├── Home Assistant
       └── WebSSH
```

The Windows host therefore acts primarily as the **compute and virtualization layer**, while Linux and Docker provide the HomeAuto application platform.

---

# 1. Purpose

The Windows host provides:

- Physical CPU resources
- System memory
- Storage
- Network connectivity
- Virtualization capability
- Access to test peripherals
- Administrative access to the Ubuntu VM
- Development access to the HomeAuto environment

Separating the HomeAuto applications from the host operating system provides a cleaner architecture:

```text
Windows
   │
   │  Physical / Virtualization Layer
   ▼
Ubuntu
   │
   │  Application Platform
   ▼
Docker
   │
   ▼
HomeAuto Services
```

This also allows the Ubuntu environment to be rebuilt, modified, or eventually migrated without redesigning the physical host.

---

# 2. Current Lab Architecture

The current HomeLab host architecture is:

```text
┌─────────────────────────────────────────────┐
│              Windows 11 Host                │
│                                             │
│   CPU                                       │
│   Memory                                    │
│   Storage                                   │
│   Network Adapter                           │
│                                             │
│          Virtualization Platform            │
│                    │                        │
│                    ▼                        │
│          Ubuntu Server 24.04 VM             │
│                                             │
│          4 vCPU                             │
│          8 GB RAM                           │
│          80 GB Storage                      │
│                    │                        │
└────────────────────┼────────────────────────┘
                     │
                     ▼
                Docker Engine
                     │
        ┌────────────┼─────────────┐
        │            │             │
        ▼            ▼             ▼
 Infrastructure     MQTT       Smart Home / AI
        │            │             │
        ▼            ▼             ▼
   Portainer      Mosquitto      Frigate
   Dozzle                      Home Assistant
```

The current Lab VM allocation is:

| Resource | Allocation |
|---|---:|
| vCPU | 4 |
| Memory | 8 GB |
| Storage | 80 GB |
| Guest OS | Ubuntu Server 24.04 LTS |

---

# 3. Windows Version Verification

Open PowerShell and run:

```powershell
winver
```

This opens the Windows version dialog.

For command-line information:

```powershell
Get-ComputerInfo |
Select-Object WindowsProductName, WindowsVersion, OsBuildNumber
```

Another quick check:

```powershell
systeminfo | Select-String "OS Name","OS Version"
```

The host should report the installed Windows 11 edition and build.

---

# 4. Hardware Inventory

Before allocating resources to the Ubuntu VM, verify the physical host configuration.

## CPU

Run:

```powershell
Get-CimInstance Win32_Processor |
Select-Object Name, NumberOfCores, NumberOfLogicalProcessors
```

Example output format:

```text
Name                        NumberOfCores  NumberOfLogicalProcessors
----                        -------------  -------------------------
<Processor Model>           <cores>        <threads>
```

The exact values should be recorded from the HomeLab host rather than hard-coded into the documentation.

---

# 5. Memory Verification

Run:

```powershell
Get-CimInstance Win32_ComputerSystem |
Select-Object @{
    Name="TotalRAM_GB"
    Expression={[math]::Round($_.TotalPhysicalMemory / 1GB, 2)}
}
```

To inspect installed memory modules:

```powershell
Get-CimInstance Win32_PhysicalMemory |
Select-Object Manufacturer, Capacity, Speed, DeviceLocator
```

This is useful when determining whether additional memory can be allocated to the Ubuntu VM later.

---

# 6. Storage Verification

Run:

```powershell
Get-Volume |
Where-Object DriveLetter |
Select-Object DriveLetter, FileSystemLabel,
@{
    Name="SizeGB"
    Expression={[math]::Round($_.Size / 1GB, 1)}
},
@{
    Name="FreeGB"
    Expression={[math]::Round($_.SizeRemaining / 1GB, 1)}
}
```

Verify that sufficient free storage exists for:

- Ubuntu virtual disk
- Docker images
- Container volumes
- Frigate recordings
- Frigate snapshots
- Home Assistant data
- Logs
- Future AI models

Video surveillance workloads can consume significantly more storage than ordinary HomeLab services, so storage utilization should be monitored as camera retention increases.

---

# 7. GPU Inventory

The HomeLab currently performs functional AI validation before hardware acceleration is introduced.

Identify available graphics hardware using:

```powershell
Get-CimInstance Win32_VideoController |
Select-Object Name, DriverVersion, AdapterRAM
```

This establishes the hardware baseline for future acceleration work.

Potential acceleration paths include:

```text
Frigate
   │
   ├── CPU Processing
   │       Current functional validation
   │
   ├── Coral TPU
   │       Planned detection acceleration
   │
   ├── Dedicated GPU
   │       Future evaluation
   │
   └── Intel Quick Sync
           Future evaluation where supported
```

Hardware acceleration should be introduced only after the camera, detection, LPR, and face-recognition workflows are functionally validated.

---

# 8. Virtualization Support Verification

The processor and firmware must support hardware virtualization.

Run:

```powershell
systeminfo
```

Inspect the bottom of the output for virtualization information.

Depending on the Windows configuration, relevant fields may include:

```text
Virtualization Enabled In Firmware
Second Level Address Translation
VM Monitor Mode Extensions
Data Execution Prevention Available
```

A shorter check can be performed using:

```powershell
Get-ComputerInfo -Property HyperVRequirement*
```

---

# 9. Check Virtualization from Task Manager

Virtualization can also be verified graphically.

Open:

```text
Task Manager
    ↓
Performance
    ↓
CPU
```

Check:

```text
Virtualization: Enabled
```

If virtualization is disabled, enable the appropriate virtualization feature in the system BIOS/UEFI.

Depending on the CPU/platform, this may appear as:

```text
Intel Virtualization Technology
Intel VT-x
AMD-V
SVM Mode
```

---

# 10. Windows Hypervisor State

If Hyper-V or Windows virtualization features are being used, inspect their state with:

```powershell
Get-WindowsOptionalFeature -Online |
Where-Object FeatureName -Match "Hyper-V|VirtualMachinePlatform" |
Select-Object FeatureName, State
```

This helps identify whether Windows hypervisor components are enabled.

> The exact virtualization platform used by the HomeLab should be documented separately from the Windows host once confirmed.

---

# 11. Network Adapter Inventory

The Ubuntu VM requires stable network access for:

- Docker image downloads
- Home Assistant access
- Frigate access
- Camera communication
- MQTT
- WebSSH
- Remote administration
- Future IoT integrations

Inspect Windows adapters:

```powershell
Get-NetAdapter |
Select-Object Name, InterfaceDescription, Status, LinkSpeed
```

Example:

```text
Name       InterfaceDescription             Status   LinkSpeed
----       --------------------             ------   ---------
Ethernet   <Adapter>                        Up       1 Gbps
```

---

# 12. Windows IP Configuration

Run:

```powershell
ipconfig /all
```

Record the active adapter's:

```text
IPv4 Address
Subnet Mask
Default Gateway
DNS Servers
DHCP State
```

A shorter PowerShell view is:

```powershell
Get-NetIPConfiguration
```

---

# 13. Test Local Network Connectivity

Verify the default gateway first.

Example:

```powershell
ping <default-gateway>
```

Then test Internet connectivity:

```powershell
ping 8.8.8.8
```

Test DNS resolution:

```powershell
Resolve-DnsName github.com
```

These tests separate three common problems:

```text
Gateway failure
      │
      └── Local network issue

Internet IP failure
      │
      └── Routing / ISP issue

DNS failure
      │
      └── DNS resolution issue
```

---

# 14. Ubuntu VM Network Design

For the HomeLab, the Ubuntu VM should be reachable from the local network wherever practical.

The desired communication path is:

```text
Home Network
     │
     ▼
Windows Host
     │
     ▼
Virtual Network Adapter
     │
     ▼
Ubuntu Server VM
     │
     ▼
Docker Services
```

Services hosted inside Ubuntu are then accessible through the Ubuntu VM IP and their published ports.

For example:

```text
Ubuntu-VM-IP:9443   → Portainer
Ubuntu-VM-IP:8080   → Dozzle
Ubuntu-VM-IP:1883   → MQTT
Ubuntu-VM-IP:5000   → Frigate
```

Actual published ports should always be confirmed from the current Compose configuration.

---

# 15. Find the Ubuntu VM IP Address

From the Ubuntu VM:

```bash
hostname -I
```

or:

```bash
ip addr
```

For a concise interface view:

```bash
ip -br addr
```

Example format:

```text
lo       UNKNOWN    127.0.0.1/8
ens33    UP         192.168.x.x/24
```

---

# 16. Test Windows-to-Ubuntu Connectivity

From Windows PowerShell:

```powershell
ping <UBUNTU_VM_IP>
```

Example:

```powershell
ping 192.168.x.x
```

Successful replies confirm basic IP connectivity between the Windows host and Ubuntu VM.

---

# 17. Test Ubuntu-to-Internet Connectivity

From Ubuntu:

```bash
ping -c 4 8.8.8.8
```

Then verify DNS:

```bash
ping -c 4 google.com
```

or:

```bash
getent hosts github.com
```

The VM requires working Internet connectivity for:

- Ubuntu package installation
- Docker installation
- Docker image pulls
- Home Assistant updates
- Frigate image pulls
- HACS
- Integration downloads

---

# 18. Test Application Ports from Windows

PowerShell's `Test-NetConnection` is useful for validating Docker services from the Windows host.

Portainer:

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

Successful connectivity should report:

```text
TcpTestSucceeded : True
```

This is an important verification because it confirms communication through multiple layers:

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
Docker Port Publishing
   │
   ▼
Container
```

---

# 19. Browser-Based Service Verification

Once Docker services are running, management interfaces can be tested from the Windows browser.

Typical access pattern:

```text
https://<UBUNTU_VM_IP>:9443
```

for Portainer.

Dozzle follows:

```text
http://<UBUNTU_VM_IP>:8080
```

Other application URLs should use the actual ports defined by their Compose configuration.

---

# 20. Camera Testing from the Windows Host

The HomeLab uses camera sources to validate Frigate before Production camera infrastructure is introduced.

During Lab testing, locally available camera sources can be used to validate:

- Stream ingestion
- Object detection
- Person detection
- Face recognition
- License Plate Recognition
- Recording
- Snapshots

The logical flow is:

```text
Test Camera
     │
     ▼
Camera Stream
     │
     ▼
Ubuntu / Docker
     │
     ▼
Frigate
     │
     ▼
AI Detection
```

When physical USB devices are involved, access depends on the virtualization platform's USB/device-redirection capabilities and should be validated separately.

---

# 21. Windows Firewall Considerations

Windows Defender Firewall normally does not need inbound rules simply to access services hosted by the Ubuntu VM.

However, when troubleshooting communication, inspect active profiles:

```powershell
Get-NetFirewallProfile |
Select-Object Name, Enabled, DefaultInboundAction, DefaultOutboundAction
```

Do not disable the Windows firewall as a routine troubleshooting method.

Instead, identify:

```text
Source
Destination
Protocol
Port
Direction
```

and create only the required rule if Windows itself is hosting or receiving the traffic.

---

# 22. Host Resource Monitoring

The Windows host should be monitored while Frigate and Home Assistant workloads are active.

Useful PowerShell commands include:

```powershell
Get-Counter '\Processor(_Total)\% Processor Time'
```

Memory:

```powershell
Get-Counter '\Memory\Available MBytes'
```

Disk:

```powershell
Get-Counter '\PhysicalDisk(_Total)\% Disk Time'
```

For interactive monitoring, use:

```text
Task Manager
    │
    └── Performance
          ├── CPU
          ├── Memory
          ├── Disk
          ├── Ethernet
          └── GPU
```

This is particularly useful while Frigate is operating without dedicated detection acceleration.

---

# 23. VM Resource Allocation

The current Ubuntu Lab VM allocation is:

```text
vCPU       4
RAM        8 GB
Storage    80 GB
```

These resources support the current functional HomeLab validation.

The objective at this stage is not to reproduce final Production sizing.

Instead:

```text
Lab
 │
 ├── Functional testing
 ├── Integration testing
 ├── Troubleshooting
 └── Performance observation

            ↓

Production

 ├── Final workload sizing
 ├── Hardware acceleration
 ├── Camera scale
 ├── Storage retention
 └── Availability requirements
```

---

# 24. Host Startup Procedure

The recommended HomeLab startup procedure is:

```text
Power On Windows Host
        │
        ▼
Verify Windows Network
        │
        ▼
Start Ubuntu VM
        │
        ▼
Verify Ubuntu Network
        │
        ▼
Verify Docker Engine
        │
        ▼
Run dockerctl
        │
        ▼
Start HomeAuto Services
        │
        ▼
Verify Service Health
```

After logging into Ubuntu:

```bash
systemctl status docker
```

Then:

```bash
cd ~/docker
```

Start the complete HomeLab:

```bash
./dockerctl start-all
```

Verify:

```bash
./dockerctl status
```

This starts the application stacks in their defined dependency order.

---

# 25. Host Shutdown Procedure

The HomeLab should be shut down gracefully rather than powering off Windows while application workloads remain active.

Recommended sequence:

```text
HomeAuto Running
      │
      ▼
Stop Docker Services
      │
      ▼
Verify Containers Stopped
      │
      ▼
Shutdown Ubuntu
      │
      ▼
Wait for VM Shutdown
      │
      ▼
Shutdown Windows
```

From Ubuntu:

```bash
cd ~/docker
./dockerctl stop-all
```

Verify:

```bash
docker ps
```

Then shut down Ubuntu:

```bash
sudo shutdown -h now
```

After the VM has fully stopped, Windows can be shut down normally.

---

# 26. Why Graceful Shutdown Matters

Services such as:

- Home Assistant
- Mosquitto
- Frigate
- Docker
- Databases
- Log services

may be writing data when the host is powered off.

The preferred process is therefore:

```text
Application Shutdown
        ↓
Container Shutdown
        ↓
Guest OS Shutdown
        ↓
Host Shutdown
```

rather than:

```text
Host Power Off
      ↓
Everything Terminates
```

---

# 27. Individual Service Maintenance

A full HomeLab restart is not required when only one application is being changed.

For example, after modifying Frigate configuration:

```bash
cd ~/docker
./dockerctl restart frigate frigate
```

Verify:

```bash
./dockerctl status frigate frigate
```

View logs:

```bash
./dockerctl logs frigate frigate
```

Other services remain intentionally unaffected.

The same model applies to MQTT:

```bash
./dockerctl restart mqtt mqtt
```

Home Assistant:

```bash
./dockerctl restart homeassistant homeassistant
```

Portainer:

```bash
./dockerctl restart infrastructure portainer
```

Dozzle:

```bash
./dockerctl restart infrastructure dozzle
```

The operating principle is:

> **Restart only what changed. Verify what restarted. Leave everything else running.**

---

# 28. Troubleshooting — VM Cannot Reach Internet

First check the Ubuntu address:

```bash
ip -br addr
```

Check routes:

```bash
ip route
```

Test gateway:

```bash
ping -c 4 <gateway-ip>
```

Test Internet:

```bash
ping -c 4 8.8.8.8
```

Test DNS:

```bash
getent hosts github.com
```

This provides a structured troubleshooting path:

```text
Interface
   ↓
IP Address
   ↓
Default Route
   ↓
Gateway
   ↓
Internet
   ↓
DNS
```

---

# 29. Troubleshooting — Windows Cannot Reach Ubuntu

From Windows:

```powershell
ping <UBUNTU_VM_IP>
```

Then inspect:

```powershell
arp -a
```

Test a known service:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 9443
```

On Ubuntu:

```bash
ip -br addr
```

and:

```bash
ss -lnt
```

For Docker-published services:

```bash
docker ps
```

The investigation should determine whether the problem exists at:

```text
Windows
   ↓
Virtual Network
   ↓
Ubuntu
   ↓
Docker
   ↓
Application
```

---

# 30. Troubleshooting — Application Unreachable

Do not immediately restart the entire VM.

First test the specific application.

For Frigate:

```bash
./dockerctl status frigate frigate
```

Then:

```bash
./dockerctl logs frigate frigate
```

From Windows:

```powershell
Test-NetConnection <UBUNTU_VM_IP> -Port 5000
```

If necessary:

```bash
./dockerctl restart frigate frigate
```

This isolates the fault without disrupting unrelated HomeAuto services.

---

# 31. Verification Checklist

| Test | Command | Expected Result |
|---|---|---|
| Windows version | `Get-ComputerInfo` | Windows information returned |
| CPU | `Get-CimInstance Win32_Processor` | CPU detected |
| Memory | `Get-CimInstance Win32_ComputerSystem` | RAM detected |
| Storage | `Get-Volume` | Storage available |
| GPU | `Get-CimInstance Win32_VideoController` | GPU(s) detected |
| Virtualization | `systeminfo` | Virtualization available/enabled |
| Network adapter | `Get-NetAdapter` | Active adapter Up |
| Windows IP | `Get-NetIPConfiguration` | Valid IP/gateway |
| Ubuntu IP | `ip -br addr` | Valid VM IP |
| Windows → Ubuntu | `ping <VM-IP>` | Successful connectivity |
| Ubuntu → Internet | `ping -c 4 8.8.8.8` | Successful connectivity |
| DNS | `getent hosts github.com` | Name resolved |
| Docker | `systemctl status docker` | Active |
| HomeLab status | `./dockerctl status` | Expected services visible |
| Portainer | `Test-NetConnection ... -Port 9443` | TCP succeeds |
| Dozzle | `Test-NetConnection ... -Port 8080` | TCP succeeds |
| MQTT | `Test-NetConnection ... -Port 1883` | TCP succeeds |
| Frigate | `Test-NetConnection ... -Port 5000` | TCP succeeds |

---

# 32. Final Validated State

The Windows host provides the physical foundation for the HomeAuto Lab.

```text
Windows 11 Host
       │
       ├── CPU
       ├── Memory
       ├── Storage
       ├── Networking
       └── Virtualization
              │
              ▼
       Ubuntu Server VM
              │
              ▼
          Docker Engine
              │
              ▼
          dockerctl
              │
       ┌──────┼──────────────┐
       ▼      ▼              ▼
 Infrastructure  Messaging   Applications
       │           │             │
       ▼           ▼             ▼
 Portainer      Mosquitto      Frigate
 Dozzle                     Home Assistant
                             WebSSH
```

The host layer is considered ready when:

- Windows operates normally
- Hardware virtualization is enabled
- The Ubuntu VM starts successfully
- The VM receives valid network connectivity
- Docker starts successfully
- HomeAuto stacks can be started through `dockerctl`
- Services are reachable from the Windows host
- Individual services can be maintained without restarting the complete platform

---

# 33. Next Implementation Stage

With the Windows host validated, the next layer is:

```text
Windows Host
     │
     │  COMPLETE
     ▼
Ubuntu Server VM
     │
     ▼
Docker Platform
```

The **Ubuntu VM implementation** documents the Linux installation, network configuration, system preparation, Docker prerequisites, SSH administration, package updates, and verification procedures required before Docker services are deployed.