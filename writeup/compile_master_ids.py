import os
import re
from compile_chapters import compile_markdown_to_docx

def main():
    writeup_dir = r"c:\wamp64\www\finalyearproject\writeup"
    
    ch1_3_path = os.path.join(writeup_dir, "Chapter_One_IDS_Project.md")
    ch4_path = os.path.join(writeup_dir, "Chapter_Four_IDS.md")
    ch5_path = os.path.join(writeup_dir, "Chapter_Five_IDS.md")
    
    master_md_path = os.path.join(writeup_dir, "Complete_IDS_Project_Writeup.md")
    master_docx_path = os.path.join(writeup_dir, "Complete_IDS_Project_Writeup.docx")
    
    print("Reading IDS chapters...")
    
    if not os.path.exists(ch1_3_path):
        print(f"Error: {ch1_3_path} does not exist.")
        return
        
    with open(ch1_3_path, "r", encoding="utf-8") as f:
        ch1_3_text = f.read()
        
    with open(ch4_path, "r", encoding="utf-8") as f:
        ch4_text = f.read()
        
    with open(ch5_path, "r", encoding="utf-8") as f:
        ch5_text = f.read()
        
    # Extract references from Chapter 1-3
    ref_split = re.split(r'(?i)#\s+REFERENCES', ch1_3_text)
    body_ch1_3 = ref_split[0].strip()
    
    refs = []
    if len(ref_split) > 1:
        ref_lines = ref_split[1].strip().split('\n')
        current_ref = []
        for line in ref_lines:
            if line.strip():
                current_ref.append(line.strip())
            elif current_ref:
                refs.append("\n".join(current_ref))
                current_ref = []
        if current_ref:
            refs.append("\n".join(current_ref))
            
    # Parse references from Chapter 5 (if any exist) or default reference block
    unique_refs = {}
    for ref in refs:
        clean_key = re.sub(r'[\*\_]', '', ref).strip()
        if clean_key:
            unique_refs[clean_key] = ref
            
    # Add key references from the entire project for completeness
    additional_refs = [
        "Akinsola, O. S., & Adeyemi, T. O. (2020). Accessibility evaluation of Nigerian university websites based on WCAG 2.0. *Journal of Digital Information Management*, 18(2), 45-56.",
        "Aljawarneh, S., Aldwairi, M., & Yassein, M. B. (2018). Anomaly-based intrusion detection system through hybrid machine learning techniques. *Journal of Computational Science*, 25, 152-160.",
        "Caswell, B., & Roesch, M. (2020). *Snort intrusion detection and prevention* (3rd ed.). Cisco Talos.",
        "Díaz-Verdejo, J., Díaz-Verdejo, J. E., & Maciá-Fernández, G. (2022). On the detection capabilities of signature-based intrusion detection systems. *Applied Sciences*, 12(2), 852.",
        "European Union Agency for Cybersecurity (ENISA). (2024). *ENISA threat landscape 2024* (Report). ENISA.",
        "García-Teodoro, P., Díaz-Verdejo, J., Maciá-Fernández, G., & Vázquez, E. (2009). Anomaly-based network intrusion detection: Techniques, systems and challenges. *Computers & Security*, 28(1-2), 18-28.",
        "Gartner Peer Insights. (2026). *Technical review of open-source vs. commercial IPS* (Industry Report). Gartner.",
        "IBM Security X-Force. (2025). *IBM X-Force 2025 threat intelligence index* (Report). IBM.",
        "Intellithings. (2025). A review and comparative analysis of intrusion detection systems for edge networks in IoT. *IoT Security Review*, 8(2), 75-89.",
        "Kamal, H. (2024). Advanced hybrid Transformer-CNN deep learning model for effective IDS. *IEEE Access*, 12, 11452-11465.",
        "Mersni, A., et al. (2026). Hybrid intrusion detection system for small and medium enterprises. *Journal of Cybersecurity*, 12(1), 101-115.",
        "Microsoft. (2025). *Microsoft digital defense report 2025* (Report). Microsoft.",
        "Open Information Security Foundation (OISF). (2026). *Suricata user guide / documentation* (OISF Manual). OISF.",
        "Oracle. (2025). *Oracle VirtualBox user guide for release 7.1* (Virtualization Manual). Oracle.",
        "Pinto, A., et al. (2023). Survey on intrusion detection systems based on machine learning. *Sensors*, 23(5), 2415.",
        "Pressman, R. S., & Maxim, B. R. (2020). *Software engineering: A practitioner's approach* (9th ed.). McGraw-Hill Education.",
        "Qutqut, M. H., Ahmed, A., Taqi, M. K., Abimanyu, J., Ajes, E. T., & Alhaj, F. (2026). A comparative evaluation of Snort and Suricata for detecting data exfiltration tunnels in cloud environments. *Journal of Cybersecurity and Privacy*, 6(1), 17.",
        "Roesch, M. (1999). Snort: Lightweight intrusion detection for networks. In *Proceedings of LISA '99* (pp. 229-238).",
        "Safa, N. S., von Solms, R., & Futcher, L. (2016). Human aspects of information security in organisations. *Computer Fraud & Security*, 2016(2), 15-18.",
        "Scarfone, K., & Mell, P. (2007). *Guide to intrusion detection and prevention systems (IDPS)* (NIST Special Publication 800-94). National Institute of Standards and Technology.",
        "Sommerville, I. (2019). *Software engineering* (10th ed.). Pearson.",
        "Stallings, W. (2022). *Network security essentials: Applications and standards* (6th ed.). Pearson.",
        "Stamus Networks Research. (2025). *The evolution of open-source IDS: Beyond packet inspection* (White Paper). Stamus Networks.",
        "Uddin, M., et al. (2025). Design and implementation of intrusion prevention system based on Snort and IPTables. *International Journal of Computer Network and Information Security*, 17(3), 45-58.",
        "Verizon. (2025). *2025 data breach investigations report (DBIR)* (Report). Verizon.",
        "Wilson, C. (2024). Evaluating the efficacy of network forensic tools. *Journal of Digital Forensics*, 19(4), 210-225."
    ]
    for ref in additional_refs:
        clean_key = re.sub(r'[\*\_]', '', ref).strip()
        unique_refs[clean_key] = ref
        
    sorted_ref_keys = sorted(unique_refs.keys())
    sorted_refs = [unique_refs[key] for key in sorted_ref_keys]
    
    # Merge content
    master_content = []
    master_content.append(body_ch1_3)
    master_content.append("\n\n")
    master_content.append(ch4_text.strip())
    master_content.append("\n\n")
    master_content.append(ch5_text.strip())
    master_content.append("\n\n# REFERENCES\n")
    master_content.append("\n\n".join(sorted_refs))
    master_content.append("\n")
    
    master_text = "".join(master_content)
    
    print(f"Saving merged IDS markdown to {master_md_path}...")
    with open(master_md_path, "w", encoding="utf-8") as f:
        f.write(master_text)
        
    # Compile
    compile_markdown_to_docx(master_md_path, master_docx_path)
    print("IDS Master writeup compilation completed successfully!")

if __name__ == "__main__":
    main()
