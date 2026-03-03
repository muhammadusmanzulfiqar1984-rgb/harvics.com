"""
HARVICS SYSTEM MONITORING AGENT
Strict Protocol Enforcement & System Health Monitoring
ALL AI OPERATIONS MUST GO THROUGH PYTHON
"""

import os
import sys
import time
import signal
import subprocess
import requests
import json
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import psutil
import socket

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('system_monitor.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class ProtocolViolationType(Enum):
    """Types of protocol violations"""
    PORT_MISMATCH = "PORT_MISMATCH"
    AI_BYPASS = "AI_BYPASS"
    UNAUTHORIZED_SERVICE = "UNAUTHORIZED_SERVICE"
    HEALTH_CHECK_FAILED = "HEALTH_CHECK_FAILED"
    PROCESS_VIOLATION = "PROCESS_VIOLATION"


@dataclass
class SystemProtocol:
    """System Protocol Definitions - STRICT ENFORCEMENT"""
    # Port assignments - NEVER VIOLATE
    FRONTEND_PORT: int = 3000
    BACKEND_PORT: int = 4000
    AI_ENGINE_PORT: int = 8000
    
    # Service URLs
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:4000"
    AI_ENGINE_URL: str = "http://localhost:8000"
    
    # Health check endpoints
    BACKEND_HEALTH: str = "/health"
    BACKEND_API_HEALTH: str = "/api/system/monitor-status"
    AI_ENGINE_HEALTH: str = "/health"
    
    # Protocol rules
    ALL_AI_THROUGH_PYTHON: bool = True  # STRICT: All AI must go through Python
    ALLOWED_PROCESSES: List[str] = field(default_factory=lambda: [
        "next", "node", "tsx", "python", "uvicorn"
    ])
    
    # Monitoring intervals
    HEALTH_CHECK_INTERVAL: int = 10  # seconds
    PORT_CHECK_INTERVAL: int = 5  # seconds
    VIOLATION_CHECK_INTERVAL: int = 15  # seconds


@dataclass
class ProtocolViolation:
    """Represents a protocol violation"""
    violation_type: ProtocolViolationType
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    message: str
    timestamp: datetime
    auto_fixed: bool = False
    fix_action: Optional[str] = None


class SystemMonitorAgent:
    """
    STRICT SYSTEM MONITORING AGENT
    Enforces protocols and prevents system violations
    """
    
    def __init__(self):
        self.protocol = SystemProtocol()
        self.violations: List[ProtocolViolation] = []
        self.running = False
        self.stats = {
            'violations_detected': 0,
            'violations_fixed': 0,
            'checks_performed': 0,
            'start_time': datetime.now()
        }
        self._setup_signal_handlers()
        
    def _setup_signal_handlers(self):
        """Handle graceful shutdown"""
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info("Shutdown signal received. Stopping monitor...")
        self.stop()
        sys.exit(0)
    
    def check_port_usage(self) -> List[ProtocolViolation]:
        """Check if ports are used correctly"""
        violations = []
        
        # Check frontend port (3000)
        frontend_process = self._get_process_on_port(self.protocol.FRONTEND_PORT)
        if frontend_process:
            if not any(allowed in frontend_process['name'].lower() for allowed in ['next', 'node']):
                violations.append(ProtocolViolation(
                    violation_type=ProtocolViolationType.PORT_MISMATCH,
                    severity="CRITICAL",
                    message=f"Port {self.protocol.FRONTEND_PORT} used by unauthorized process: {frontend_process['name']}",
                    timestamp=datetime.now()
                ))
        
        # Check backend port (4000)
        backend_process = self._get_process_on_port(self.protocol.BACKEND_PORT)
        if backend_process:
            if not any(allowed in backend_process['name'].lower() for allowed in ['node', 'tsx']):
                violations.append(ProtocolViolation(
                    violation_type=ProtocolViolationType.PORT_MISMATCH,
                    severity="CRITICAL",
                    message=f"Port {self.protocol.BACKEND_PORT} used by unauthorized process: {backend_process['name']}",
                    timestamp=datetime.now()
                ))
        
        # Check AI engine port (8000)
        ai_process = self._get_process_on_port(self.protocol.AI_ENGINE_PORT)
        if ai_process:
            if 'python' not in ai_process['name'].lower() and 'uvicorn' not in ai_process['name'].lower():
                violations.append(ProtocolViolation(
                    violation_type=ProtocolViolationType.AI_BYPASS,
                    severity="CRITICAL",
                    message=f"AI Engine port {self.protocol.AI_ENGINE_PORT} must be used by Python process. Found: {ai_process['name']}",
                    timestamp=datetime.now()
                ))
        
        return violations
    
    def check_service_health(self) -> List[ProtocolViolation]:
        """Check health of all services"""
        violations = []
        
        # Check backend health
        try:
            response = requests.get(
                f"{self.protocol.BACKEND_URL}{self.protocol.BACKEND_HEALTH}",
                timeout=5
            )
            if response.status_code != 200:
                violations.append(ProtocolViolation(
                    violation_type=ProtocolViolationType.HEALTH_CHECK_FAILED,
                    severity="HIGH",
                    message=f"Backend health check failed: HTTP {response.status_code}",
                    timestamp=datetime.now()
                ))
        except requests.RequestException as e:
            violations.append(ProtocolViolation(
                violation_type=ProtocolViolationType.HEALTH_CHECK_FAILED,
                severity="HIGH",
                message=f"Backend not responding: {str(e)}",
                timestamp=datetime.now()
            ))
        
        # Check AI engine health (CRITICAL - All AI must go through Python)
        try:
            response = requests.get(
                f"{self.protocol.AI_ENGINE_URL}{self.protocol.AI_ENGINE_HEALTH}",
                timeout=5
            )
            if response.status_code != 200:
                violations.append(ProtocolViolation(
                    violation_type=ProtocolViolationType.AI_BYPASS,
                    severity="CRITICAL",
                    message=f"AI Engine (Python) not responding. ALL AI must go through Python!",
                    timestamp=datetime.now()
                ))
        except requests.RequestException as e:
            violations.append(ProtocolViolation(
                violation_type=ProtocolViolationType.AI_BYPASS,
                severity="CRITICAL",
                message=f"AI Engine (Python) not accessible. CRITICAL: All AI operations must go through Python!",
                timestamp=datetime.now()
            ))
        
        return violations
    
    def check_ai_bypass(self) -> List[ProtocolViolation]:
        """Check if AI operations are bypassing Python"""
        violations = []
        
        # Check if any Node.js/JavaScript processes are directly doing AI
        # This is a simplified check - in production, monitor network traffic
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                proc_info = proc.info
                name = proc_info['name'].lower()
                cmdline = ' '.join(proc_info.get('cmdline', [])).lower()
                
                # Detect potential AI bypasses
                ai_keywords = ['tensorflow', 'pytorch', 'sklearn', 'model', 'neural', 'ai', 'ml']
                if any(keyword in cmdline for keyword in ai_keywords):
                    if 'python' not in name and 'python' not in cmdline:
                        violations.append(ProtocolViolation(
                            violation_type=ProtocolViolationType.AI_BYPASS,
                            severity="CRITICAL",
                            message=f"Potential AI bypass detected: {name} running AI operations outside Python",
                            timestamp=datetime.now()
                        ))
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        return violations
    
    def auto_fix_violations(self, violations: List[ProtocolViolation]) -> int:
        """Automatically fix violations when possible"""
        fixed_count = 0
        
        for violation in violations:
            if violation.auto_fixed:
                continue
                
            try:
                if violation.violation_type == ProtocolViolationType.PORT_MISMATCH:
                    # Kill unauthorized process on port
                    port = self._extract_port_from_message(violation.message)
                    if port:
                        self._kill_process_on_port(port)
                        violation.auto_fixed = True
                        violation.fix_action = f"Killed unauthorized process on port {port}"
                        fixed_count += 1
                        logger.warning(f"Auto-fixed: {violation.message}")
                
                elif violation.violation_type == ProtocolViolationType.HEALTH_CHECK_FAILED:
                    # Try to restart service
                    if "backend" in violation.message.lower():
                        self._restart_backend()
                        violation.auto_fixed = True
                        violation.fix_action = "Attempted backend restart"
                        fixed_count += 1
                        logger.warning(f"Auto-fixed: Attempted backend restart")
                
            except Exception as e:
                logger.error(f"Failed to auto-fix violation: {e}")
        
        return fixed_count
    
    def _get_process_on_port(self, port: int) -> Optional[Dict]:
        """Get process information for a port"""
        try:
            for conn in psutil.net_connections(kind='inet'):
                if conn.laddr.port == port and conn.status == psutil.CONN_LISTEN:
                    try:
                        proc = psutil.Process(conn.pid)
                        return {
                            'pid': conn.pid,
                            'name': proc.name(),
                            'cmdline': ' '.join(proc.cmdline())
                        }
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        continue
        except Exception as e:
            logger.error(f"Error checking port {port}: {e}")
        return None
    
    def _kill_process_on_port(self, port: int) -> bool:
        """Kill process on a port"""
        try:
            process = self._get_process_on_port(port)
            if process:
                proc = psutil.Process(process['pid'])
                proc.terminate()
                time.sleep(2)
                if proc.is_running():
                    proc.kill()
                logger.info(f"Killed process {process['name']} (PID: {process['pid']}) on port {port}")
                return True
        except Exception as e:
            logger.error(f"Failed to kill process on port {port}: {e}")
        return False
    
    def _restart_backend(self):
        """Attempt to restart backend"""
        # This is a placeholder - implement based on your startup script
        logger.info("Backend restart requested - check startup scripts")
    
    def _extract_port_from_message(self, message: str) -> Optional[int]:
        """Extract port number from violation message"""
        import re
        match = re.search(r'Port (\d+)', message)
        if match:
            return int(match.group(1))
        return None
    
    def monitor_loop(self):
        """Main monitoring loop"""
        logger.info("=" * 60)
        logger.info("HARVICS SYSTEM MONITORING AGENT - STARTED")
        logger.info("STRICT PROTOCOL ENFORCEMENT ACTIVE")
        logger.info(f"Frontend: Port {self.protocol.FRONTEND_PORT}")
        logger.info(f"Backend: Port {self.protocol.BACKEND_PORT}")
        logger.info(f"AI Engine: Port {self.protocol.AI_ENGINE_PORT} (Python Only)")
        logger.info("ALL AI OPERATIONS MUST GO THROUGH PYTHON")
        logger.info("=" * 60)
        
        self.running = True
        last_port_check = 0
        last_health_check = 0
        last_ai_check = 0
        
        while self.running:
            try:
                current_time = time.time()
                
                # Port check
                if current_time - last_port_check >= self.protocol.PORT_CHECK_INTERVAL:
                    violations = self.check_port_usage()
                    self._handle_violations(violations)
                    last_port_check = current_time
                
                # Health check
                if current_time - last_health_check >= self.protocol.HEALTH_CHECK_INTERVAL:
                    violations = self.check_service_health()
                    self._handle_violations(violations)
                    last_health_check = current_time
                
                # AI bypass check
                if current_time - last_ai_check >= self.protocol.VIOLATION_CHECK_INTERVAL:
                    violations = self.check_ai_bypass()
                    self._handle_violations(violations)
                    last_ai_check = current_time
                
                self.stats['checks_performed'] += 1
                time.sleep(1)
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                logger.error(f"Error in monitor loop: {e}")
                time.sleep(5)
    
    def _handle_violations(self, violations: List[ProtocolViolation]):
        """Handle detected violations"""
        if not violations:
            return
        
        for violation in violations:
            self.violations.append(violation)
            self.stats['violations_detected'] += 1
            
            # Log violation
            logger.error(f"[{violation.severity}] {violation.violation_type.value}: {violation.message}")
            
            # Auto-fix critical violations
            if violation.severity in ["CRITICAL", "HIGH"]:
                fixed = self.auto_fix_violations([violation])
                if fixed > 0:
                    self.stats['violations_fixed'] += 1
    
    def generate_report(self) -> Dict:
        """Generate monitoring report"""
        runtime = datetime.now() - self.stats['start_time']
        return {
            'status': 'running' if self.running else 'stopped',
            'runtime_seconds': runtime.total_seconds(),
            'stats': self.stats,
            'recent_violations': [
                {
                    'type': v.violation_type.value,
                    'severity': v.severity,
                    'message': v.message,
                    'timestamp': v.timestamp.isoformat(),
                    'fixed': v.auto_fixed
                }
                for v in self.violations[-10:]  # Last 10 violations
            ],
            'protocol': {
                'frontend_port': self.protocol.FRONTEND_PORT,
                'backend_port': self.protocol.BACKEND_PORT,
                'ai_engine_port': self.protocol.AI_ENGINE_PORT,
                'all_ai_through_python': self.protocol.ALL_AI_THROUGH_PYTHON
            }
        }
    
    def stop(self):
        """Stop monitoring"""
        logger.info("Stopping monitoring agent...")
        self.running = False
        report = self.generate_report()
        logger.info(f"Final report: {json.dumps(report, indent=2)}")


def main():
    """Main entry point"""
    monitor = SystemMonitorAgent()
    
    try:
        monitor.monitor_loop()
    except KeyboardInterrupt:
        logger.info("Monitor stopped by user")
    finally:
        monitor.stop()


if __name__ == "__main__":
    main()

