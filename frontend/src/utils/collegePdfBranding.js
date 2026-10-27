import { RIT_LOGO_BASE64 } from '../assets/ritLogoBase64.js';

/**
 * College PDF Branding & Border Layout Engine
 * Derived directly from Document/BORDER.docx and Document/RIT logo (black).png
 * 
 * Specifications from BORDER.docx:
 * - Page Border: 24 pt inset from all edges (offsetFrom: page, space: 24, sz: 8 -> 1pt solid black)
 * - Header: Top-left official RIT logo (3135x701 aspect ratio 4.47)
 * - College Identification: Rajalakshmi Institute of Technology, Kuthambakkam, Chennai
 * - Watermark: Centered institutional watermark with subtle opacity (0.05) to avoid obscuring text
 * - Footer: Institutional provenance and page numbering
 */

export const COLLEGE_BRANDING = {
    institutionName: 'RAJALAKSHMI INSTITUTE OF TECHNOLOGY',
    subHeader: 'An Autonomous Institution | Affiliated to Anna University, Chennai',
    address: 'Kuthambakkam, Chennai - 600 124, Tamil Nadu, India',
    borderInsetPt: 24,
    borderWidthPt: 1.0,
    headerHeightPt: 75,
    footerHeightPt: 36,
    contentMarginPt: 36,
    logoWidthPt: 110,
    logoHeightPt: 24.6, // preserves 4.47 aspect ratio
};

/**
 * Applies official RIT border, top-left logo, watermark, and footer to a jsPDF page.
 * Call this in jspdf-autotable's `didDrawPage` hook or directly when generating pages.
 */
export function applyCollegePageLayout(doc, options = {}) {
    const {
        title = 'OFFICIAL INSTITUTIONAL REPORT',
        documentSubtitle = '',
        pageNumber = 1,
        totalPages = 1,
        includeHeader = true,
        includeWatermark = true,
        generatedAt = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } = options;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Exact Border from BORDER.docx (24pt inset from page edges, 1pt solid black)
    doc.saveGraphicsState();
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(COLLEGE_BRANDING.borderWidthPt);
    doc.rect(
        COLLEGE_BRANDING.borderInsetPt,
        COLLEGE_BRANDING.borderInsetPt,
        pageWidth - (COLLEGE_BRANDING.borderInsetPt * 2),
        pageHeight - (COLLEGE_BRANDING.borderInsetPt * 2)
    );
    doc.restoreGraphicsState();

    // 2. Subtle Centered Institutional Watermark (opacity 0.05)
    if (includeWatermark && RIT_LOGO_BASE64) {
        doc.saveGraphicsState();
        try {
            if (doc.GState) {
                doc.setGState(new doc.GState({ opacity: 0.05 }));
            }
            const wmWidth = Math.min(pageWidth * 0.72, 420);
            const wmHeight = wmWidth / 4.47;
            const wmX = (pageWidth - wmWidth) / 2;
            const wmY = (pageHeight - wmHeight) / 2;
            doc.addImage(RIT_LOGO_BASE64, 'PNG', wmX, wmY, wmWidth, wmHeight);
        } catch (_e) {
            /* ignore watermark render error */
        }
        doc.restoreGraphicsState();
    }

    // 3. Official Header
    if (includeHeader) {
        doc.saveGraphicsState();
        
        // 3a. Top-Left Official RIT Logo
        if (RIT_LOGO_BASE64) {
            try {
                doc.addImage(
                    RIT_LOGO_BASE64,
                    'PNG',
                    COLLEGE_BRANDING.contentMarginPt,
                    30,
                    COLLEGE_BRANDING.logoWidthPt,
                    COLLEGE_BRANDING.logoHeightPt
                );
            } catch (_e) {
                // Fallback text if image fail
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.setTextColor(11, 44, 107);
                doc.text('RIT CHENNAI', COLLEGE_BRANDING.contentMarginPt, 45);
            }
        }

        // 3b. Institution Identity (Right aligned in header)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(20, 20, 20);
        doc.text(COLLEGE_BRANDING.institutionName, pageWidth - COLLEGE_BRANDING.contentMarginPt, 35, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(90, 90, 90);
        doc.text(COLLEGE_BRANDING.subHeader, pageWidth - COLLEGE_BRANDING.contentMarginPt, 44, { align: 'right' });
        doc.text(COLLEGE_BRANDING.address, pageWidth - COLLEGE_BRANDING.contentMarginPt, 52, { align: 'right' });

        // 3c. Document Subtitle & Generation timestamp banner
        doc.setDrawColor(210, 215, 225);
        doc.setLineWidth(0.75);
        doc.line(COLLEGE_BRANDING.contentMarginPt, 58, pageWidth - COLLEGE_BRANDING.contentMarginPt, 58);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(11, 44, 107);
        doc.text(title.toUpperCase(), COLLEGE_BRANDING.contentMarginPt, 68);

        if (documentSubtitle) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(documentSubtitle, COLLEGE_BRANDING.contentMarginPt, 76);
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(120, 120, 120);
        doc.text(`Generated: ${generatedAt}`, pageWidth - COLLEGE_BRANDING.contentMarginPt, 68, { align: 'right' });

        doc.setDrawColor(11, 44, 107);
        doc.setLineWidth(1.2);
        doc.line(COLLEGE_BRANDING.contentMarginPt, 80, pageWidth - COLLEGE_BRANDING.contentMarginPt, 80);

        doc.restoreGraphicsState();
    }

    // 4. Official Footer
    doc.saveGraphicsState();
    const footerY = pageHeight - COLLEGE_BRANDING.borderInsetPt - 12;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(COLLEGE_BRANDING.contentMarginPt, footerY - 8, pageWidth - COLLEGE_BRANDING.contentMarginPt, footerY - 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text('Rajalakshmi Institute of Technology • Digital Twin Academic ERP System', COLLEGE_BRANDING.contentMarginPt, footerY);

    const pageStr = totalPages > 1 ? `Page ${pageNumber} of ${totalPages}` : `Page ${pageNumber}`;
    doc.setFillColor(255, 255, 255);
    try {
        doc.rect(pageWidth - COLLEGE_BRANDING.contentMarginPt - 85, footerY - 9, 85, 12, 'F');
    } catch (_e) {
        // Ignore minor rect fill error during mock rendering
    }
    doc.setTextColor(100, 100, 100);
    doc.text(pageStr, pageWidth - COLLEGE_BRANDING.contentMarginPt, footerY, { align: 'right' });
    doc.restoreGraphicsState();
}

/**
 * Creates and initializes a jsPDF instance configured with standard Letter dimensions and margins.
 */
export function createBrandedJsPdf(options = {}) {
    const {
        orientation = 'portrait',
        format = 'letter',
        unit = 'pt'
    } = options;

    return import('jspdf').then(({ default: jsPDF }) => {
        return new jsPDF({
            orientation,
            unit,
            format,
            compress: true
        });
    });
}
