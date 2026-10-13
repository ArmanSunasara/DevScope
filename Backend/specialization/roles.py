"""Specialization role registry.

A role bundles three things:
- core_skills: must-have technical signals for the role
- nice_to_have: skills that strengthen but are not required
- expected_projects: project archetypes a candidate should have shipped

The registry is intentionally a plain dict-of-dataclasses so new roles can be
added without code changes elsewhere.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass(frozen=True)
class Role:
    id: str
    name: str
    category: str
    core_skills: List[str] = field(default_factory=list)
    nice_to_have: List[str] = field(default_factory=list)
    expected_projects: List[str] = field(default_factory=list)
    faang_relevant: bool = False
    summary: str = ""


_ROLES: Dict[str, Role] = {
    r.id: r
    for r in [
        Role(
            id="sde_faang",
            name="SDE (FAANG)",
            category="Software Engineering",
            core_skills=[
                "Data Structures", "Algorithms", "System Design",
                "Java", "C++", "Python", "Concurrency", "OOP",
                "Distributed Systems",
            ],
            nice_to_have=["LeetCode practice", "Open-source contributions", "Large-scale design"],
            expected_projects=[
                "Scalable web service", "Distributed key-value store",
                "High-throughput API", "Custom data structure library",
            ],
            faang_relevant=True,
            summary="Big Tech SDE with strong DSA + system design fundamentals.",
        ),
        Role(
            id="backend_engineer",
            name="Backend Engineer",
            category="Software Engineering",
            core_skills=[
                "Node.js", "Python", "Go", "REST APIs", "GraphQL",
                "PostgreSQL", "MongoDB", "Redis", "Authentication",
                "Microservices",
            ],
            nice_to_have=["gRPC", "Message queues (Kafka/RabbitMQ)", "Observability"],
            expected_projects=[
                "Production REST API", "Auth service", "Background worker pipeline",
                "Database-backed SaaS",
            ],
            summary="Server-side engineer focused on APIs, data, and reliability.",
        ),
        Role(
            id="frontend_engineer",
            name="Frontend Engineer",
            category="Software Engineering",
            core_skills=[
                "React", "TypeScript", "JavaScript", "HTML", "CSS",
                "Tailwind", "Next.js", "State management", "Accessibility",
                "Performance optimization",
            ],
            nice_to_have=["Animation (Framer Motion)", "Testing (Playwright/RTL)", "Design systems"],
            expected_projects=[
                "Interactive SPA", "Dashboard with charts",
                "Design system / component library", "Deployed Next.js app",
            ],
            summary="Client-side engineer shipping polished, accessible UIs.",
        ),
        Role(
            id="fullstack_engineer",
            name="Full Stack Engineer",
            category="Software Engineering",
            core_skills=[
                "React", "Node.js", "TypeScript", "REST/GraphQL",
                "PostgreSQL", "Authentication", "Deployment",
                "Docker", "CI/CD",
            ],
            nice_to_have=["Next.js", "tRPC", "Stripe", "WebSockets"],
            expected_projects=[
                "End-to-end SaaS product", "Auth + payments app",
                "Real-time collaborative app",
            ],
            summary="End-to-end product engineer shipping full features alone.",
        ),
        Role(
            id="devops_engineer",
            name="DevOps Engineer",
            category="Infrastructure",
            core_skills=[
                "Linux", "Docker", "Kubernetes", "Terraform", "Ansible",
                "CI/CD (GitHub Actions/Jenkins)", "AWS/GCP/Azure",
                "Monitoring (Prometheus/Grafana)", "Bash", "Networking",
            ],
            nice_to_have=["Helm", "ArgoCD", "Service mesh"],
            expected_projects=[
                "Infrastructure-as-code repo", "Multi-environment CI/CD",
                "Kubernetes cluster setup", "Observability stack",
            ],
            summary="Automates infra, deployments, and operations.",
        ),
        Role(
            id="mlops_engineer",
            name="MLOps Engineer",
            category="ML / AI",
            core_skills=[
                "Python", "Docker", "Kubernetes", "MLflow", "Kubeflow",
                "Airflow", "Feature stores", "Model serving (Triton/Seldon)",
                "CI/CD for ML", "Monitoring (drift, latency)",
            ],
            nice_to_have=["DVC", "BentoML", "Ray"],
            expected_projects=[
                "Model training + deployment pipeline",
                "Feature store implementation",
                "Model monitoring dashboard",
            ],
            summary="Operationalizes ML — training, serving, monitoring.",
        ),
        Role(
            id="ml_engineer",
            name="ML Engineer",
            category="ML / AI",
            core_skills=[
                "Python", "PyTorch", "TensorFlow", "scikit-learn",
                "NumPy", "Pandas", "Model training", "Feature engineering",
                "Evaluation metrics", "Data pipelines",
            ],
            nice_to_have=["JAX", "Hugging Face", "Distributed training"],
            expected_projects=[
                "End-to-end ML project (data → model → deploy)",
                "Kaggle-style competition",
                "Custom training pipeline",
            ],
            summary="Builds and trains production ML models.",
        ),
        Role(
            id="ai_engineer",
            name="AI Engineer",
            category="ML / AI",
            core_skills=[
                "Python", "LLMs", "LangChain", "LlamaIndex", "RAG",
                "Vector databases (Pinecone/Weaviate/Chroma)",
                "Prompt engineering", "OpenAI/Anthropic APIs",
                "Embeddings", "Agents",
            ],
            nice_to_have=["Fine-tuning", "Evals", "Guardrails"],
            expected_projects=[
                "RAG chatbot", "Agentic workflow", "LLM-powered SaaS",
                "Custom evaluation harness",
            ],
            summary="Builds applications on top of LLMs and foundation models.",
        ),
        Role(
            id="data_engineer",
            name="Data Engineer",
            category="Data",
            core_skills=[
                "Python", "SQL", "Spark", "Airflow", "dbt",
                "Snowflake/BigQuery/Redshift", "Kafka", "ETL/ELT",
                "Data modeling", "Data warehousing",
            ],
            nice_to_have=["Flink", "Iceberg/Delta Lake", "Great Expectations"],
            expected_projects=[
                "End-to-end ETL pipeline", "Streaming ingestion job",
                "Analytics dbt project",
            ],
            summary="Builds reliable data pipelines and warehouses.",
        ),
        Role(
            id="cybersecurity_engineer",
            name="Cybersecurity Engineer",
            category="Security",
            core_skills=[
                "Network security", "Penetration testing", "OWASP Top 10",
                "Burp Suite", "Wireshark", "Linux hardening", "SIEM",
                "Threat modeling", "Cryptography", "Incident response",
            ],
            nice_to_have=["Cloud security", "Red teaming", "Reverse engineering"],
            expected_projects=[
                "CTF write-ups", "Vulnerability scanner",
                "Security audit report", "Hardened reference deployment",
            ],
            summary="Defends and tests systems against attackers.",
        ),
        Role(
            id="cloud_engineer",
            name="Cloud Engineer",
            category="Infrastructure",
            core_skills=[
                "AWS", "GCP", "Azure", "Terraform", "Networking",
                "IAM", "Cost optimization", "Serverless (Lambda/Cloud Run)",
                "VPC", "Load balancers",
            ],
            nice_to_have=["Multi-cloud", "FinOps", "Edge"],
            expected_projects=[
                "IaC for multi-tier app", "Serverless API",
                "Multi-region deployment",
            ],
            summary="Designs and operates cloud infrastructure.",
        ),
        Role(
            id="android_developer",
            name="Android Developer",
            category="Mobile",
            core_skills=[
                "Kotlin", "Java", "Jetpack Compose", "Android SDK",
                "Coroutines", "Room", "Retrofit", "MVVM",
                "Hilt/Dagger", "Material Design",
            ],
            nice_to_have=["KMM", "Compose Multiplatform", "Play Store publishing"],
            expected_projects=[
                "Published Play Store app", "Offline-first app",
                "Reusable Compose UI library",
            ],
            summary="Ships native Android apps.",
        ),
        Role(
            id="ios_developer",
            name="iOS Developer",
            category="Mobile",
            core_skills=[
                "Swift", "SwiftUI", "UIKit", "Combine",
                "Core Data", "URLSession", "MVVM",
                "Concurrency (async/await)", "Xcode", "Auto Layout",
            ],
            nice_to_have=["The Composable Architecture", "WidgetKit", "App Store publishing"],
            expected_projects=[
                "Published App Store app", "SwiftUI sample app",
                "Reusable iOS library",
            ],
            summary="Ships native iOS apps.",
        ),
        Role(
            id="blockchain_developer",
            name="Blockchain Developer",
            category="Web3",
            core_skills=[
                "Solidity", "Rust", "EVM", "Hardhat/Foundry",
                "ethers.js/viem", "Smart contract security",
                "DeFi primitives", "IPFS", "Web3 wallets",
                "Gas optimization",
            ],
            nice_to_have=["Cairo (Starknet)", "Move (Sui/Aptos)", "ZK proofs"],
            expected_projects=[
                "Audited smart contract", "DeFi protocol fork",
                "Full-stack dApp",
            ],
            summary="Builds decentralized apps and protocols.",
        ),
        Role(
            id="game_developer",
            name="Game Developer",
            category="Games",
            core_skills=[
                "Unity (C#)", "Unreal (C++)", "Game loops",
                "Physics", "Shaders (HLSL/GLSL)", "Animation",
                "Networking (multiplayer)", "Performance profiling",
                "3D math", "Audio",
            ],
            nice_to_have=["Godot", "ECS architecture", "Console publishing"],
            expected_projects=[
                "Published itch.io/Steam game", "Multiplayer prototype",
                "Custom engine demo",
            ],
            summary="Builds interactive games and engines.",
        ),
        Role(
            id="embedded_engineer",
            name="Embedded Engineer",
            category="Hardware",
            core_skills=[
                "C", "C++", "ARM Cortex", "RTOS (FreeRTOS/Zephyr)",
                "I2C/SPI/UART", "Microcontrollers (STM32/ESP32)",
                "Linux drivers", "Memory-constrained programming",
                "Schematic reading", "JTAG debugging",
            ],
            nice_to_have=["Rust embedded", "Yocto", "Hardware design"],
            expected_projects=[
                "Bare-metal firmware project", "RTOS-based device",
                "Linux driver",
            ],
            summary="Programs hardware-near systems.",
        ),
        Role(
            id="sre",
            name="Site Reliability Engineer",
            category="Infrastructure",
            core_skills=[
                "Linux", "Go", "Python", "Kubernetes",
                "Prometheus", "Grafana", "On-call runbooks",
                "SLOs/SLIs", "Incident response",
                "Distributed systems",
            ],
            nice_to_have=["Chaos engineering", "eBPF", "Capacity planning"],
            expected_projects=[
                "Observability stack", "Reliability tooling",
                "Post-mortem write-ups",
            ],
            summary="Keeps production reliable and observable.",
        ),
        Role(
            id="platform_engineer",
            name="Platform Engineer",
            category="Infrastructure",
            core_skills=[
                "Kubernetes", "Terraform", "Internal developer platforms",
                "Backstage", "CI/CD pipelines", "GitOps",
                "Cloud (AWS/GCP)", "Golden paths",
                "Service templates", "Developer experience",
            ],
            nice_to_have=["Crossplane", "Pulumi", "Policy-as-code (OPA)"],
            expected_projects=[
                "Internal platform / portal", "Reusable service template",
                "GitOps workflow",
            ],
            summary="Builds the platform other engineers ship on top of.",
        ),
        Role(
            id="qa_automation",
            name="QA Automation Engineer",
            category="Quality",
            core_skills=[
                "Selenium", "Playwright", "Cypress", "Pytest",
                "TestNG/JUnit", "API testing (Postman/REST Assured)",
                "Performance testing (k6/JMeter)", "CI integration",
                "Test design", "BDD (Cucumber)",
            ],
            nice_to_have=["Visual regression", "Mobile automation (Appium)", "Contract tests"],
            expected_projects=[
                "End-to-end test suite", "API automation framework",
                "Performance baseline harness",
            ],
            summary="Automates testing across the stack.",
        ),
    ]
}


def list_roles() -> List[Dict[str, str]]:
    """Public listing payload used by the /roles endpoint."""
    return [
        {
            "id": role.id,
            "name": role.name,
            "category": role.category,
            "summary": role.summary,
            "faang_relevant": role.faang_relevant,
        }
        for role in _ROLES.values()
    ]


def get_role(role_id: str) -> Optional[Role]:
    return _ROLES.get(role_id)


ROLES = _ROLES
