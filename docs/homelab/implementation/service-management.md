---
title: HomeLab Service Management
sidebar_label: Service Management
description: Centralized lifecycle management for the Makani HomeAuto Docker services using the custom dockerctl controller.
---

# HomeLab Service Management

The **Makani HomeAuto HomeLab** consists of multiple Docker Compose stacks providing infrastructure, messaging, AI surveillance, automation, and remote-management services.

As the platform grew, manually managing individual Compose files became inefficient and increased the risk of restarting unrelated services during troubleshooting.

A custom lifecycle-management utility named **`dockerctl`** was therefore implemented.

The controller provides a single operational interface for:

- Starting the complete HomeLab
- Gracefully stopping the complete HomeLab
- Restarting the complete HomeLab
- Starting individual stacks
- Stopping individual stacks
- Restarting individual stacks
- Restarting a single service without affecting other modules
- Viewing service logs
- Checking container status
- Discovering available stacks and services

---

# 1. Purpose

The objective of `dockerctl` is to provide predictable and repeatable management of the HomeLab Docker environment.

Instead of manually executing commands such as:

```bash
docker compose --env-file ~/docker/.env \
  -f ~/docker/stacks/frigate.yml restart
```

the same operation can be performed using:

```bash
./dockerctl restart frigate
```

More importantly, individual services can be managed without restarting unrelated HomeAuto components.

For example:

```bash
./dockerctl restart infrastructure portainer
```

restarts only Portainer while leaving Dozzle and all other HomeLab services untouched.

---

# 2. Service Management Architecture

The controller sits above the Docker Compose layer.

```text
Administrator
     │
     ▼
 dockerctl
     │
     ├─────────────────────────────────────────┐
     │                                         │
     ▼                                         ▼
Stack Management                        Service Management
     │                                         │
     ├── infrastructure                       ├── portainer
     ├── mqtt                                 ├── dozzle
     ├── frigate                              ├── mqtt
     ├── homeassistant                        ├── frigate
     └── webssh                               ├── homeassistant
                                               └── webssh
     │
     ▼
Docker Compose
     │
     ▼
Docker Engine
```

This provides two levels of operational control:

```text
Level 1
Whole Stack Management

Level 2
Individual Service Management
```

---

# 3. HomeLab Stack Structure

The HomeLab Compose files are stored under:

```text
/home/teju/docker/stacks/
```

The current stack files are:

```text
frigate.yml
homeassistant.yml
infrastructure.yml
mqtt.yml
webssh.yml
```

The main Docker project structure is:

```text
~/docker/
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

---

# 4. Why Centralized Service Management Was Needed

Initially, services could be managed directly with Docker Compose.

For example:

```bash
docker compose \
  --env-file ~/docker/.env \
  -f ~/docker/stacks/mqtt.yml \
  restart
```

As additional stacks were introduced, this approach became harder to operate consistently.

The HomeLab now contains several independent service groups:

```text
Infrastructure
   ├── Portainer
   └── Dozzle

Messaging
   └── Mosquitto MQTT

AI Surveillance
   └── Frigate

Automation
   └── Home Assistant

Remote Management
   └── WebSSH
```

A common controller reduces command complexity and prevents accidental disruption of unrelated services.

---

# 5. Original dockerctl Controller

The initial `dockerctl` implementation provided stack-level operations.

Supported commands included:

```bash
./dockerctl up <stack>
./dockerctl down <stack>
./dockerctl restart <stack>
./dockerctl logs <stack>
./dockerctl ps
./dockerctl status
```

This worked well for basic stack management.

However, it had an important limitation.

Running:

```bash
./dockerctl restart infrastructure
```

restarted the complete infrastructure stack.

If that stack contains:

```text
Portainer
Dozzle
```

both services are restarted even when only one requires maintenance.

The controller was therefore enhanced to provide **individual service control**.

---

# 6. Back Up the Existing Controller

Before modifying the working script, a timestamped backup should be created.

Navigate to the Docker project:

```bash
cd ~/docker
```

Create the backup:

```bash
cp dockerctl dockerctl.backup-$(date +%Y%m%d-%H%M%S)
```

Verify:

```bash
ls -lh dockerctl*
```

This provides an immediate rollback path if required.

---

# 7. dockerctl Installation

The controller is stored at:

```text
/home/teju/docker/dockerctl
```

Edit the script using:

```bash
nano ~/docker/dockerctl
```

The current enhanced implementation is shown below.

```bash
#!/bin/bash

