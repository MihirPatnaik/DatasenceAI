// generate_docx.js
import fs from 'fs';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, HeadingLevel } from "docx";

// Create document
const doc = new Document({
    sections: [{
        properties: {},
        children: [
            new Paragraph({
                text: "Offline-First HIV Injection Tracker",
                heading: HeadingLevel.TITLE,
                thematicBreak: true,
            }),
            new Paragraph({
                text: "Hybrid Biometrics (Face + Fingerprint) Proposal",
                spacing: { after: 300 },
            }),

            // Section 1: USP
            new Paragraph({ text: "1. Unique Selling Propositions (USP)", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: "🔐 Hybrid Biometric Support: Facial Recognition (Android camera + PC webcam), Fingerprint (Android sensor or optional external scanner)" }),
            new Paragraph({ text: "📱 Offline-First Design: Fully functional without internet, auto-syncs when connectivity is available" }),
            new Paragraph({ text: "💻 Device Compatibility: Minimum Android 8.0, Webcam support for PC/laptops" }),
            new Paragraph({ text: "🏥 HIV-Focused Dashboard: Tracks Last Injection Date, Next Due, Current Medication, Missed Dose Alerts" }),

            // Section 2: Basic Package Table
            new Paragraph({ text: "2. Quotation - Prototype (Without External Fingerprint Device)", heading: HeadingLevel.HEADING_1 }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph("Item")] }),
                        new TableCell({ children: [new Paragraph("Description")] }),
                        new TableCell({ children: [new Paragraph("Price (USD)")] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph("Software Development & Customization")] }),
                        new TableCell({ children: [new Paragraph("Android + PC/Web Dashboard + Offline DB + Facial Recognition")] }),
                        new TableCell({ children: [new Paragraph("$2,000")] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph("Implementation & Training")] }),
                        new TableCell({ children: [new Paragraph("Clinic deployment + nurse training")] }),
                        new TableCell({ children: [new Paragraph("$500")] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph("Hosting & Database Setup (1 Year)")] }),
                        new TableCell({ children: [new Paragraph("Offline-first local DB with optional cloud sync")] }),
                        new TableCell({ children: [new Paragraph("$500")] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph("Miscellaneous / Contingency")] }),
                        new TableCell({ children: [new Paragraph("Testing, QA, documentation")] }),
                        new TableCell({ children: [new Paragraph("$500")] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph("Total Quotation (Clinic License)")] }),
                        new TableCell({ children: [new Paragraph("")] }),
                        new TableCell({ children: [new Paragraph("$3,500")] }),
                    ]}),
                ]
            }),

            // Section 3: Enhanced Package Table
            new Paragraph({ text: "3. Quotation - Prototype (With External Fingerprint Device)", heading: HeadingLevel.HEADING_1 }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph("Item")] }),
                        new TableCell({ children: [new Paragraph("Description")] }),
                        new TableCell({ children: [new Paragraph("Price (USD)")] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph("Software Development & Customization")] }),
                        new TableCell({ children: [new Paragraph("Android + PC/Web Dashboard + Offline DB + Facial + Fingerprint")] }),
                        new TableCell({ children: [new Paragraph("$2,200")] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph("Implementation & Training")] }),
                        new TableCell({ children: [new Paragraph("Clinic deployment + nurse training")] }),
                        new TableCell({ children: [new Paragraph("$500")] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph("Hosting & Database Setup (1 Year)")] }),
                        new TableCell({ children: [new Paragraph("Offline-first local DB with optional cloud sync")] }),
                        new TableCell({ children: [new Paragraph("$500")] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph("External Fingerprint Device")] }),
                        new TableCell({ children: [new Paragraph("Mantra MFS100 / Futronic FS80 + shipping & taxes")] }),
                        new TableCell({ children: [new Paragraph("$100")] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph("Miscellaneous / Contingency")] }),
                        new TableCell({ children: [new Paragraph("Testing, QA, documentation")] }),
                        new TableCell({ children: [new Paragraph("$500")] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph("Total Quotation (Clinic License)")] }),
                        new TableCell({ children: [new Paragraph("")] }),
                        new TableCell({ children: [new Paragraph("$3,800")] }),
                    ]}),
                ]
            }),

            // Section 4: Technical Specs
            new Paragraph({ text: "4. Technical Specifications & Notes", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: "• Android Version: Minimum Android 8.0 (Oreo)" }),
            new Paragraph({ text: "• PC Requirements: Webcam support for facial recognition" }),
            new Paragraph({ text: "• Connectivity: Offline-first architecture with optional cloud sync" }),
            new Paragraph({ text: "• Package Inclusions: Complete offline support, External webcam support, Comprehensive training, 1 year hosting & DB maintenance" }),

            // Section 5: Pilot Strategy
            new Paragraph({ text: "5. Recommended Pilot Strategy", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: "Phase 1: MVP Deployment – Deploy Face + Fingerprint MVP in 1-2 rural clinics for initial testing." }),
            new Paragraph({ text: "Phase 2: Selective Scaling – Scale to additional clinics with optional external fingerprint scanners." }),
            new Paragraph({ text: "Phase 3: National Integration – Connect multiple clinics into centralized national HIV tracking system." }),

            new Paragraph({ text: "💡 Additional Note: Additional hardware (fingerprint scanners / Android tablets) can be provided at extra cost if needed.", spacing: { before: 300 } }),
        ]
    }]
});

// Generate and save DOCX
Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("HIV_Biometric_Proposal.docx", buffer);
    console.log("✅ DOCX generated successfully at HIV_Biometric_Proposal.docx");
});
