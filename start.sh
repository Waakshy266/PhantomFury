#!/usr/bin/env bash

# Clear screen matrices for high-impact canvas drawing
clear

# HIGH-IMPACT NEON CYBERPUNK ASCII LOGO MODULE
echo -e "\e[1;31m  ██████╗  ██╗  ██╗  █████╗  ███╗   ██╗ ████████╗  ██████╗  ███╗   ███╗ \e[0m"
echo -e "\e[1;31m  ██╔══██╗ ██║  ██║ ██╔══██╗ ████╗  ██║ ╚══██╔══╝ ██╔═══██╗ ████╗  ████║ \e[0m"
echo -e "\e[1;31m  ██████╔╝ ███████║ ███████║ ██╔██╗ ██║    ██║    ██║   ██║ ██╔██╗██╔██║ \e[0m"
echo -e "\e[1;31m  ██╔═══╝  ██╔══██║ ██╔══██║ ██║╚██╗██║    ██║    ██║   ██║ ██║╚███╔╝██║ \e[0m"
echo -e "\e[1;31m  ██║      ██║  ██║ ██║  ██║ ██║ ╚████║    ██║    ╚██████╔╝ ██║ ╚═╝  ██║ \e[0m"
echo -e "\e[1;31m  ╚═╝      ╚═╝  ╚═╝ ╚═╝  ╚═╝ ╚═╝  ╚═══╝    ╚═╝     ╚═════╝  ╚═╝      ╚═╝ \e[0m"
echo -e "\e[1;31m========================================================================\e[0m"
echo -e "\e[1;37m ⚔️  PROJECT NAME : \e[1;31mPHANTOM FURY SYSTEM PLATFORM \e[1;30m// \e[1;32mSTABLE DEPLOYMENT \e[0m"
echo -e "\e[1;37m 📅 CORE TIMELINE: \e[1;34mOCTOBER 2026 \e[1;30m----------------------------------------\e[0m"
echo -e "\e[1;31m========================================================================\e[0m"

# DYNAMIC TELEMETRY DIAGNOSTIC STATUS TABLE GRID
echo -e "\e[1;31m┌───────────────────────────┬──────────────────────────────────────────┐\e[0m"
echo -e "\e[1;31m│\e[1;35m 🖥️ PROXIED TARGET EXTENSION\e[1;31m │\e[1;33m waakye.furyphantom.dpdns.org             \e[1;31m│\e[0m"
echo -e "\e[1;31m├───────────────────────────┼──────────────────────────────────────────┤\e[0m"
echo -e "\e[1;31m│\e[1;35m 📦 ENGINE INFRASTRUCTURE \e[1;31m │\e[1;37m NODE.JS DAEMON  \e[1;30m[\e[1;32mPORT 3000\e[1;30m]          \e[1;31m│\e[0m"
echo -e "\e[1;31m├───────────────────────────┼──────────────────────────────────────────┤\e[0m"
echo -e "\e[1;31m│\e[1;35m 📻 AUDIO MATRIX BROADCAST \e[1;31m │\e[1;32m DIRECT SDCARD MAPPED: /BATTLEMUSIC        \e[1;31m│\e[0m"
echo -e "\e[1;31m├───────────────────────────┼──────────────────────────────────────────┤\e[0m"
echo -e "\e[1;31m│\e[1;35m 🛠️ SYSTEM RADAR CONTROLLER\e[1;31m │\e[1;36m CLOUDFLARED ARGO TUNNEL INGRESS GATE      \e[1;31m│\e[0m"
echo -e "\e[1;31m└───────────────────────────┴──────────────────────────────────────────┘\e[0m"
echo -e "\e[1;31m------------------------------------------------------------------------\e[0m"

# Terminate legacy hanging server binds to clear local gateway routes cleanly
echo -e "\e[1;30m[⚙️] RUNNING BACKGROUND CLEANSER: Flushing active proxy storage maps...\e[0m"
pkill -f node
pkill -f cloudflared
sleep 1

# Fire up your flat database application server tracking loop
echo -e "\e[1;32m[🚀] COMPILING APPLICATION CORE: Starting Node Web Interface...\e[0m"
node server.js > server.log 2>&1 &
sleep 3

# MOBILE-SAFE PORT RECOGNITION INTERCEPTOR GATEWAYS
if ss -tuln | grep -q ":3000 " || netstat -tuln | grep -q ":3000 " 2>/dev/null || exec 3<>/dev/tcp/127.0.0.1/3000; then
    [ -n "$IS_TCP" ] && exec 3>&-
    echo -e "\e[1;30m[\e[1;32m ONLINE \e[1;30m] ✖ \e[1;32mSERVER STACK RESPONDING HEALTHY ON LOCALPORT 3000\e[0m"
else
    echo -e "\e[1;31m🚨 [CRASH ERROR] BACKEND ENGINE ENGINE INJECTION ENCOUNTERED A FAILURE. CHECK SERVER.LOG\e[0m"
    exit 1
fi

echo -e "\e[1;34m[🛰️] NETWORK GATEWAY BRIDGE: Binding secure Cloudflare proxy tunnel channels...\e[0m"
echo -e "\e[1;35m[🛡️] GUARDIAN ACTIVE OVERSEER: Automated resurrection protocols are ENGAGED\e[0m"
echo -e "\e[1;31m------------------------------------------------------------------------\e[0m"

# INFINITE AUTOMATED CRASH RECOVERY LOOP MATRIX WITH INTEGRATED NEON ALERTS
while true; do
    echo -e "\e[1;30m[\e[1;36m SYSTEM-LINK \e[1;30m] ✖ \e[1;36mRouting traffic parameters directly to domain edge pools...\e[0m"
    echo -e "\e[1;32m▶ \e[1;32mTUNNEL ENCRYPTED PIPELINE ONLINE AND TRANSMITTING SECURELY\e[0m\n"
    
    # Run tunnel daemon inside foreground shell loop to keep terminal focus active
    cloudflared tunnel run
    
    # Execution drops past this point ONLY if the cloudflared process crashes or drops link
    echo -e "\e[1;31m\n🚨 🚨 🚨 [WARNING LINK DROP] 🚨 🚨 🚨\e[0m"
    echo -e "\e[1;31m========================================================================\e[0m"
    echo -e "\e[1;31m⚠️  CRITICAL INFRASTRUCTURE DROP: External internet routing stream broke!\e[0m"
    echo -e "\e[1;33m🔄 AUTOMATED ACTION: Watchdog auto-initializing proxy recovery in 3s...\e[0m"
    echo -e "\e[1;31m========================================================================\e[0m"
    
    sleep 3
done
