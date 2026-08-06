---
sidebar_position: 2
title: Hardware
description: HomeLab hardware platform and production hardware recommendations
---
# 🖥️ Hardware Platform

The Makani HomeLab is built using enterprise-inspired hardware to support virtualization, AI-powered video analytics, smart home automation, and enterprise networking.

This page documents both the current HomeLab hardware and the recommended production hardware for a 20-camera deployment.

## Hardware Overview

The hardware platform has been designed around three principles:

- Performance
- Scalability
- Reliability

The HomeLab serves as a learning and development environment while following production-grade design principles. As the environment grows, the same architecture can scale into a dedicated production deployment supporting AI-assisted video surveillance, automation, monitoring, and centralized management.

## 🧪 HomeLab Hardware

| Component | Specification |
|-----------|---------------|
| Motherboard | ASRock Z390 Steel Legend |
| CPU | Intel Core i7-9700K *(Update with your actual CPU if different)* |
| Memory | 32 GB DDR4 *(64 GB recommended)* |
| Storage | 1 TB NVMe SSD |
| AI Accelerator | Google Coral M.2 Edge TPU |
| Recording Storage | 4 TB Surveillance HDD |
| Network | 1 GbE |
| UPS | 1000 VA |
| Hypervisor | Proxmox VE |
| Camera Capacity | 4–8 Cameras |

## 🏢 Production Hardware (20 Cameras)

| Component | Recommended Specification |
|-----------|---------------------------|
| Motherboard | ASUS Pro WS W680-ACE / ASRock Rack W680D4U / Supermicro X13 Series |
| CPU | Intel Core i7-14700 / Intel Core i9-14900 / Xeon Equivalent |
| Memory | 64 GB DDR5 ECC *(128 GB Recommended)* |
| AI Accelerator | Google Coral M.2 Edge TPU (1–2 Units) |
| System Drive | 1 TB Enterprise NVMe SSD |
| Recording Storage | 2 × 8 TB Surveillance HDD (RAID1) |
| Backup Storage | Dedicated NAS |
| Network | Dual 2.5 GbE / Dual 10 GbE |
| UPS | 1500–2200 VA Pure Sine Wave |
| Managed Switch | 24-Port Managed PoE+ Switch |
| Hypervisor | Proxmox VE |
| Camera Capacity | Up to 20 AI Cameras |

## Why These Components?

### Motherboard

Enterprise-grade workstation and server motherboards provide:

- ECC Memory Support
- Multiple PCIe Expansion Slots
- Multiple NVMe Storage Devices
- Better Linux Compatibility
- Higher Reliability
- Future Expansion

### Google Coral TPU

The Coral TPU dramatically reduces CPU utilization by offloading TensorFlow Lite object detection used by Frigate AI.

Benefits include:

- Faster AI inference
- Lower CPU usage
- More simultaneous cameras
- Lower power consumption

### Enterprise Storage

Separating the operating system from recording storage improves reliability and makes future upgrades easier.

Recommended layout:

- NVMe SSD → Operating System and Virtual Machines
- Surveillance HDD → Video Recordings
- NAS → Backup Repository

## Hardware Architecture

```text
                 Internet
                     │
              Firewall / Router
                     │
             Managed PoE Switch
                     │
      ┌──────────────┴──────────────┐
      │                             │
 Proxmox Server                  NVR (Optional)
      │                             │
 ├── Home Assistant                 Cameras
 ├── Frigate AI
 ├── Grafana
 ├── MQTT
 ├── InfluxDB
 └── Docker Services
```

## Capacity Planning

| Deployment | Cameras | Recommended RAM | Coral TPU | Storage |
|------------|---------|----------------:|-----------|----------|
| HomeLab | 4–8 | 32 GB | 1 | 4 TB |
| Small Office | 10–12 | 64 GB | 1 | 8 TB |
| Production | 20 | 64–128 GB | 1–2 | 16 TB+ |

## Future Upgrade Roadmap

- Dedicated Rack Cabinet
- Redundant Power Supply
- 10 GbE Backbone
- High Availability Proxmox Cluster
- Centralized NAS
- UPS Monitoring
- Enterprise Monitoring Stack
- Offsite Backup

## Hardware Sizing Rationale

The selected hardware has been sized to support the following workloads:

| Workload | Requirement |
|----------|-------------|
| Proxmox Virtualization | Multiple VMs and Linux Containers |
| Home Assistant | Smart Home Automation |
| Frigate AI | Real-time Object Detection |
| Grafana | Infrastructure Monitoring |
| InfluxDB | Time-Series Database |
| MQTT | Device Communication |
| Docker | Containerized Services |
| AI Analytics | Google Coral TPU |

The platform has been intentionally sized with additional compute and storage headroom to accommodate future expansion without requiring a complete hardware refresh.

## Estimated Resource Allocation

| Service | vCPU | Memory | Storage |
|----------|-----:|-------:|---------:|
| Home Assistant | 4 | 8 GB | 60 GB |
| Frigate AI | 8 | 16 GB | 100 GB |
| MQTT | 1 | 1 GB | 10 GB |
| Grafana | 2 | 2 GB | 20 GB |
| InfluxDB | 4 | 8 GB | 100 GB |
| Node-RED | 2 | 2 GB | 20 GB |
| Portainer | 1 | 1 GB | 10 GB |
| Tailscale | 1 | 512 MB | 5 GB |

**Reserved for Proxmox Host**

- 4 CPU Threads
- 16 GB RAM

## Hardware Selection Criteria

The hardware platform was selected based on the following design goals:

- Enterprise-grade reliability
- Virtualization performance
- AI acceleration support
- Future scalability
- Low power consumption
- Linux and Proxmox compatibility
- High-speed NVMe storage
- Expandability through PCIe

## Hardware Gallery

### Motherboard

> Coming Soon

### Server

> Coming Soon

### Storage

> Coming Soon

### Coral TPU

> Coming Soon

### Rack Layout

> Coming Soon