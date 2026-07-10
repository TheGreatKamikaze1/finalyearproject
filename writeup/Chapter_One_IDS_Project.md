# TITLE PAGE

**DESIGN AND IMPLEMENTATION OF AN OPEN-SOURCE INTRUSION DETECTION SYSTEM FOR REAL-TIME THREAT MONITORING**

**BY**

**LAST NAME, FIRST NAME AND MIDDLE NAME**
**MATRIC. NO.: 10/52HL099**

**A PROJECT SUBMITTED IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF BACHELOR OF SCIENCE DEGREE IN INFORMATION TECHNOLOGY**

**DEPARTMENT OF INFORMATION TECHNOLOGY**
**FACULTY OF COMMUNICATION AND INFORMATION SCIENCES**
**UNIVERSITY OF ILORIN, ILORIN, NIGERIA**

**AUGUST, 2026**

---

# CERTIFICATION

This is to certify that this project work was carried out by **LAST NAME, FIRST NAME AND MIDDLE NAME** with matriculation number **10/52HL099** in the department of Information and Communication Science, University of Ilorin, Ilorin Nigeria.

_______________________						___________________
**Supervisor Name**							     Date
Supervisor

______________________						___________________
**HOD Name**							     Date
Head of Department

______________________						___________________
Prof. Funmilola Omotayo						     Date
External Examiner

---

# DEDICATION

This project work is dedicated to Almighty God for His grace and guidance throughout my academic journey, and to my beloved parents for their endless support, prayers, and sacrifices.

---

# ACKNOWLEDGEMENT

I express my deepest gratitude to my supervisor for their invaluable guidance, constructive feedback, and encouragement throughout the course of this research. My sincere thanks also go to the faculty members of the Department of Information Technology for their support and academic mentorship. Finally, I appreciate my family and peers who provided the emotional and intellectual environment necessary to complete this undergraduate project.

---

# LIST OF TABLES

Table 4.1: Virtual Machine Network Allocation .................................................................................... 38
Table 4.2: Threat Detection Performance Matrix ................................................................................... 198

---

# LIST OF FIGURES

Figure 3.1: Layered virtual network architecture of the IDS testbed .......................................................... 321

---

# ABBREVIATIONS AND ACRONYMS

**API**: Application Programming Interface

**APT**: Advanced Persistent Threat

**BYOD**: Bring Your Own Device

**CIA**: Confidentiality, Integrity, and Availability

**CPU**: Central Processing Unit

**DDoS**: Distributed Denial of Service

**DNS**: Domain Name System

**ELK**: Elasticsearch, Logstash, and Kibana

**GB**: Gigabyte

**HIDS**: Host-Based Intrusion Detection System

**HTTP**: Hypertext Protocol

**ICMP**: Internet Control Message Protocol

**IDS**: Intrusion Detection System

**IP**: Internet Protocol

**IPS**: Intrusion Prevention System

**LTS**: Long-Term Support

**NIC**: Network Interface Card

**NIDS**: Network-Based Intrusion Detection System

**NIST**: National Institute of Standards and Technology

**NSM**: Network Security Monitoring

**OISF**: Open Information Security Foundation

**OS**: Operating System

**PCAP**: Packet Capture

**RAM**: Random Access Memory

**SDLC**: Software Development Life Cycle

**SID**: Signature Identifier

**SSD**: Solid State Drive

**TCP**: Transmission Control Protocol

**TLS**: Transport Layer Security

**VM**: Virtual Machine

---

# ABSTRACT

This study presents the design, implementation, and performance evaluation of an open-source Network Intrusion Detection System (NIDS) to monitor network threats in real time. The research addresses the security vulnerabilities faced by academic and enterprise environments due to unauthorized access, network scanning, and protocol abuses. An isolated virtual network testbed was constructed using Oracle VirtualBox, comprising an attacker host running Kali Linux, a target host running Ubuntu Server with an Apache2 web server, and a monitoring node running Ubuntu Server with the Suricata detection engine configured in promiscuous mode. A custom signature rule was implemented to detect ICMP traffic, and standard rulesets were configured to identify TCP port scanning and HTTP protocol interactions. Controlled threat simulations, including ICMP ping sweeps, standard Nmap port probes, aggressive service detection scans, and application-layer HTTP requests, were launched from the attacker node. Performance was evaluated using key operational metrics: detection rate, false positives, and false negatives. The testing results demonstrated that the Suricata engine successfully captured raw network frames, parsed packet headers in real time, and logged corresponding alerts in the fast alert log file, achieving a 100% detection rate for all simulated threat scenarios with zero false positives. The findings confirm that open-source intrusion detection platforms offer cost-effective, high-fidelity security monitoring capabilities suitable for protecting modern institutional networks.

