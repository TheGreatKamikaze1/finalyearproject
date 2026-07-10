import os
import re
from compile_chapters import compile_markdown_to_docx

def main():
    writeup_dir = r"c:\wamp64\www\finalyearproject\writeup"
    
    ch1_3_path = os.path.join(writeup_dir, "Chapter_One_AEP.md")
    ch4_path = os.path.join(writeup_dir, "Chapter_Four.md")
    ch5_path = os.path.join(writeup_dir, "Chapter_Five.md")
    
    master_md_path = os.path.join(writeup_dir, "Complete_Project_Writeup.md")
    master_docx_path = os.path.join(writeup_dir, "Complete_Project_Writeup.docx")
    
    print("Reading chapters...")
    
    # Read Chapters 1-3
    with open(ch1_3_path, "r", encoding="utf-8") as f:
        ch1_3_text = f.read()
        
    # Read Chapters 4 and 5
    with open(ch4_path, "r", encoding="utf-8") as f:
        ch4_text = f.read()
    with open(ch5_path, "r", encoding="utf-8") as f:
        ch5_text = f.read()
        
    # Extract references from Chapter 1-3
    # Look for '# REFERENCES' heading
    ref_split = re.split(r'(?i)#\s+REFERENCES', ch1_3_text)
    body_ch1_3 = ref_split[0].strip()
    
    refs = []
    if len(ref_split) > 1:
        # Extract the lines of references
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
            
    # Clean references: remove duplicates and sort alphabetically
    unique_refs = {}
    for ref in refs:
        # Generate a sort key by stripping markdown emphasis like '*'
        clean_key = re.sub(r'[\*\_]', '', ref).strip()
        if clean_key:
            unique_refs[clean_key] = ref
            
    # Add key references from search for completeness (e.g. NUC, Sommerville, Pressman, Bass)
    additional_refs = [
        "Bass, L., Clements, P., & Kazman, R. (2021). *Software architecture in practice* (4th ed.). Addison-Wesley Professional.",
        "National Universities Commission (NUC). (2023). *Guidelines for e-learning in Nigerian universities*. Federal Republic of Nigeria.",
        "Pressman, R. S., & Maxim, B. R. (2020). *Software engineering: A practitioner's approach* (9th ed.). McGraw-Hill Education.",
        "Sommerville, I. (2019). *Software engineering* (10th ed.). Pearson.",
        "Akinsola, O. S., & Adeyemi, T. O. (2020). Accessibility evaluation of Nigerian university websites based on WCAG 2.0. *Journal of Digital Information Management*, 18(2), 45-56."
    ]
    for ref in additional_refs:
        clean_key = re.sub(r'[\*\_]', '', ref).strip()
        unique_refs[clean_key] = ref
        
    sorted_ref_keys = sorted(unique_refs.keys())
    sorted_refs = [unique_refs[key] for key in sorted_ref_keys]
    
    # Merge content
    # Chapter 4 has its '# CHAPTER FOUR' title, Chapter 5 has its '# CHAPTER FIVE' title.
    # We will strip excess spaces and put them together
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
    
    # Save the master markdown file
    print(f"Saving merged markdown to {master_md_path}...")
    with open(master_md_path, "w", encoding="utf-8") as f:
        f.write(master_text)
        
    # Compile the master markdown to DOCX
    compile_markdown_to_docx(master_md_path, master_docx_path)
    print("Master writeup compilation completed successfully!")

if __name__ == "__main__":
    main()
