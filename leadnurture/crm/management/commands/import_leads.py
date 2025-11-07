from django.core.management.base import BaseCommand
from crm.models import Lead
import pandas as pd
from datetime import datetime
from decimal import Decimal, InvalidOperation
import re


class Command(BaseCommand):
    help = "Import leads from Excel CRM file"

    def add_arguments(self, parser):
        parser.add_argument("filepath", type=str, help="Path to CRM Excel file")

    def clean_amount(self, value):
        """Convert strings like '75,00,000' or '7,50,000' to Decimal('7500000')"""
        if pd.isna(value) or value in ["nan", "", None]:
            return None

        # Convert to string and remove commas, spaces, quotes
        s = str(value).replace(",", "").replace("₹", "").replace(" ", "").strip()

        # Handle Excel scientific notation or text
        try:
            return Decimal(s)
        except InvalidOperation:
            # Try extracting digits and decimal parts manually
            s = re.sub(r"[^\d.]", "", s)
            if not s:
                return None
            try:
                return Decimal(s)
            except InvalidOperation:
                return None

    def handle(self, *args, **options):
        filepath = options["filepath"]
        df = pd.read_excel(filepath)

        created, skipped = 0, 0
        for _, row in df.iterrows():
            try:
                lead, created_flag = Lead.objects.get_or_create(
                    lead_id=str(row["Lead ID"]).strip(),
                    defaults={
                        "name": row.get("Lead name", ""),
                        "email": row.get("Email", ""),
                        "country_code": str(row.get("Country code", "")),
                        "phone": str(row.get("Phone", "")),
                        "project_name": row.get("Project name", ""),
                        "unit_type": row.get("Unit type", ""),
                        "min_budget": self.clean_amount(row.get("Min. Budget")),
                        "max_budget": self.clean_amount(row.get("Max Budget")),
                        "lead_status": row.get("Lead status", ""),
                        "last_conversation_date": (
                            pd.to_datetime(row.get("Last conversation date"), errors="coerce").date()
                            if not pd.isna(row.get("Last conversation date"))
                            else None
                        ),
                        "last_conversation_summary": row.get("Last conversation summary", ""),
                    },
                )
                if created_flag:
                    created += 1
                else:
                    skipped += 1
            except Exception as e:
                self.stderr.write(f"Error importing lead {row['Lead ID']}: {e}")

        self.stdout.write(self.style.SUCCESS(f"Imported: {created}, Skipped: {skipped}"))