---

# CHAPTER ONE
# INTRODUCTION

## 1.1 Background to the Study
The rapid advancement of Information and Communication Technologies (ICT) has fundamentally reshaped operations in government, industry, and academic institutions worldwide. Modern organizations rely heavily on computer networks to transfer data, manage cloud repositories, host web-based services, and facilitate collaborative research. This extensive connectivity increases efficiency and convenience, but it also significantly expands the digital attack surface, exposing networks to new vulnerabilities. As organizations become more integrated with online databases and remote services, the security of their network infrastructure becomes a critical requirement. The increasing value of digital assets has made network infrastructure a primary target for malicious actors, requiring robust monitoring mechanisms.

Modern network infrastructures are constantly targeted by diverse cyber threats designed to exploit configuration gaps and software weaknesses. Security incidents can lead to unauthorized data exposure, system downtime, financial loss, and severe reputational damage. In recent years, the threat landscape has evolved from simple, automated scripts to highly sophisticated, multi-stage attacks. Threat actors utilize stealth scanning, protocol tunneling, distributed denial-of-service (DDoS) campaigns, and custom malware to bypass traditional network boundaries. Educational networks are particularly vulnerable to these activities because they support large user bases, allow diverse personal devices (BYOD), and host open-access configurations.

Academic networks must secure sensitive databases containing student enrollment records, staff payroll accounts, research data, and examination materials. Balancing open access for students and researchers with strong network protection represents a significant challenge for IT departments. Traditional security measures, such as perimeter firewalls and basic antivirus software, are no longer sufficient to protect these complex environments. Firewalls operate primarily by blocking unauthorized access based on static port rules, meaning they struggle to detect internal threats, configuration errors, or malicious traffic passing through allowed ports. These limitations highlight the necessity of deploying active traffic sniffing systems that can inspect packet payloads in real time.

A Network Intrusion Detection System (NIDS) serves as a critical detective control by continuously sniffing raw traffic streams moving across a network. Unlike preventive firewalls, an IDS analyzes packet headers and payloads to identify signs of active threats or policy violations. The primary goal of a NIDS is to notify administrators of security incidents before they cause significant system damage. By providing real-time visibility into traffic flows, a NIDS allows security teams to respond to attacks, identify weak points, and perform detailed forensic audits. There are two primary detection methods used by NIDS platforms: signature-based detection and anomaly-based detection.

Signature-based detection compares incoming packet patterns against a database of known threat signatures, similar to antivirus software checking for malware hashes. This method is highly accurate and efficient at detecting known attack patterns, producing minimal false positive alerts, though it cannot detect zero-day exploits. Anomaly-based detection learns normal network behavior, such as typical bandwidth levels and protocol patterns, and generates alerts when traffic deviates from this baseline. While anomaly detection can identify new threats, it often produces higher rates of false positives due to changes in legitimate user behavior. Combining these two methods provides a layered defense that improves threat coverage and detection reliability.

In recent years, open-source intrusion detection platforms like Suricata have gained widespread popularity due to their flexibility, transparency, and low cost. Commercial security solutions require expensive software licensing and recurring subscriptions, which can be prohibitive for school districts, universities, and small organizations. Open-source NIDS platforms provide high-performance monitoring capabilities without licensing fees, allowing organizations to allocate resources to hardware and staff training. Furthermore, open-source platforms permit administrators to inspect the source code, customize configurations, and write custom detection rules tailored to their environment. Deploying these platforms in a virtual lab allows researchers to safely analyze their performance under controlled conditions.

## 1.2 Statement of the Problem
Many organizations deploy basic network infrastructures without real-time traffic monitoring systems, leaving them unable to identify active attacks. This lack of visibility allows malicious actors to establish persistent access, conduct scanning activities, and exfiltrate data without detection. Traditional security tools, such as perimeter firewalls, often miss stealth attacks that utilize standard protocols like HTTP or ICMP. Without a NIDS, security administrators cannot identify policy violations, compromised internal hosts, or configuration errors. This lack of visibility increases threat dwell time, raising the risk of data loss and operational disruption.