set -u

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
STACK_DIR="$PROJECT_DIR/stacks"
ENV_FILE="$PROJECT_DIR/.env"

# Startup dependency order
STACK_ORDER=(
    "infrastructure"
    "mqtt"
    "frigate"
    "homeassistant"
    "webssh"
)

GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
RESET="\033[0m"

info() {
    echo -e "${CYAN}[INFO]${RESET} $1"
}

success() {
    echo -e "${GREEN}[OK]${RESET} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${RESET} $1"
}

error() {
    echo -e "${RED}[ERROR]${RESET} $1"
}

usage() {
    echo ""
    echo "Makani HomeAuto - Docker Lab Manager"
    echo ""
    echo "Usage:"
    echo ""
    echo "  Whole Lab"
    echo "  ---------"
    echo "  ./dockerctl start-all"
    echo "  ./dockerctl stop-all"
    echo "  ./dockerctl restart-all"
    echo "  ./dockerctl status"
    echo ""
    echo "  Stack Operations"
    echo "  ----------------"
    echo "  ./dockerctl up <stack>"
    echo "  ./dockerctl stop <stack>"
    echo "  ./dockerctl down <stack>"
    echo "  ./dockerctl restart <stack>"
    echo "  ./dockerctl logs <stack>"
    echo "  ./dockerctl status <stack>"
    echo ""
    echo "  Individual Service Operations"
    echo "  -----------------------------"
    echo "  ./dockerctl up <stack> <service>"
    echo "  ./dockerctl stop <stack> <service>"
    echo "  ./dockerctl restart <stack> <service>"
    echo "  ./dockerctl logs <stack> <service>"
    echo "  ./dockerctl status <stack> <service>"
    echo ""
    echo "  Utility"
    echo "  -------"
    echo "  ./dockerctl ps"
    echo "  ./dockerctl stacks"
    echo "  ./dockerctl services <stack>"
    echo ""
}

check_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file not found:"
        echo "       $ENV_FILE"
        exit 1
    fi
}

stack_file() {
    local stack="$1"
    echo "$STACK_DIR/$stack.yml"
}

check_stack() {
    local stack="$1"
    local file

    file="$(stack_file "$stack")"

    if [[ ! -f "$file" ]]; then
        error "Stack '$stack' does not exist."
        echo ""
        echo "Available stacks:"
        list_stacks
        exit 1
    fi
}

compose() {
    local stack="$1"
    shift

    docker compose \
        --env-file "$ENV_FILE" \
        -f "$(stack_file "$stack")" \
        "$@"
}

