import argparse
import sys
import os
import pandas as pd
from typing import Tuple

class SubmissionValidator:
    """Automates sanity checks and structural schema audits for India Runs submissions."""

    def __init__(self, file_path: str):
        self.file_path = file_path

    def validate_file(self) -> Tuple[bool, List[str]]:
        """
        Runs detailed validations on the excel report file.
        
        Returns:
            Tuple[bool, List[str]]: Flag indicating success, and list of diagnostic errors/logs.
        """
        logs = []
        if not os.path.exists(self.file_path):
            return False, [f"Validation critical error: File {self.file_path} not found."]

        try:
            # 1. Load sheets
            xls = pd.ExcelFile(self.file_path)
            sheets = xls.sheet_names
            logs.append(f"Loaded workbook successfully containing sheets: {', '.join(sheets)}")
            
            required_sheets = ["Top 10 Candidates", "Top 25 Candidates", "Top 50 Candidates", "Top 100 Candidates"]
            missing_sheets = [s for s in required_sheets if s not in sheets]
            
            if missing_sheets:
                logs.append(f"❌ Structural Fail: Missing mandatory submission sheets: {', '.join(missing_sheets)}")
                return False, logs
            else:
                logs.append("✅ Structure Pass: All required slice tabs are present.")

            # 2. Inspect sheets data and sizes
            for sname in required_sheets:
                df = pd.read_sheet(xls, sheet_name=sname) if hasattr(xls, 'read_sheet') else pd.read_excel(xls, sheet_name=sname)
                
                # Check headers
                required_cols = ["Rank", "ID", "Name", "Score", "Technical Match"]
                missing_cols = [c for c in required_cols if c not in df.columns]
                
                if missing_cols:
                    logs.append(f"❌ Schema Fail in sheet '{sname}': Missing columns: {', '.join(missing_cols)}")
                    return False, logs

                # Check lengths
                expected_len = int(sname.split()[1]) # e.g. "Top 10 Candidates" -> 10
                actual_len = len(df)
                if actual_len != expected_len:
                    logs.append(f"⚠️ Warning in sheet '{sname}': Row count ({actual_len}) does not match expected size ({expected_len}).")
                else:
                    logs.append(f"✅ Data Count Pass: '{sname}' contains correct record count ({actual_len}).")

            # 3. Check values ranges
            df_top100 = pd.read_excel(xls, sheet_name="Top 100 Candidates")
            ranks = df_top100["Rank"].tolist()
            if ranks != list(range(1, len(ranks) + 1)):
                logs.append("⚠️ Warning: Ranks sequence in 'Top 100 Candidates' is not strictly sequential from 1 to N.")
            else:
                logs.append("✅ Rank Sequence Pass: Ranks are perfectly structured and sequential.")

            logs.append("🎉 Overall Verification Result: SUCCESS! Excel submission matches standard validation schemas.")
            return True, logs

        except Exception as e:
            logs.append(f"❌ Processing exception occurred during validation: {e}")
            return False, logs

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TalentMind-AI Pre-submission Validation Script")
    parser.add_argument("--report", type=str, default="outputs/talentmind_rankings_top100.xlsx", help="Path to XLSX report")
    args = parser.parse_args()

    print("==========================================")
    print(" TalentMind-AI Validation Auditor ")
    print("==========================================")
    
    validator = SubmissionValidator(args.report)
    success, logs = validator.validate_file()
    
    for log in logs:
        print(log)
        
    print("==========================================")
    sys.exit(0 if success else 1)