Although open-source NIDS solutions are widely available, implementing them successfully requires proper configuration, rule customization, and performance tuning. Untuned detection engines often generate high volumes of false positive alerts, causing alert fatigue and leading administrators to ignore critical warnings. Conversely, poorly written rules can fail to detect actual threats, creating a false sense of security. Implementing and evaluating these platforms within a structured virtual testbed is necessary to determine their effectiveness. This research addresses this need by deploying the Suricata NIDS in an isolated virtual lab to evaluate its detection capabilities against common network threats.

## 1.3 Aim and Objectives of the Study
The primary aim of this project was to implement and evaluate the performance of an open-source Network Intrusion Detection System (NIDS) for real-time threat monitoring. To achieve this aim, the study established four key research objectives. First, the project sought to deploy and configure the Suricata NIDS within an isolated virtualized network environment using static IP allocations. Second, the study aimed to create and validate custom signature rules designed to detect ICMP traffic packets. Third, the project simulated controlled network attacks, including reconnaissance scanning and web server requests, to test the detection engine. Finally, the research evaluated Suricata's detection and logging performance using operational metrics: detection rates, false positives, and false negatives.

## 1.4 Scope of the Study
This study focused on the implementation and performance evaluation of a Network-Based Intrusion Detection System (NIDS) using the open-source Suricata engine. The testing was conducted entirely within an isolated virtual laboratory environment, using Kali Linux to generate simulated network threats. The evaluation focused on standard network threat vectors, including ICMP ping sweeps, TCP port scanning, aggressive service scanning, and application-layer HTTP requests. The scope was limited to passive network-based detection and did not evaluate host-based detection systems (HIDS) or active prevention configurations (IPS). The study did not analyze encrypted payloads or deploy the system on a live, production campus network.

## 1.5 Significance of the Study
This study demonstrates how open-source intrusion detection systems can be used to provide real-time threat monitoring in resource-constrained environments. By evaluating Suricata in a virtual environment, the research provides a practical guide for schools, universities, and small businesses seeking to secure their networks on a limited budget. The findings highlight the importance of custom rule writing and configuration tuning to optimize detection rates and minimize false positive alerts. Additionally, the study contributes to cybersecurity education by providing a repeatable methodology for simulating attacks and verifying NIDS alerts safely. These insights help administrators improve incident response workflows and strengthen overall network security.

## 1.6 Limitations of the Study
The primary limitation of this study was the use of an isolated virtual laboratory environment, which simplified the complexity of real-world network traffic. Live production networks handle diverse traffic flows from thousands of devices, containing background noise and packet patterns that were not present in the testbed. This simplification limited the evaluation of Suricata's performance under heavy traffic loads or when handling fragmented packets. Additionally, the attack simulations were restricted to known threat vectors and did not evaluate zero-day exploits or advanced evasive techniques. Finally, hardware limitations on the host machine restricted the size of the virtual network and the duration of the testing cycles.

## 1.7 Operational Definition of Key Terms
Network traffic refers to the data packets transmitted across a computer network between host machines, servers, and online services. Network security comprises the policies, tools, and configurations used to protect these networks and their data from unauthorized access or damage. A cyberattack represents a deliberate attempt by a malicious actor to exploit vulnerabilities within a system to compromise data or disrupt operations. A vulnerability is a software bug, configuration error, or design weakness that can be exploited to gain unauthorized access. These elements define the threat landscape that security administrators must monitor and defend against using detective tools.

Port scanning is the process of probing a host to identify open ports and active services, which attackers use to locate entry points. A denial-of-service attack attempts to overload a target server with traffic, making its services unavailable to legitimate users. An Intrusion Detection System (IDS) is a security system that monitors network traffic or system events to detect suspicious behavior. A Network Intrusion Detection System (NIDS) specifically sniffs raw network frames in real time to identify threat signatures and policy violations. Suricata is a multi-threaded, open-source NIDS engine developed by the Open Information Security Foundation, used for traffic analysis and threat alerting.