list_stacks() {
    for file in "$STACK_DIR"/*.yml; do
        [[ -e "$file" ]] || continue
        basename "$file" .yml
    done
}

list_services() {
    local stack="$1"

    check_stack "$stack"

    compose "$stack" config --services
}

check_service() {
    local stack="$1"
    local service="$2"

    if ! list_services "$stack" | grep -Fxq "$service"; then
        error "Service '$service' does not exist in stack '$stack'."
        echo ""
        echo "Available services in $stack:"
        list_services "$stack"
        exit 1
    fi
}

up_target() {
    local stack="$1"
    local service="${2:-}"

    check_stack "$stack"

    if [[ -n "$service" ]]; then
        check_service "$stack" "$service"

        info "Starting service '$service' from stack '$stack'..."

        compose "$stack" up -d "$service"

        success "$stack / $service started."
    else
        info "Starting stack '$stack'..."

        compose "$stack" up -d

        success "$stack started."
    fi
}

stop_target() {
    local stack="$1"
    local service="${2:-}"

    check_stack "$stack"

    if [[ -n "$service" ]]; then
        check_service "$stack" "$service"

        info "Stopping service '$service' from stack '$stack'..."

        compose "$stack" stop "$service"

        success "$stack / $service stopped."
    else
        info "Stopping stack '$stack'..."

        compose "$stack" stop

        success "$stack stopped."
    fi
}

down_stack() {
    local stack="$1"

    check_stack "$stack"

    info "Taking stack '$stack' down..."

    compose "$stack" down

    success "$stack removed."
}

restart_target() {
    local stack="$1"
    local service="${2:-}"

    check_stack "$stack"

    if [[ -n "$service" ]]; then
        check_service "$stack" "$service"

        info "Restarting only '$service' from stack '$stack'..."

        compose "$stack" restart "$service"

        success "$stack / $service restarted."
    else
        info "Restarting stack '$stack'..."

        compose "$stack" restart

        success "$stack restarted."
    fi
}

logs_target() {
    local stack="$1"
    local service="${2:-}"

    check_stack "$stack"

    if [[ -n "$service" ]]; then
        check_service "$stack" "$service"

        compose "$stack" logs \
            --tail=100 \
            -f \
            "$service"
    else
        compose "$stack" logs \
            --tail=100 \
            -f
    fi
}

status_target() {
    local stack="${1:-}"
    local service="${2:-}"

    if [[ -z "$stack" ]]; then
        echo ""
        echo "============================================================"
        echo " Makani HomeAuto - Docker Lab Status"
        echo "============================================================"
        echo ""

        docker ps \
            --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

        echo ""
        echo "Compose projects:"
        docker compose ls
        echo ""

        return
    fi

    check_stack "$stack"

    if [[ -n "$service" ]]; then
        check_service "$stack" "$service"

        compose "$stack" ps "$service"
    else
        compose "$stack" ps
    fi
}

start_all() {
    echo ""
    echo "============================================================"
    echo " Starting Makani HomeAuto Lab"
    echo "============================================================"
    echo ""

    for stack in "${STACK_ORDER[@]}"; do

        if [[ -f "$(stack_file "$stack")" ]]; then
            up_target "$stack"
            echo ""
        else
            warn "Skipping '$stack' - stack file not found."
        fi

    done

    echo ""
    success "HomeAuto Lab startup sequence complete."
    echo ""

    status_target
}

stop_all() {
    echo ""
    echo "============================================================"
    echo " Stopping Makani HomeAuto Lab"
    echo "============================================================"
    echo ""

    for ((i=${#STACK_ORDER[@]}-1; i>=0; i--)); do

        stack="${STACK_ORDER[$i]}"

        if [[ -f "$(stack_file "$stack")" ]]; then
            stop_target "$stack"
            echo ""
        else
            warn "Skipping '$stack' - stack file not found."
        fi

    done

    success "HomeAuto Lab shutdown sequence complete."
}

restart_all() {
    info "Restarting complete HomeAuto Lab..."

    stop_all

    echo ""

    start_all
}

check_env_file

ACTION="${1:-}"
STACK="${2:-}"
SERVICE="${3:-}"

case "$ACTION" in

    start-all)
        start_all
        ;;

    stop-all)
        stop_all
        ;;

    restart-all)
        restart_all
        ;;

    up)
        [[ -n "$STACK" ]] || {
            error "Stack name required."
            usage
            exit 1
        }

        up_target "$STACK" "$SERVICE"
        ;;

    stop)
        [[ -n "$STACK" ]] || {
            error "Stack name required."
            usage
            exit 1
        }

        stop_target "$STACK" "$SERVICE"
        ;;

    down)
        [[ -n "$STACK" ]] || {
            error "Stack name required."
            usage
            exit 1
        }

        if [[ -n "$SERVICE" ]]; then
            error "'down' operates on an entire Compose stack."
            echo ""
            echo "Use:"
            echo "  ./dockerctl stop $STACK $SERVICE"
            exit 1
        fi

        down_stack "$STACK"
        ;;

    restart)
        [[ -n "$STACK" ]] || {
            error "Stack name required."
            usage
            exit 1
        }

        restart_target "$STACK" "$SERVICE"
        ;;

    logs)
        [[ -n "$STACK" ]] || {
            error "Stack name required."
            usage
            exit 1
        }

        logs_target "$STACK" "$SERVICE"
        ;;

    status)
        status_target "$STACK" "$SERVICE"
        ;;

    ps)
        docker ps \
            --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
        ;;

    stacks)
        list_stacks
        ;;

    services)
        [[ -n "$STACK" ]] || {
            error "Stack name required."
            exit 1
        }

        list_services "$STACK"
        ;;

    help|-h|--help|"")
        usage
        ;;

    *)
        error "Unknown command: $ACTION"
        usage
        exit 1
        ;;

esac
```

---

# 8. Make the Script Executable

After creating or modifying the script:

```bash
chmod +x ~/docker/dockerctl
```

Verify:

```bash
ls -lh ~/docker/dockerctl
```

The executable bit should be present.

---

# 9. Validate Bash Syntax

Before executing the controller, validate its Bash syntax.

```bash
bash -n ~/docker/dockerctl
```

Expected result:

```text
No output
```

No output indicates that Bash did not detect a syntax error.

---

# 10. Discover Available Stacks

Run:

```bash
cd ~/docker
./dockerctl stacks
```

Expected stacks:

```text
frigate
homeassistant
infrastructure
mqtt
webssh
```

This command discovers Compose files directly from:

```text
~/docker/stacks/
```

---

# 11. Discover Services Inside a Stack

The controller can inspect the actual Compose configuration instead of relying on manually maintained service mappings.

Infrastructure:

```bash
./dockerctl services infrastructure
```

MQTT:

```bash
./dockerctl services mqtt
```

Frigate:

```bash
./dockerctl services frigate
```

Home Assistant:

```bash
./dockerctl services homeassistant
```

WebSSH:

```bash
./dockerctl services webssh
```

This uses:

```bash
docker compose config --services
```

internally.

---

# 12. Start the Complete HomeLab

Start all HomeLab stacks using:

```bash
cd ~/docker
./dockerctl start-all
```

The controller starts services according to the defined dependency order.

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

The configured startup order is:

```bash
STACK_ORDER=(
    "infrastructure"
    "mqtt"
    "frigate"
    "homeassistant"
    "webssh"
)
```

This ensures that supporting infrastructure is brought online before higher-level application services.

---

# 13. Verify Complete HomeLab Status

Run:

```bash
./dockerctl status
```

The controller displays active Docker containers and Compose projects.

A direct Docker check can also be performed:

```bash
docker ps
```

For a more readable view:

```bash
docker ps \
  --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

---

# 14. Gracefully Stop the Complete HomeLab

Use:

```bash
./dockerctl stop-all
```

Shutdown occurs in reverse dependency order.

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

This is preferable to abruptly shutting down the Ubuntu VM while application containers are still active.

---

# 15. Restart the Complete HomeLab

When a complete platform restart is required:

```bash
./dockerctl restart-all
```

The controller performs:

```text
stop-all
   │
   ▼
reverse dependency shutdown
   │
   ▼
start-all
   │
   ▼
dependency-ordered startup
   │
   ▼
status
```

A complete restart should only be used when necessary.

For normal maintenance, individual-service restart is preferred.

---

# 16. Individual Service Management

One of the main objectives of the enhanced controller is the ability to operate on one service without unnecessarily disrupting the rest of the HomeLab.

General syntax:

```bash
./dockerctl <action> <stack> <service>
```

For example:

```bash
./dockerctl restart frigate frigate
```

This instructs Docker Compose to restart only the `frigate` service inside the `frigate` stack.

---

# 17. Restart Frigate Only

When changing Frigate configuration or troubleshooting AI processing:

```bash
./dockerctl restart frigate frigate
```

Verify:

```bash
./dockerctl status frigate frigate
```

Alternative verification:

```bash
docker ps --filter "name=frigate"
```

Inspect logs:

```bash
./dockerctl logs frigate frigate
```

This operation should not intentionally restart:

```text
MQTT
Home Assistant
Portainer
Dozzle
WebSSH
```

---

# 18. Restart MQTT Only

Restart Mosquitto without restarting Frigate or Home Assistant:

```bash
./dockerctl restart mqtt mqtt
```

Verify:

```bash
./dockerctl status mqtt mqtt
```

Logs:

```bash
./dockerctl logs mqtt mqtt
```

Direct fallback:

```bash
docker logs mqtt --tail 30
```

---

# 19. Restart Home Assistant Only

Restart the Home Assistant service:

```bash
./dockerctl restart homeassistant homeassistant
```

Verify:

```bash
./dockerctl status homeassistant homeassistant
```

This allows Home Assistant maintenance without deliberately restarting Frigate or MQTT.

---

# 20. Restart Portainer Only

Portainer belongs to the infrastructure stack.

Restart only Portainer:

```bash
./dockerctl restart infrastructure portainer
```

Dozzle remains unaffected.

Verify:

```bash
./dockerctl status infrastructure portainer
```

---

# 21. Restart Dozzle Only

Restart only Dozzle:

```bash
./dockerctl restart infrastructure dozzle
```

Portainer remains unaffected.

Verify:

```bash
./dockerctl status infrastructure dozzle
```

---

# 22. Start and Stop Individual Services

Individual services can also be stopped without removing their Compose stack.

Stop Frigate:

```bash
./dockerctl stop frigate frigate
```

Start Frigate:

```bash
./dockerctl up frigate frigate
```

Stop MQTT:

```bash
./dockerctl stop mqtt mqtt
```

Start MQTT:

```bash
./dockerctl up mqtt mqtt
```

Stop Portainer:

```bash
./dockerctl stop infrastructure portainer
```

Start Portainer:

```bash
./dockerctl up infrastructure portainer
```

Using `up -d <service>` provides a useful advantage: Docker Compose can start the service even if its container needs to be created.

---

# 23. Stack-Level Operations

The same controller can operate on an entire Compose stack.

Start infrastructure:

```bash
./dockerctl up infrastructure
```

Restart infrastructure:

```bash
./dockerctl restart infrastructure
```

Stop infrastructure:

```bash
./dockerctl stop infrastructure
```

Check infrastructure:

```bash
./dockerctl status infrastructure
```

---

# 24. stop vs down

These operations have different purposes.

## Stop

```bash
./dockerctl stop frigate
```

stops the containers while preserving the Compose deployment.

For normal maintenance, `stop` is preferred.

---

## Down

```bash
./dockerctl down frigate
```

executes the equivalent of:

```bash
docker compose down
```

against the complete stack.

This removes the stack's containers and associated Compose-created resources according to Docker Compose behavior.

`down` should therefore be used deliberately.

The controller does not permit:

```bash
./dockerctl down infrastructure portainer
```

because `down` is a stack-level operation.

To stop only Portainer:

```bash
./dockerctl stop infrastructure portainer
```

---

# 25. Service Logs

The controller provides a common interface for inspecting logs.

Frigate:

```bash
./dockerctl logs frigate frigate
```

MQTT:

```bash
./dockerctl logs mqtt mqtt
```

Home Assistant:

```bash
./dockerctl logs homeassistant homeassistant
```

Portainer:

```bash
./dockerctl logs infrastructure portainer
```

Dozzle:

```bash
./dockerctl logs infrastructure dozzle
```

The controller displays the latest 100 lines and follows the log stream.

Exit log-following mode using:

```text
Ctrl+C
```

---

# 26. Troubleshooting Workflow

A standard service troubleshooting sequence can now be followed.

Example: Frigate issue.

```text
Frigate Issue
     │
     ▼
Check Status
     │
     ▼
Check Logs
     │
     ▼
Modify Configuration
     │
     ▼
Restart Frigate Only
     │
     ▼
Verify Status
     │
     ▼
Verify Logs
```

Commands:

```bash
./dockerctl status frigate frigate
```

```bash
./dockerctl logs frigate frigate
```

After configuration changes:

```bash
./dockerctl restart frigate frigate
```

Then:

```bash
./dockerctl status frigate frigate
```

This isolates troubleshooting from unrelated HomeLab services.

---

# 27. Direct Docker Recovery Commands

`dockerctl` is the preferred management interface, but direct Docker commands remain important for troubleshooting and recovery.

List running containers:

```bash
docker ps
```

List all containers:

```bash
docker ps -a
```

Restart Frigate directly:

```bash
docker restart frigate
```

Restart MQTT directly:

```bash
docker restart mqtt
```

Restart Home Assistant directly:

```bash
docker restart homeassistant
```

View Frigate logs:

```bash
docker logs frigate --tail 50
```

View MQTT logs:

```bash
docker logs mqtt --tail 30
```

Follow logs:

```bash
docker logs -f frigate
```

These commands provide an emergency fallback if the controller or Compose configuration itself requires troubleshooting.

---

# 28. Operational Model

The HomeLab now uses the following operational hierarchy:

```text
Normal HomeLab Operations
          │
          ▼
       dockerctl
          │
          ├── Whole Lab
          │
          ├── Stack
          │
          └── Individual Service
          
Troubleshooting / Recovery
          │
          ▼
     Docker Compose
          │
          ▼
     Direct Docker CLI
```

This provides both operational simplicity and low-level recovery access.

---

# 29. Example Maintenance Scenario

Assume the Frigate configuration has been modified while testing object detection, face recognition, or LPR.

A complete HomeLab restart is unnecessary.

Instead:

```bash
./dockerctl restart frigate frigate
```

Operational effect:

```text
Frigate            RESTARTED

MQTT               UNCHANGED
Home Assistant     UNCHANGED
Portainer          UNCHANGED
Dozzle             UNCHANGED
WebSSH             UNCHANGED
```

The service can then immediately be checked:

```bash
./dockerctl status frigate frigate
```

and:

```bash
./dockerctl logs frigate frigate
```

This reduces unnecessary service interruption during Lab testing.

---

# 30. Verification Checklist

After implementing `dockerctl`, validate the following.

| Verification | Command | Expected Result |
|---|---|---|
| Bash syntax | `bash -n ~/docker/dockerctl` | No syntax errors |
| Stack discovery | `./dockerctl stacks` | All stack files displayed |
| Service discovery | `./dockerctl services <stack>` | Compose services displayed |
| Full startup | `./dockerctl start-all` | All configured stacks started |
| Platform status | `./dockerctl status` | Containers and Compose projects displayed |
| Frigate restart | `./dockerctl restart frigate frigate` | Frigate restarted |
| MQTT restart | `./dockerctl restart mqtt mqtt` | MQTT restarted |
| HA restart | `./dockerctl restart homeassistant homeassistant` | HA restarted |
| Portainer restart | `./dockerctl restart infrastructure portainer` | Portainer restarted |
| Dozzle restart | `./dockerctl restart infrastructure dozzle` | Dozzle restarted |
| Full shutdown | `./dockerctl stop-all` | Stacks stopped in reverse order |

---

# 31. Final State

The HomeLab now has a centralized lifecycle-management layer.

```text
                 dockerctl
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    Whole Lab      Stacks      Services
        │            │            │
        ▼            ▼            ▼
   start-all     up/down       start
   stop-all      restart       stop
   restart-all   status        restart
   status        logs          logs
                                 │
                                 ▼
                         Isolated Maintenance
```

The controller improves the HomeLab by providing:

- Consistent operational commands
- Dependency-aware startup
- Reverse-order shutdown
- Stack-level management
- Individual-service management
- Service isolation during maintenance
- Centralized log access
- Service discovery
- Stack discovery
- Direct Docker fallback procedures

Most importantly, maintenance of one HomeAuto component no longer requires intentionally restarting the entire platform.

---

# 32. Engineering Principle

The service-management design follows a simple operational principle:

> **Restart only what changed. Verify what restarted. Leave everything else running.**

This minimizes unnecessary service disruption and provides a cleaner foundation for continued HomeAuto development and eventual Production deployment.