import json
import random
import os

def generate_dataset(num_candidates=100, output_path="sample_candidates.json"):
    first_names = ["Aarav", "Aditi", "Amit", "Ananya", "Arjun", "Deepika", "Ishaan", "Kavya", "Nikhil", "Pooja", 
                   "Rahul", "Riya", "Rohan", "Sneha", "Vikram", "Neha", "Sanjay", "Meera", "Karan", "Tanvi"]
    last_names = ["Sharma", "Patel", "Verma", "Gupta", "Sen", "Nair", "Reddy", "Rao", "Joshi", "Choudhury",
                  "Mehta", "Bose", "Das", "Kumar", "Singh", "Mishra", "Pillai", "Deshmukh", "Kapoor", "Bahl"]
    
    tech_skills_pool = [
        "Python", "PyTorch", "TensorFlow", "SQL", "NLP", "Docker", "FastAPI", "Pandas", "NumPy",
        "Scikit-Learn", "AWS", "GCP", "Kubernetes", "Git", "CI/CD", "Hugging Face", "React", "TypeScript",
        "JavaScript", "Node.js", "Java", "C++", "Go", "Rust", "Hadoop", "Spark", "PostgreSQL", "MongoDB"
    ]
    
    soft_skills_pool = [
        "Communication", "Teamwork", "Leadership", "Mentoring", "Problem Solving", "Critical Thinking",
        "Agile Methods", "Collaboration", "Adaptability", "Time Management"
    ]
    
    institutions = [
        "Indian Institute of Technology (IIT) Bombay",
        "Indian Institute of Technology (IIT) Delhi",
        "Indian Institute of Science (IISc) Bangalore",
        "BITS Pilani",
        "National Institute of Technology (NIT) Trichy",
        "Delhi Technological University (DTU)",
        "International Institute of Information Technology (IIIT) Hyderabad"
    ]
    
    degrees = ["Bachelor's", "Master's", "PhD"]
    majors = ["Computer Science", "Artificial Intelligence", "Data Science", "Information Technology", "Mathematics"]
    
    certifications_pool = [
        "AWS Certified Solutions Architect", "TensorFlow Developer Certificate",
        "Google Cloud Professional Data Engineer", "DeepLearning.AI TensorFlow Developer",
        "Docker Certified Associate", "NVIDIA Deep Learning Institute Certificate"
    ]
    
    achievements_pool = [
        "Hackathon Winner 2025", "Published NLP research paper in EMNLP", "Top 1% on Kaggle",
        "Dean's List for Academic Excellence", "Open Source Core Contributor", "Outstanding Graduate Assistant"
    ]

    candidates = []
    
    for i in range(1, num_candidates + 1):
        f_name = random.choice(first_names)
        l_name = random.choice(last_names)
        name = f"{f_name} {l_name}"
        email = f"{f_name.lower()}.{l_name.lower()}@talentmind.io"
        
        years_exp = round(random.uniform(1.0, 15.0), 1)
        
        # Decide degree based on years of experience to make it realistic
        if years_exp > 8.0:
            degree = random.choice(["Master's", "PhD"])
        else:
            degree = random.choice(degrees)
            
        education = {
            "degree": degree,
            "major": random.choice(majors),
            "institution": random.choice(institutions)
        }
        
        # Select technical skills - some highly focused on AI, some general
        is_ai_focused = random.random() < 0.4
        if is_ai_focused:
            tech_skills = ["Python", "PyTorch", "NLP"] + random.sample(
                [s for s in tech_skills_pool if s not in ["Python", "PyTorch", "NLP"]], 
                k=random.randint(3, 7)
            )
        else:
            tech_skills = random.sample(tech_skills_pool, k=random.randint(4, 9))
            
        soft_skills = random.sample(soft_skills_pool, k=random.randint(2, 5))
        certifications = random.sample(certifications_pool, k=random.randint(0, 2))
        achievements = random.sample(achievements_pool, k=random.randint(0, 2))
        
        # Generate project histories
        projects = []
        for p_idx in range(random.randint(1, 3)):
            p_titles = ["LLM RAG Engine", "Distributed Scalable Tracker", "Neural Style Converter", 
                        "Data Integration Pipeline", "Autonomous Micro-rover Navigation"]
            projects.append({
                "title": f"{random.choice(p_titles)} v{p_idx+1}",
                "description": f"Developed an advanced framework using {', '.join(random.sample(tech_skills, min(2, len(tech_skills))))}."
            })
            
        # Work experiences
        work_experience = []
        num_jobs = 1 if years_exp <= 3 else (2 if years_exp <= 7 else 3)
        exp_chunk = years_exp / num_jobs
        for j_idx in range(num_jobs):
            titles = ["Software Developer", "Machine Learning Engineer", "Senior AI Research Engineer", "Tech Lead"]
            work_experience.append({
                "title": titles[min(j_idx, len(titles)-1)],
                "company": f"Global Tech Inc {j_idx+1}",
                "duration_years": round(exp_chunk, 1),
                "description": f"Worked with {', '.join(random.sample(tech_skills, min(3, len(tech_skills))))} on critical systems."
            })

        # Platform metrics
        behavioral_signals = {
            "hackathons_completed": random.randint(0, 4),
            "open_source_contributions": random.randint(0, 15),
            "leadership_roles": random.randint(0, 2),
            "platform_commits": random.randint(20, 800),
            "active_days_per_month": random.randint(2, 22)
        }

        candidates.append({
            "id": f"CAND_{i:03d}",
            "name": name,
            "email": email,
            "technical_skills": tech_skills,
            "soft_skills": soft_skills,
            "education": education,
            "years_of_experience": years_exp,
            "certifications": certifications,
            "achievements": achievements,
            "work_experience": work_experience,
            "projects": projects,
            "behavioral_signals": behavioral_signals
        })
        
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(candidates, f, indent=4, ensure_ascii=False)
    print(f"Generated {num_candidates} candidate profiles at {output_path}")

if __name__ == "__main__":
    generate_dataset()