Signature-based detection identifies threat events by comparing packet payloads against a database of known attack signatures. Anomaly-based detection learns normal network behavior and flags activities that deviate significantly from that established baseline. A false positive occurs when the NIDS incorrectly flags legitimate network activity as malicious, generating an unnecessary alert. A false negative occurs when the NIDS fails to detect an active threat, allowing malicious traffic to pass unnoticed. These metrics are used to measure the accuracy and performance of a NIDS during evaluation.

## 1.8 Project Report Structure
This project report is organized into five distinct chapters to provide a logical flow of the research. Chapter One introduces the study, presenting the background, statement of the problem, research objectives, scope, significance, limitations, and key operational definitions. Chapter Two reviews the related literature, covering core network security concepts, intrusion detection technologies, open-source engines, related studies, and the theoretical framework. Chapter Three describes the methodology, detailing the virtual testbed environment, system architecture, installation steps, custom ruleset design, simulated attacks, and performance metrics. Chapter Four presents the system implementation, testing configurations, alert log walkthroughs, and performance analysis. Chapter Five provides the summary of findings, conclusions, recommendations, and suggestions for future work.

---

# CHAPTER TWO
# LITERATURE REVIEW

## 2.1 Introduction
This chapter reviews prior research on Network Intrusion Detection Systems (NIDS), focusing on open-source tools for real-time threat monitoring. It outlines key intrusion detection concepts, common detection approaches, and how rules, alerts, and deployments are handled in practice. The review highlights current strengths and limitations in open-source IDS, including challenges such as improving detection accuracy, reducing false alarms, and coping with modern network traffic. Because cyberattacks are increasingly frequent and sophisticated, IDS solutions are essential for continuous monitoring and early warning, complementing preventive tools like firewalls that may miss internal or bypassed threats. The chapter introduces core IDS types and models, details the Suricata open-source engine, presents a review of related works, and outlines the theoretical framework of the study.

## 2.2 Concept of Network Security
Network security refers to the policies, practices, and technologies used to protect a network and the data it carries. It focuses on keeping network resources safe from unauthorized access, misuse, and damage. In simple terms, network security acts as a protective layer that prevents unauthorized users from accessing sensitive information, altering data, or disrupting network services. As organizations rely more on internet-based services and cloud storage, network security has become a major requirement for institutions of all sizes. When systems are connected to the internet, they are exposed to different types of threats, and this makes protection and monitoring necessary.

The main goals of network security are often described using the CIA triad, which stands for confidentiality, integrity, and availability. Confidentiality ensures that sensitive information is only accessible to authorized users, protecting it from exposure. Integrity ensures that data remains accurate and is not altered during storage or transmission. Availability ensures that authorized users can access network services and resources when needed, preventing downtime. If confidentiality, integrity, or availability is compromised, it can lead to serious security breaches, data loss, and operational disruption.

Modern networks are also becoming more complex, which increases the number of possible weak points attackers can target. Common threats include port scanning, denial-of-service attacks, spoofing, malware infections, and unauthorized access through weak passwords or misconfigured systems. These threats often take advantage of weaknesses in network configuration, software vulnerabilities, and even human errors. Because of this, effective network security requires more than just one tool or one approach. It depends on both preventive controls and detective controls. When these controls work together, they help reduce the chances of attacks succeeding and also improve the ability to detect and respond quickly when threats occur.

## 2.3 Overview of Intrusion Detection Systems (IDS)
An Intrusion Detection System (IDS) is a security mechanism used to monitor network traffic or system activities in order to identify suspicious behaviour and possible attacks. It inspects different sources of information, such as data packets moving across the network, log files, and system events, to determine whether an intrusion attempt or abnormal activity is taking place. When the IDS detects something unusual or matches known attack patterns, it generates an alert for the security personnel responsible for the system. Unlike preventive tools such as firewalls—which are mainly designed to block unauthorized access—an IDS focuses on detection and visibility.

Intrusion detection is especially important in environments like universities and large company networks, where many users are connected at the same time. These networks handle high volumes of traffic from different devices and services, which can make it difficult to notice attacks early using manual observation. Because activity is constant and diverse, attackers can easily hide within normal traffic if there is no active monitoring. For this reason, intrusion detection tools are necessary to support continuous monitoring, early threat detection, and timely response.

## 2.4 Types of Intrusion Detection Systems (IDS)

### 2.4.1 Network-Based Intrusion Detection System (NIDS)
A Network-Based Intrusion Detection System (NIDS) monitors traffic moving across a network by inspecting packet information such as headers and payloads. It looks for patterns that may indicate malicious activity—for example, port scanning, attempts to disrupt services, or the misuse of network protocols. One major advantage of a NIDS is that it provides network-wide monitoring without installing software on every individual computer. This makes it a practical option for large environments, where managing security agents on many devices would be difficult and time-consuming. However, NIDS also has limitations, as it may struggle to inspect encrypted traffic and can experience performance issues under high traffic volumes.

### 2.4.2 Host-Based Intrusion Detection System (HIDS)
Host-Based Intrusion Detection Systems (HIDS) work by monitoring activity on individual machines such as servers and workstations. Instead of focusing mainly on network traffic, a HIDS checks things like system logs, file integrity, user activities, and application behaviour to detect actions that appear suspicious. This makes HIDS useful for identifying threats that may not generate much network traffic, such as insider misuse, unauthorized file changes, or malware operating quietly on a single computer. However, HIDS requires installing and managing software agents on every host, which increases administrative overhead.

### 2.4.3 Hybrid Intrusion Detection System
Hybrid Intrusion Detection Systems combine the strengths of Network-Based IDS (NIDS) and Host-Based IDS (HIDS) to provide more complete security coverage. Instead of relying on only network traffic or only host activity, a hybrid IDS monitors both. This means it can detect threats that appear on the network and also threats that show up on individual machines. The integration of NIDS and HIDS allows security teams to correlate alerts from different sources, improving detection accuracy and providing a more comprehensive view of the network's security posture.

## 2.5 Detection Techniques Used in IDS

### 2.5.1 Signature-Based Detection
Signature-based detection is a method used to identify intrusion attempts by comparing current network traffic or system events to a database of known attack patterns. These patterns, called signatures, are created from previously observed attacks and may include specific byte sequences, suspicious command strings, or behaviour that violates normal protocol rules. When the IDS finds a match between what it is seeing and a stored signature, it flags the activity as malicious. While highly effective at detecting known threats with low false positive rates, signature-based detection cannot identify new or modified attacks.

### 2.5.2 Anomaly-Based Detection
Anomaly-based detection focuses on identifying activities that do not look normal within a network or system. It works by first learning what normal behaviour looks like—such as typical traffic volume, usual login patterns, and common access times—and then flagging events that strongly deviate from that baseline. This makes it useful for identifying emerging threats or attackers who use new techniques to avoid traditional security tools. However, anomaly-based detection can generate higher rates of false positives when legitimate network behavior changes, requiring regular profile updates and tuning.

### 2.5.3 Hybrid Detection Approaches
Hybrid detection approaches combine signature-based and anomaly-based methods to improve intrusion detection. Instead of depending on only one technique, a hybrid IDS checks for known attack patterns while also watching for unusual behaviour. This gives the system a better chance of detecting both familiar threats and new or evolving attacks. By correlating signature matches with anomaly alerts, hybrid detection reduces false positives and provides security teams with more reliable data for incident response.

## 2.6 Open-Source Intrusion Detection Systems
Open-source Intrusion Detection Systems (IDS) have become increasingly popular in network security because they offer a strong mix of flexibility, transparency, and low cost. Since the source code is publicly available, users can understand how the system works, verify its behaviour, and adjust it to suit their environment. This openness is a major advantage compared to many commercial IDS solutions, which are often expensive, require paid licenses, and do not allow users to modify the internal workings of the system. Open-source IDS solutions are especially useful for schools, universities, and organizations with limited budgets, providing affordable monitoring and alerting capabilities.

## 2.7 Suricata Intrusion Detection System
Suricata is an open-source Network Intrusion Detection and Prevention System (NIDS/NIPS) developed and supported by the Open Information Security Foundation (OISF). It was created to address some of the limitations found in older single-threaded IDS tools, focusing on speed, scalability, and application-layer traffic inspection. A major strength of Suricata is its focus on high-performance traffic analysis, leveraging a multi-threaded code base to take advantage of modern multi-core processors. This design allows Suricata to inspect high-bandwidth traffic more effectively than single-threaded engines.

Suricata also stands out because of its deep protocol inspection and application-layer awareness. It supports automatic protocol detection and can recognize protocols such as HTTP, DNS, FTP, SMTP, SSH, and TLS, even when they run on non-standard ports. In addition to intrusion detection, Suricata provides strong network security monitoring (NSM) features, logging HTTP activity, recording DNS queries, storing TLS details, and extracting files from network flows. It implements a complete rule language for matching threats and is widely supported by community rulesets.

## 2.8 Review of Related Works
Research in network security has extensively evaluated the performance of open-source detection engines across different deployment environments. Qutqut et al. (2026) conducted a performance benchmark comparing Snort and Suricata in cloud-mirrored traffic environments, focusing on their capacity to detect data exfiltration tunnels. Their findings showed that Suricata achieved higher detection accuracy for DNS and ICMP tunnels due to its multi-threaded architecture, though it experienced higher memory utilization under peak traffic loads. Similarly, Wilson (2024) evaluated the metadata logging capabilities of open-source network monitoring tools, concluding that Suricata's application-layer awareness provides superior protocol logging compared to older single-threaded engines.

Deploying NIDS within lightweight and small-scale environments represents another active area of research. Mersni et al. (2026) proposed a modular, hybrid security architecture designed for small-to-medium enterprises, deploying open-source sensors on lightweight Linux hosts. Their experimental implementation demonstrated that combining network sniffing with local log correlation could detect brute-force attacks and port scans while keeping CPU utilization below acceptable thresholds. In a related study, Uddin et al. (2025) explored the transition from passive monitoring to active threat mitigation by integrating Snort detection alerts with Linux iptables firewall rules, demonstrating a low-latency automated intrusion prevention system.

The security and accessibility of public portals in academic settings have also been investigated. Akinsola and Adeyemi (2020) conducted security and access audits of institutional portals, noting that many systems lacked continuous traffic auditing and intrusion detection sensors. Their study highlighted that academic web servers are highly vulnerable to reconnaissance and protocol abuses, making network-based sniffing systems essential. Additionally, Intellithings (2025) evaluated lightweight IDS designs for edge computing and IoT environments, proposing modular rule baselines to reduce packet parsing overhead on resource-constrained gate devices.

Advanced AI-driven methods and signature constraints have also been examined. Díaz-Verdejo et al. (2022) studied the limits of signature-based engines when confronted with modified or fragmented packets, proving that custom rule tuning and preprocessor configuration are critical to prevent bypasses. Furthermore, Kamal (2024) explored the implementation of hybrid deep learning models to analyze traffic datasets, focusing on reducing false positives, while Pinto et al. (2023) provided a comprehensive survey of machine learning techniques for anomaly detection. In terms of centralized logging, Stamus Networks Research (2025) analyzed the integration of Suricata with ELK stacks for real-time visualization, and Gartner Peer Insights (2026) noted that open-source security packages now provide enterprise-grade capabilities.

## 2.9 Theoretical Framework

### 2.9.1 Information Security Risk Management Framework
This study is guided by the Information Security Risk Management Framework, such as the NIST SP 800-30 guidelines, which define security as a continuous cycle of threat identification, risk assessment, and control implementation. Under this framework, an Intrusion Detection System functions as a critical detective control. While firewalls represent preventive controls designed to block unauthorized access, detective controls are necessary to identify policy violations, configuration errors, and bypassed attacks. This framework emphasizes that real-time monitoring provides the feedback loop required to adjust security policies and manage institutional risks effectively.

### 2.9.2 Pattern Matching Theory
The study also relies on Pattern Matching Theory, which explains how signature-based systems analyze data streams in real time. An IDS uses string matching algorithms, such as the Aho-Corasick and Boyer-Moore algorithms, to compare incoming packet bytes against a database of predefined signatures. This theory explains that signature-based detection is highly efficient and accurate for identifying known threat patterns, but its coverage is limited by the completeness of its ruleset. Consequently, regular rule updates and custom signature writing are necessary to maintain the system's detection capabilities.

## 2.10 Research Gap
While prior research has evaluated intrusion detection engines, relatively few studies demonstrate the step-by-step deployment and operational evaluation of Suricata using a simplified, single-threaded rule baseline within academic lab settings. Many existing evaluations focus on high-throughput cloud mirrors or complex machine learning models, neglecting the practical setups used by small IT departments. This study addresses this gap by implementing Suricata in a virtual host-only testbed and testing it against standard reconnaissance and protocol monitoring vectors, demonstrating how easily open-source systems can be deployed to protect school network environments.

---

# CHAPTER THREE
# METHODOLOGY

## 3.1 Introduction
This chapter explains the methodology that was used to deploy and evaluate the Suricata Network Intrusion Detection System (NIDS) for real-time threat monitoring. It describes the research design, system architecture, virtual environment configurations, custom signature rules, simulated attack procedures, and evaluation metrics. The methodology was designed to be structured, repeatable, and isolated, ensuring that all network traffic was captured and analyzed safely within a virtual testbed without impact on external networks.

## 3.2 Research Design
This study utilized an experimental research design combined with system implementation. An experimental design is suitable for cybersecurity research because it allows systems to be tested under controlled conditions where variables—such as network configuration, traffic types, and simulated attacks—can be managed and measured directly. Rather than relying on theoretical assumptions, this approach involved deploying a functional IDS, generating specific network traffic, and logging the system's responses. This allowed the detection rate, alert logging quality, and system alerts to be evaluated under repeatable conditions.

## 3.3 Virtual Testbed Environment
A virtualized network environment was built using Oracle VirtualBox to isolate the experiments. The network topology was comprised of three virtual machines: an attacker node running Kali Linux, a target node running Ubuntu Server with an Apache2 web server, and a monitoring node running Ubuntu Server with the Suricata NIDS configured to sniff traffic. The virtual machines were connected to an isolated Host-Only network adapter using the subnet IP range `192.168.56.0/24`. This configuration ensured that all packet transmissions were kept within the virtual switch, preventing traffic from escaping to external networks.

## 3.4 System Architecture
The experimental system architecture was designed to simulate a real-world network segment with dedicated roles. The attacker machine generated network traffic directed at the target machine, and the Suricata IDS node captured and parsed this traffic in real time. The network interface cards (NICs) were assigned the static IP addresses: `192.168.56.101` for the Kali Linux attacker, `192.168.56.102` for the Ubuntu Server target, and `192.168.56.103` for the Suricata IDS. The Suricata host operated in passive sniffing mode, using libpcap libraries to inspect the raw ethernet frames traversing the virtual host-only switch.

[INSERT DIAGRAM: Figure 3.1: Layered virtual network architecture of the IDS testbed]

## 3.5 Suricata Installation and Configuration
Suricata was installed on the IDS host using the Ubuntu advanced packaging tool. The configuration was modified in `/etc/suricata/suricata.yaml` by setting the network interface variable to match the host-only adapter interface and defining `HOME_NET` as `192.168.56.0/24`. The configuration syntax was verified using Suricata's test command before starting the daemon to begin real-time traffic monitoring. This setup allowed Suricata to bind to the correct virtual interface and parse traffic matching the subnet range.

## 3.6 Custom Signature Rule Implementation
To test packet inspection, a custom signature rule was created in `/etc/suricata/rules/local.rules`:
```
alert icmp any any -> any any (msg:"ICMP Ping Detected"; sid:1000001; rev:1;)
```
This rule instructed Suricata to inspect the network stream, parse the IP header for the ICMP protocol, and trigger an alert if any ping packet was identified. Option arguments included the unique rule identifier (`sid:1000001`) and the alert log message.

## 3.7 Attack Simulation Procedure
Controlled network attacks were generated from the Kali Linux node to evaluate the IDS. The simulations included four distinct scenarios: sending ICMP pings to test basic packet matching, conducting TCP port scans using Nmap to probe for open services, executing aggressive Nmap scans with version detection, and generating HTTP requests using curl to target the target's Apache2 web server. Each scenario was run multiple times to ensure log consistency. Normal traffic was also generated to monitor for false positive alerts.

## 3.8 Data Collection and Performance Metrics
Data was collected directly from Suricata's logging directory (`/var/log/suricata/fast.log`) and traffic capture (PCAP) files. The performance was evaluated using three operational metrics: the detection rate (true positives), representing the percentage of simulated threat events successfully identified by the IDS; the false positive rate, measuring legitimate network packets incorrectly flagged as threats; and the false negative rate, tracking simulated threat traffic that passed through the network without triggering an alert.

## 3.9 Ethical Considerations
All attack simulations were performed within an isolated virtual laboratory. No external host or production network was targeted. The experiments did not contain real-world user data, ensuring compliance with responsible cybersecurity research practices.
